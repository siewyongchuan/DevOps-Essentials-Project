document.addEventListener('DOMContentLoaded', function () {

    // Display properties when the website loads
    viewProperties();

    // Search button
    document.getElementById('searchButton').addEventListener('click', function () {
        viewProperties();

        document.getElementById('properties').scrollIntoView({
            behavior: 'smooth'
        });
    });

    // Sorting dropdown
    document.getElementById('sortProperties').addEventListener('change', function () {
        viewProperties();
    });

});

async function viewProperties() { //Function to view properties. Get the location, type, maxprice, then sort

    const location = document.getElementById('searchLocation').value.trim();
    const type = document.getElementById('searchType').value;
    const maxPrice = document.getElementById('searchMaxPrice').value;
    const sort = document.getElementById('sortProperties').value;

    const propertyList = document.getElementById('property-list');
    const propertyCount = document.getElementById('propertyCount');
    const emptyState = document.getElementById('emptyState');

    // Frontend validation
    if (
        maxPrice !== '' &&
        (!Number.isFinite(Number(maxPrice)) || Number(maxPrice) <= 0)
    ) {
        alert('Please enter a valid maximum price.');
        return;
    }

    // Prepare search parameters
    const params = new URLSearchParams({
        location: location,
        type: type,
        maxPrice: maxPrice,
        sort: sort
    });

    try {
        propertyCount.textContent = 'Loading properties...';

        const response = await fetch(
            '/view-properties?' + params.toString()
        );

        const result = await response.json();

        if (!response.ok) {
            propertyCount.textContent = 'Unable to load properties.';
            alert(result.message || 'Something went wrong.');
            return;
        }

        // Clear previous cards
        propertyList.innerHTML = '';

        const properties = result.properties;

        propertyCount.textContent =
            properties.length + ' properties found';

        // No matching properties
        if (properties.length === 0) {
            emptyState.hidden = false;
            return;
        }

        emptyState.hidden = true;

        // Create one card for each property
        properties.forEach(property => {
            const card = createPropertyCard(property);
            propertyList.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        propertyCount.textContent = 'Unable to load properties.';
        alert('Unable to connect to the server.');
    }
}


// Generate a property card
function createPropertyCard(property) {

    const card = document.createElement('article');
    card.className = 'property-card';

    // Property image placeholder
    const image = document.createElement('div');
    image.className = 'property-image';

    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';

    const icon = document.createElement('span');
    icon.textContent = '⌂';

    const imageText = document.createElement('p');
    imageText.textContent = 'Property Image';

    placeholder.appendChild(icon);
    placeholder.appendChild(imageText);

    const badge = document.createElement('span');
    badge.className = 'property-badge';
    badge.textContent = property.type;

    image.appendChild(placeholder);
    image.appendChild(badge);

    // Property details
    const details = document.createElement('div');
    details.className = 'property-details';

    const title = document.createElement('h3');
    title.textContent = property.title;

    const location = document.createElement('p');
    location.className = 'property-location';
    location.textContent = property.location + ', Singapore';

    const description = document.createElement('p');
    description.className = 'property-description';
    description.textContent = property.description;

    // Property information
    const info = document.createElement('div');
    info.className = 'property-info';

    const bedrooms = document.createElement('span');
    bedrooms.textContent = property.bedrooms + ' Bedrooms';

    const type = document.createElement('span');
    type.textContent = property.type;

    info.appendChild(bedrooms);
    info.appendChild(type);

    // Price and status
    const footer = document.createElement('div');
    footer.className = 'property-footer';

    const price = document.createElement('span');
    price.className = 'property-price';
    price.textContent = '$' +
        Number(property.price).toLocaleString('en-SG');

    const status = document.createElement('span');
    status.className = 'property-status';
    status.textContent = property.status || 'Available';

    footer.appendChild(price);
    footer.appendChild(status);

    // Combine all elements
    details.appendChild(title);
    details.appendChild(location);
    details.appendChild(description);
    details.appendChild(info);
    details.appendChild(footer);

    card.appendChild(image);
    card.appendChild(details);


    // Allow users to click the property card to edit it
card.classList.add('editable-property-card');
card.setAttribute('role', 'button');
card.setAttribute('tabindex', '0');
card.setAttribute('aria-label', 'Edit ' + property.title);

card.addEventListener('click', function () {
    window.openUpdateModal(property);
});

// Allow keyboard users to open the popup
card.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        window.openUpdateModal(property);
    }
});

    return card;
}