const fs = require('fs').promises;
const path = require('path');

const PROPERTIES_FILE = path.join(__dirname, 'properties.json');
const TEMPLATE_FILE = path.join(__dirname, 'properties.template.json');

async function viewProperties(req, res) {
    try {
        const {
            location = '',
            type = '',
            maxPrice = '',
            sort = 'default'
        } = req.query;

        // Check that all inputs are strings
        if ([location, type, maxPrice, sort].some(value => typeof value !== 'string')) {
            return res.status(400).json({
                message: 'Invalid search parameters.'
            });
        }

        // Validate property type and sorting
        const validTypes = ['', 'HDB', 'Condo', 'Landed', 'Apartment'];
        const validSorts = ['default', 'price-low', 'price-high'];

        if (!validTypes.includes(type)) {
            return res.status(400).json({
                message: 'Invalid property type.'
            });
        }

        if (!validSorts.includes(sort)) {
            return res.status(400).json({
                message: 'Invalid sorting option.'
            });
        }

        // Validate maximum price
        if (
            maxPrice !== '' &&
            (!Number.isFinite(Number(maxPrice)) || Number(maxPrice) <= 0)
        ) {
            return res.status(400).json({
                message: 'Maximum price must be greater than 0.'
            });
        }

        // Retrieve data from JSON file
        let properties = [];

        try {
            const data = await fs.readFile(PROPERTIES_FILE, 'utf8');
            properties = JSON.parse(data);

        } catch (error) {
            if (error.code === 'ENOENT') {
                const data = await fs.readFile(TEMPLATE_FILE, 'utf8');
                properties = JSON.parse(data);
            } else {
                throw error;
            }
        }

        if (!Array.isArray(properties)) {
            throw new Error('Property data must be an array.');
        }

        // Filter by location
        if (location.trim() !== '') {
            properties = properties.filter(property =>
                property.location.toLowerCase().includes(
                    location.trim().toLowerCase()
                )
            );
        }

        // Filter by property type
        if (type !== '') {
            properties = properties.filter(property =>
                property.type === type
            );
        }

        // Filter by maximum price
        if (maxPrice !== '') {
            properties = properties.filter(property =>
                Number(property.price) <= Number(maxPrice)
            );
        }

        // Sort by price
        if (sort === 'price-low') {
            properties.sort((a, b) => a.price - b.price);
        }

        if (sort === 'price-high') {
            properties.sort((a, b) => b.price - a.price);
        }

        return res.status(200).json({
            message: 'Properties retrieved successfully.',
            count: properties.length,
            properties: properties
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Unable to retrieve properties.'
        });
    }
}

module.exports = { viewProperties };