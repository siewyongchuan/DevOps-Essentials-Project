var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();

const PORT = process.env.PORT || 5050;
var startPage = "index.html";

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//View Property by Qi Hoong
const { viewProperties } = require('./utils/QiHoongReadUtil');
app.get('/view-properties', viewProperties);

// Serve HTML, CSS, JS and images from public
app.use(express.static(path.join(__dirname, 'public')));

// Aaryan
const { addProperty } = require('./utils/AaryanCreateUtil');
app.post('/add-property', addProperty);


// Main homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', startPage));
});

// Start the server
const server = app.listen(PORT, function () {

    const address = server.address();

    const baseUrl =
        `http://${address.address == "::" ? 'localhost' : address.address}:${address.port}`;

    console.log(`HomeFinder running at: ${baseUrl}`);
});

// Export for future testing
module.exports = { app, server };
