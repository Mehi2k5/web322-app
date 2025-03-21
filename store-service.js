const fs = require("fs");

let items = [];
let categories = [];

// Function to initialize and load data from JSON files
function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile("./data/items.json", "utf8", (err, data) => {
            if (err) {
                reject("Unable to read items.json file.");
                return;
            }
            items = JSON.parse(data);

            fs.readFile("./data/categories.json", "utf8", (err, data) => {
                if (err) {
                    reject("Unable to read categories.json file.");
                    return;
                }
                categories = JSON.parse(data);
                resolve("Data successfully initialized.");
            });
        });
    });
}

// Function to get all items
function getAllItems() {
    return new Promise((resolve, reject) => {
        console.log("Fetching items...");
        if (items.length > 0) {
            resolve(items);
        } else {
            reject("No results returned.");
        }
    });
}

// Function to get only published items
function getPublishedItems() {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published === true);
        if (publishedItems.length > 0) {
            resolve(publishedItems);
        } else {
            reject("No results returned.");
        }
    });
}

// Function to get all categories
function getAllCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories);
        } else {
            reject("No results returned.");
        }
    });
}

// Add item function
function addItem(itemData) {
    return new Promise((resolve, reject) => {
        // Ensure 'published' is defined
        itemData.published = itemData.published !== undefined ? itemData.published : false;

        // Set the ID of the new item
        itemData.id = items.length + 1;

        // Set the postDate to the current date in YYYY-MM-DD format
        itemData.postDate = new Date().toISOString().split('T')[0];  // "YYYY-MM-DD" format

        // Push the new item to the items array
        items.push(itemData);

        // Save the updated items array back to the JSON file
        fs.writeFile("./data/items.json", JSON.stringify(items, null, 2), "utf8", (err) => {
            if (err) {
                reject("Unable to save new item to items.json.");
                return;
            }
            resolve(itemData);  // Return the added item
        });
    });
}
// Function to get items by category
function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.category === parseInt(category)); // Filter items by category
        if (filteredItems.length > 0) {
            resolve(filteredItems); // Resolve the promise with filtered items if found
        } else {
            reject("No results returned."); // Reject the promise if no items match the category
        }
    });
}

// Function to get items by minimum date
function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        // Convert minDateStr to a Date object
        const minDate = new Date(minDateStr);

        // Filter items by postDate >= minDate
        const filteredItems = items.filter(item => new Date(item.postDate) >= minDate);

        if (filteredItems.length > 0) {
            resolve(filteredItems); // Resolve the promise with filtered items if found
        } else {
            reject("No results returned."); // Reject the promise if no items match the minDate
        }
    });
}

// Function to get an item by its ID
function getItemById(id) {
    return new Promise((resolve, reject) => {
        // Find the item by its ID
        const item = items.find(item => item.id === parseInt(id));

        if (item) {
            resolve(item); // Resolve the promise with the found item
        } else {
            reject("No result returned."); // Reject the promise if no item is found with the given ID
        }
    });
}

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getAllCategories,
    addItem,
    getItemsByCategory,  // Export the getItemsByCategory function
    getItemsByMinDate,   // Export the getItemsByMinDate function
    getItemById          // Export the getItemById function
};

