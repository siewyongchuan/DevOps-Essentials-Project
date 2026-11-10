
const fs = require('fs').promises;
const path = require('path');
const { Property } = require('../models/Property');

const PROPERTIES_FILE = path.join(__dirname, 'properties.json');
const TEMPLATE_FILE = path.join(__dirname, 'properties.template.json');

async function addProperty(req, res) {
    try {
        const { title, location, price, type, bedrooms, description } = req.body;

        // Validate required fields
        if (
            typeof title !== 'string' || !title.trim() ||
            typeof location !== 'string' || !location.trim() ||
            typeof type !== 'string' || !type.trim() ||
            typeof description !== 'string' || !description.trim() ||
            price === undefined || price === null || price === '' ||
            bedrooms === undefined || bedrooms === null || bedrooms === ''
        ) {
            return res.status(400).json({
                message: 'All property fields are required.'
            });
        }

        // Validate price and bedrooms
        const propertyPrice = Number(price);
        const propertyBedrooms = Number(bedrooms);

        if (!Number.isFinite(propertyPrice) || propertyPrice <= 0) {
            return res.status(400).json({
                message: 'Price must be greater than 0.'
            });
        }

        if (!Number.isInteger(propertyBedrooms) || propertyBedrooms < 0) {
            return res.status(400).json({
                message: 'Bedrooms must be a valid non-negative whole number.'
            });
        }

        // Read existing JSON data
        let properties = [];

        try {
            const data = await fs.readFile(PROPERTIES_FILE, 'utf8');
            properties = JSON.parse(data);

        } catch (error) {
            if (error.code === 'ENOENT') {
                const template = await fs.readFile(TEMPLATE_FILE, 'utf8');
                properties = JSON.parse(template);
            } else {
                throw error;
            }
        }

        if (!Array.isArray(properties)) {
            throw new Error('Property data must be an array.');
        }

        // Check for duplicate listings
        const duplicate = properties.some(property =>
            property.title.toLowerCase() === title.trim().toLowerCase() &&
            property.location.toLowerCase() === location.trim().toLowerCase()
        );

        if (duplicate) {
            return res.status(409).json({
                message: 'This property listing already exists.'
            });
        }

        // Create property using shared model
        const newProperty = new Property(
            title.trim(),
            location.trim(),
            propertyPrice,
            type.trim(),
            propertyBedrooms,
            description.trim()
        );

        // Ensure the generated ID is not already used
        if (properties.some(property => property.id === newProperty.id)) {
            return res.status(409).json({
                message: 'Property ID conflict. Please try again.'
            });
        }

        properties.push(newProperty);

        // Save into JSON
        await fs.writeFile(
            PROPERTIES_FILE,
            JSON.stringify(properties, null, 2),
            'utf8'
        );

        return res.status(201).json({
            message: 'Property added successfully!',
            property: newProperty
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Unable to add property.'
        });
    }
}

module.exports = { addProperty };