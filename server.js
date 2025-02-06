const express = require("express");
const path = require("path");
const storeService = require("./store-service"); // Require store-service module

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware to serve static files (CSS, images, etc.)
app.use(express.static("public"));

// Route for the home page ("/") → Redirect to "/about"
app.get("/", (req, res) => {
    res.redirect("/about");
});

// Route for "/about" → Serve the about.html file from the views folder
app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "about.html"));
});

// Route to get all published items
app.get("/shop", (req, res) => {
    storeService.getAllItems()
        .then(items => {
            const publishedItems = items.filter(item => item.published === true);
            res.json(publishedItems);
        })
        .catch(err => res.status(500).json({ message: "Error retrieving items", error: err }));
});

// Route to get all items
app.get("/items", (req, res) => {
    storeService.getAllItems()
        .then(items => res.json(items))
        .catch(err => res.status(500).json({ message: "Error retrieving items", error: err }));
});

// Route to get all categories
app.get("/categories", (req, res) => {
    storeService.getAllCategories()
        .then(categories => res.json(categories))
        .catch(err => res.status(500).json({ message: "Error retrieving categories", error: err }));
});

// 404 Route for unmatched URLs
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// Initialize the store data and start the server once it's ready
storeService.initialize()
    .then(() => {
        // The store data is ready, start the server
        app.listen(process.env.PORT || 8080, () => {
            console.log('Express http server listening on port ' + (process.env.PORT || 8080));
        });
    })
    .catch((error) => {
        // If initialization fails, log the error and do not start the server
        console.error('Error initializing store data:', error);
    });

