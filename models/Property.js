
class Property {

    constructor(title, location, price, type, bedrooms, description) {

        this.title = title;
        this.location = location;
        this.price = price;
        this.type = type;
        this.bedrooms = bedrooms;
        this.description = description;

        // New properties start as available
        this.status = "Available";

        // Generate a unique property ID
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);

        this.id = timestamp + random.toString().padStart(3, '0');
    }
}

module.exports = { Property };
