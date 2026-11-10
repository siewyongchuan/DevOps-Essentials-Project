const deleteModal = document.getElementById('deletePropertyModal');
const confirmDeleteButton = document.getElementById('confirmDeleteButton');
const cancelDeleteButton = document.getElementById('cancelDeleteButton');
const deleteMessage = document.getElementById('deletePropertyMessage');

let selectedPropertyId = null;

// Open delete popup
window.openDeleteModal = function (id, title) {

    selectedPropertyId = String(id);

    document.getElementById('deletePropertyName').textContent =
        title || 'this property';

    deleteMessage.textContent = '';

    deleteModal.showModal();
};

// Close the popup
function closeDeleteModal() {
    deleteModal.close();
    selectedPropertyId = null;
}

// Cancel button
cancelDeleteButton.addEventListener('click', closeDeleteModal);

// Delete confirmation
confirmDeleteButton.addEventListener('click', async function () {

    if (!selectedPropertyId) {
        deleteMessage.textContent = 'No property selected.';
        return;
    }

    confirmDeleteButton.disabled = true;
    deleteMessage.textContent = 'Deleting property...';

    try {
        const response = await fetch(
            '/delete-property/' + encodeURIComponent(selectedPropertyId),
            {
                method: 'DELETE'
            }
        );

        const result = await response.json();

        if (!response.ok) {
            deleteMessage.textContent =
                result.message || 'Unable to delete property.';
            return;
        }

        closeDeleteModal();

        // Refresh cards when Read is integrated
        if (typeof viewProperties === 'function') {
            await viewProperties();
        }

        const formMessage = document.getElementById('deleteFormMessage');

        if (formMessage) {
            formMessage.textContent = result.message;
        }

    } catch (error) {
        console.error(error);

        deleteMessage.textContent =
            'Unable to connect to the server.';

    } finally {
        confirmDeleteButton.disabled = false;
    }
});

// Standalone form for testing on delete-branch
const deleteForm = document.getElementById('deletePropertyForm');

if (deleteForm) {
    deleteForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const id = document.getElementById('deletePropertyId').value.trim();
        const formMessage = document.getElementById('deleteFormMessage');

        if (!id) {
            formMessage.textContent = 'Please enter a Property ID.';
            return;
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
            formMessage.textContent = 'Invalid Property ID.';
            return;
        }

        window.openDeleteModal(id, 'Property ' + id);
    });
}