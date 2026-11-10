const fs = require('fs').promises;
const path = require('path');

const PROPERTIES_FILE = path.join(__dirname, 'properties.json');

async function updateProperty(req, res) {
    try {
        const { id } = req.params;
        const { title, location, price, type, bedrooms, description } = req.body;

        // Check property ID
        if (!id || !id.trim()) {
            return res.status(400).json({
                message: 'Property ID is required.'
            });
        }

        // Check if at least one field is provided
        if (
            title === undefined &&
            location === undefined &&
            price === undefined &&
            type === undefined &&
            bedrooms === undefined &&
            description === undefined
        ) {
            return res.status(400).json({
                message: 'Please provide at least one field to update.'
            });
        }

        // Validate text fields
        const textFields = { title, location, type, description };

        for (const [field, value] of Object.entries(textFields)) {
            if (value !== undefined &&
                (typeof value !== 'string' || !value.trim())) {
                return res.status(400).json({
                    message: `Invalid ${field}.`
                });
            }
        }

        // Validate price
        if (
            price !== undefined &&
            (price === null || price === '' ||
                !Number.isFinite(Number(price)) ||
                Number(price) <= 0)
        ) {
            return res.status(400).json({
                message: 'Price must be greater than 0.'
            });
        }

        // Validate bedrooms
        if (
            bedrooms !== undefined &&
            (bedrooms === null || bedrooms === '' ||
                !Number.isInteger(Number(bedrooms)) ||
                Number(bedrooms) < 0)
        ) {
            return res.status(400).json({
                message: 'Bedrooms must be a non-negative whole number.'
            });
        }

        // Read JSON database
        let properties = [];

        try {
            const data = await fs.readFile(PROPERTIES_FILE, 'utf8');
            properties = JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                return res.status(404).json({
                    message: 'No property listings found.'
                });
            }
            throw error;
        }

        if (!Array.isArray(properties)) {
            throw new Error('Property data must be an array.');
        }

        // Find property using its ID
        const propertyIndex = properties.findIndex(
            property => String(property.id) === String(id)
        );

        if (propertyIndex === -1) {
            return res.status(404).json({
                message: 'Property not found.'
            });
        }

        // Update only provided fields
        const property = properties[propertyIndex];

        if (title !== undefined) property.title = title.trim();
        if (location !== undefined) property.location = location.trim();
        if (price !== undefined) property.price = Number(price);
        if (type !== undefined) property.type = type.trim();
        if (bedrooms !== undefined) property.bedrooms = Number(bedrooms);
        if (description !== undefined) property.description = description.trim();

        // Save updated properties
        await fs.writeFile(
            PROPERTIES_FILE,
            JSON.stringify(properties, null, 2),
            'utf8'
        );

        return res.status(200).json({
            message: 'Property updated successfully!',
            property: property
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Unable to update property.'
        });
    }
}

module.exports = { updateProperty };