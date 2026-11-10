const editModal = document.getElementById('editPropertyModal');
const updateForm = document.getElementById('updatePropertyForm');
const updateMessage = document.getElementById('updatePropertyMessage');

// Open popup and fill in existing property details
window.openUpdateModal = function (property) {

    document.getElementById('updatePropertyId').value = property.id;
    document.getElementById('updateTitle').value = property.title;
    document.getElementById('updateLocation').value = property.location;
    document.getElementById('updatePrice').value = property.price;
    document.getElementById('updateType').value = property.type;
    document.getElementById('updateBedrooms').value = property.bedrooms;
    document.getElementById('updateDescription').value = property.description;

    updateMessage.textContent = '';

    editModal.showModal();
};

// Close popup
function closeUpdateModal() {
    editModal.close();
}

document.getElementById('closeEditModal')
    .addEventListener('click', closeUpdateModal);

document.getElementById('cancelEditModal')
    .addEventListener('click', closeUpdateModal);

// Close when clicking outside the popup content
editModal.addEventListener('click', function (event) {
    if (event.target === editModal) {
        closeUpdateModal();
    }
});

// Save changes
updateForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const id = document.getElementById('updatePropertyId').value;

    const propertyData = {
        title: document.getElementById('updateTitle').value.trim(),
        location: document.getElementById('updateLocation').value.trim(),
        price: document.getElementById('updatePrice').value,
        type: document.getElementById('updateType').value,
        bedrooms: document.getElementById('updateBedrooms').value,
        description: document.getElementById('updateDescription').value.trim()
    };

    // Validate required fields
    if (
        !propertyData.title ||
        !propertyData.location ||
        !propertyData.type ||
        !propertyData.description ||
        propertyData.price === '' ||
        propertyData.bedrooms === ''
    ) {
        updateMessage.textContent = 'Please fill in all fields.';
        return;
    }

    // Validate price
    if (
        !Number.isFinite(Number(propertyData.price)) ||
        Number(propertyData.price) <= 0
    ) {
        updateMessage.textContent = 'Please enter a valid price.';
        return;
    }

    // Validate bedrooms
    if (
        !Number.isInteger(Number(propertyData.bedrooms)) ||
        Number(propertyData.bedrooms) < 0
    ) {
        updateMessage.textContent =
            'Please enter a valid number of bedrooms.';
        return;
    }

    const saveButton = updateForm.querySelector(
        'button[type="submit"]'
    );

    saveButton.disabled = true;
    updateMessage.textContent = 'Saving changes...';

    try {
        const response = await fetch(
            '/update-property/' + encodeURIComponent(id),
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(propertyData)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            updateMessage.textContent =
                result.message || 'Unable to update property.';
            return;
        }

        // Close popup after successful update
        closeUpdateModal();

        // Refresh displayed properties
        if (typeof viewProperties === 'function') {
            await viewProperties();
        }

    } catch (error) {
        console.error(error);
        updateMessage.textContent =
            'Unable to connect to the server.';

    } finally {
        saveButton.disabled = false;
    }
});