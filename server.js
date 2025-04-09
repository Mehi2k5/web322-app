/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party websites) or distributed to other students.
* 
*  Name: Huynh Huy Hoang Student ID: 151569233 Date: 09/04/2025
*
*  Replit Web App URL: https://replit.com/@12Huynh/web322-app
* 
*  GitHub Repository URL: https://github.com/Mehi2k5/web322-app
********************************************************************************/ 

require("dotenv").config();
const express = require("express");
const path = require("path");
const storeService = require("./store-service");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const itemData = require("./store-service");
const dotenv = require('dotenv').config();
const router = express.Router(); 


const app = express();
const PORT = process.env.PORT || 8080;

// Cloudinary Configuration (Now Using Environment Variables)
cloudinary.config({
    cloud_name: 'det9qwo2u',
    api_key: '481283333174631',
    api_secret: '_dRPlzLOp7INSziETIi6qGXsdvM',
    secure: true
});

// Multer Upload Middleware
const upload = multer();

// Set EJS as the view engine
app.set("view engine", "ejs");

// Middleware for form handling
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (CSS, images, etc.)
app.use(express.static("public"));

// Home route → Redirect to /shop
app.get("/", (req, res) => {
    res.redirect("/shop");
});

// About page
app.get("/about", (req, res) => {
    res.render("about");
});

// Add Item Page
app.get("/items/add", (req, res) => {
    res.render("addPost"); // Make sure this matches your actual EJS filename
});

// Get all published items
app.get("/shop", (req, res) => {
    storeService.getAllItems()
        .then(items => res.json(items.filter(item => item.published)))
        .catch(err => res.status(500).json({ message: "Error retrieving items", error: err }));
});

// Get items with optional filters

app.get("/items", (req, res) => {
    const { category, minDate } = req.query;

    let fetchItems;
    if (category) {
        console.log(`Fetching items by category: ${category}`);
        fetchItems = storeService.getItemsByCategory(category);
    } else if (minDate) {
        console.log(`Fetching items after date: ${minDate}`);
        fetchItems = storeService.getItemsByMinDate(minDate);
    } else {
        console.log("Fetching all items");
        fetchItems = storeService.getAllItems();
    }

    fetchItems
        .then(items => {
            console.log(`Found ${items.length} items`);
            if (items.length > 0) {
                res.render("items", { items });  // Renders "items" if data exists
            } else {
                res.render("items", { message: "No results found" });  // Shows message if no data
            }
        })
        .catch(err => {
            console.error("Error fetching items:", err);
            res.render("items", { message: "Error fetching items" });  // Show error message if promise rejected
        });
});




// Get single item by ID
app.get("/item/:id", (req, res) => {
    storeService.getItemById(req.params.id)
        .then(item => item ? res.json(item) : res.status(404).json({ message: "Item not found" }))
        .catch(err => res.status(500).json({ message: "Error retrieving item", error: err }));
});

// Get all categories
app.get("/categories", (req, res) => {
    Category.findAll() // Adjust to fetch categories from your DB
        .then((categories) => {
            if (categories.length > 0) {
                res.render("categories", { categories });
            } else {
                res.render("categories", { message: "No results found" });
            }
        })
        .catch((error) => {
            res.render("categories", { message: "Error fetching categories" });
        });
});

// Route for displaying the store page
app.get("/store", (req, res) => {
    const category = req.query.category; // Get category from query parameters

    // Check if a category is selected and call the corresponding function
    if (category) {
        storeService.getPublishedItemsByCategory(category)
            .then((items) => {
                res.render("store", { 
                    items: items,
                    category: category // Pass the category to the view if it’s filtered
                });
            })
            .catch((error) => {
                res.render("store", { message: "No items found for this category" });
            });
    } else {
        // If no category is selected, render all published items
        storeService.getPublishedItems()
            .then((items) => {
                res.render("store", { items: items });
            })
            .catch((error) => {
                res.render("store", { message: "No items available" });
            });
    }
});

app.get('/shop/:id', (req, res) => {
    const postId = req.params.id;  // Get the item ID from the URL parameter
    const category = req.query.category;  // Get the category from the query params

    // Get the post by ID
    itemData.getItemById(postId)
        .then(post => {
            // Get all posts and categories for the sidebar
            itemData.getPublishedItems()
                .then(posts => {
                    itemData.getCategories()
                        .then(categories => {
                            // Pass the data to the 'shop.ejs' template
                            res.render('shop', {
                                post: post,
                                posts: posts,
                                categories: categories,
                                message: null,  // No error message here
                                viewingCategory: category || 'All'  // Show 'All' if no category is selected
                            });
                        })
                        .catch(err => {
                            res.render('shop', {
                                message: 'Error fetching categories.',
                                post: null,
                                posts: [],
                                categories: [],
                                viewingCategory: category || 'All'
                            });
                        });
                })
                .catch(err => {
                    res.render('shop', {
                        message: 'Error fetching posts.',
                        post: null,
                        posts: [],
                        categories: [],
                        viewingCategory: category || 'All'
                    });
                });
        })
        .catch(err => {
            res.render('shop', {
                message: 'Item not found.',
                post: null,
                posts: [],
                categories: [],
                viewingCategory: category || 'All'
            });
        });
});

// Handle adding items with image upload
app.post("/items/add", upload.single("featureImage"), (req, res) => {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => result ? resolve(result) : reject(error)
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            return await streamUpload(req);
        }

        upload(req).then(uploaded => processItem(uploaded.url))
                   .catch(error => res.status(500).send("Error uploading image"));
    } else {
        processItem("");
    }

    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;
        storeService.addItem(req.body)
            .then(() => res.redirect("/items"))
            .catch(err => res.status(500).json({ message: "Error adding item", error: err }));
    }
});

app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});


// 404 Route
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// Catch-all route for handling 404 errors
app.use((req, res, next) => {
    res.status(404).render('404');  // Render the 404.ejs template
});

// Start Server After Initializing Data
storeService.initialize()
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(error => console.error("Error initializing store data:", error));

// Helper function
function formatDate(dateObj) {
    let year = dateObj.getFullYear();
    let month = (dateObj.getMonth() + 1).toString();
    let day = dateObj.getDate().toString();
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Middleware to make it available in all EJS views
app.use((req, res, next) => {
    res.locals.formatDate = formatDate;
    next();
});

// Route to show the form for adding a new category
app.get("/categories/add", (req, res) => {
    res.render("addCategory"); // Ensure you have an addCategory.ejs for this view
});

// Route to handle adding a new category via POST
app.post("/categories/add", (req, res) => {
    const { name, description } = req.body;  // Adjust field names based on your form inputs
    storeService.addCategory({ name, description })
        .then(() => res.redirect("/categories"))
        .catch(err => res.status(500).json({ message: "Error adding category", error: err }));
});

// Route to get all categories
app.get("/categories", (req, res) => {
    Category.findAll()  // Replace with your actual method to fetch categories from your DB
        .then((categories) => {
            if (categories.length > 0) {
                res.render("categories", { categories });
            } else {
                res.render("categories", { message: "No results found" });
            }
        })
        .catch((error) => {
            res.render("categories", { message: "Error fetching categories" });
        });
});

// Route to handle deleting a category by ID
app.get("/categories/delete/:id", (req, res) => {
    const categoryId = req.params.id;
    storeService.deleteCategoryById(categoryId)  // Implement this function in your store-service
        .then(() => res.redirect("/categories"))
        .catch((err) => res.status(500).send("Unable to Remove Category / Category not found"));
});

// Route to handle deleting an item by ID (similar to category delete)
app.get("/items/delete/:id", (req, res) => {
    const itemId = req.params.id;
    storeService.deleteItemById(itemId)  // Implement this function in your store-service
        .then(() => res.redirect("/items"))
        .catch((err) => res.status(500).send("Unable to Remove Item / Item not found"));
});


// Route to render the addPost view
router.get('/items/add', (req, res) => {
    // Call the store-service to get categories
    storeService.getCategories()
        .then((categories) => {
            // If categories are fetched successfully, pass them to the view
            res.render('addPost', { categories: categories });
        })
        .catch((err) => {
            // If there's an error, render the addPost view with an empty categories array
            res.render('addPost', { categories: [] });
        });
});

module.exports = router;

// Route to delete a post by its ID
app.get('/Items/delete/:id', (req, res) => {
    const postId = req.params.id;

    // Call the deletePostById function
    storeService.deletePostById(postId)
        .then(() => {
            // Redirect to the list of posts after successful deletion
            res.redirect('/Items');
        })
        .catch(err => {
            // If error occurs, return a 500 status with an error message
            res.status(500).send('Unable to Remove Post / Post not found');
        });
});