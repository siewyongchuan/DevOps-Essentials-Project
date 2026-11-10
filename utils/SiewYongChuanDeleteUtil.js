const fs = require('fs').promises;
const path = require('path');

const PROPERTIES_FILE = path.join(__dirname, 'properties.json');

async function deleteProperty(req, res) {
    try {
        const { id } = req.params;

        // Validate property ID
        if (!id || !id.trim()) {
            return res.status(400).json({
                message: 'Property ID is required.'
            });
        }

        // Check for invalid ID format
        if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
            return res.status(400).json({
                message: 'Invalid Property ID.'
            });
        }

        // Read properties from JSON
        let properties = [];

        try {
            const data = await fs.readFile(PROPERTIES_FILE, 'utf8');
            properties = JSON.parse(data);

        } catch (error) {
            if (error.code === 'ENOENT') {
                return res.status(404).json({
                    message: 'No properties found to delete.'
                });
            }
            throw error;
        }

        if (!Array.isArray(properties)) {
            throw new Error('Property data must be an array.');
        }

        // Find property by ID
        const propertyIndex = properties.findIndex(
            property => String(property.id) === String(id)
        );

        if (propertyIndex === -1) {
            return res.status(404).json({
                message: 'Property not found.'
            });
        }

        // Remove the selected property
        const deletedProperty = properties.splice(propertyIndex, 1)[0];

        // Save updated JSON
        await fs.writeFile(
            PROPERTIES_FILE,
            JSON.stringify(properties, null, 2),
            'utf8'
        );

        return res.status(200).json({
            message: 'Property deleted successfully!',
            property: deletedProperty
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Unable to delete property.'
        });
    }
}

module.exports = { deleteProperty };