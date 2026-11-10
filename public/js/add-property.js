
document.getElementById('addPropertyForm').addEventListener('submit', addProperty);

async function addProperty(event) {
    event.preventDefault();

    const message = document.getElementById('addPropertyMessage');

    const propertyData = {
        title: document.getElementById('propertyTitle').value.trim(),
        location: document.getElementById('propertyLocation').value.trim(),
        price: document.getElementById('propertyPrice').value,
        type: document.getElementById('propertyType').value,
        bedrooms: document.getElementById('propertyBedrooms').value,
        description: document.getElementById('propertyDescription').value.trim()
    };

    // Frontend validation
    if (
        !propertyData.title ||
        !propertyData.location ||
        !propertyData.type ||
        !propertyData.description ||
        propertyData.price === '' ||
        propertyData.bedrooms === ''
    ) {
        message.textContent = 'Please fill in all fields.';
        return;
    }

    if (!Number.isFinite(Number(propertyData.price)) ||
        Number(propertyData.price) <= 0) {
        message.textContent = 'Please enter a valid price.';
        return;
    }

    if (!Number.isInteger(Number(propertyData.bedrooms)) ||
        Number(propertyData.bedrooms) < 0) {
        message.textContent = 'Please enter a valid number of bedrooms.';
        return;
    }

    try {
        const response = await fetch('/add-property', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(propertyData)
        });

        const result = await response.json();

        message.textContent = result.message;

        if (response.ok) {
            document.getElementById('addPropertyForm').reset();
        }

    } catch (error) {
        console.error(error);
        message.textContent = 'Unable to connect to server.';
    }
}
