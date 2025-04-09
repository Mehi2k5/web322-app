const Sequelize = require('sequelize');

var sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'npg_6BZ2tbfiSVDr', {
    host: 'ep-crimson-forest-a8orvnsz-pooler.eastus2.azure.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});


// Define the Category model
const Category = sequelize.define("Category", {
    category: Sequelize.STRING
});

// Define the Item model
const Item = sequelize.define("Item", {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE
});

// Define the relationship
Item.belongsTo(Category, { foreignKey: 'category' });


const { Op } = Sequelize;

// initialize
module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve())
            .catch(() => reject("unable to sync the database"));
    });
};

// getAllItems
module.exports.getAllItems = function () {
    return new Promise((resolve, reject) => {
        Item.findAll()
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
};

// getPublishedItems
module.exports.getPublishedItems = function () {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { published: true }
        })
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
};

// getAllCategories
module.exports.getAllCategories = function () {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
};

// addItem
module.exports.addItem = function (itemData) {
    return new Promise((resolve, reject) => {
        // Set published to true/false explicitly
        itemData.published = (itemData.published) ? true : false;

        // Convert "" values to null
        for (let prop in itemData) {
            if (itemData[prop] === "") {
                itemData[prop] = null;
            }
        }

        // Set postDate to current date
        itemData.postDate = new Date();

        Item.create(itemData)
            .then(() => resolve())
            .catch(() => reject("unable to create post"));
    });
};

// getItemsByCategory
module.exports.getItemsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { category: category }
        })
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
};

// getItemsByMinDate
module.exports.getItemsByMinDate = function (minDateStr) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                postDate: {
                    [Op.gte]: new Date(minDateStr)
                }
            }
        })
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
};

// getItemById
module.exports.getItemById = function (id) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { id: id }
        })
            .then(data => {
                if (data.length > 0) resolve(data[0]);
                else reject("no results returned");
            })
            .catch(() => reject("no results returned"));
    });
};

// getPublishedItemsByCategory
module.exports.getPublishedItemsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                published: true,
                category: category
            }
        })
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
};

module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then((data) => {
                if (data.length > 0) {
                    resolve(data);
                } else {
                    reject("no results returned");
                }
            })
            .catch((err) => {
                reject("no results returned");
            });
    });
};



const { Category, Post } = require('../models'); // adjust based on your actual model location

// Add Category Function
function addCategory(categoryData) {
    return new Promise((resolve, reject) => {
        // Replace all blank strings with null
        for (let key in categoryData) {
            if (categoryData[key] === "") {
                categoryData[key] = null;
            }
        }

        // Attempt to create a new Category
        Category.create(categoryData)
            .then(() => {
                resolve("Category created successfully");
            })
            .catch((err) => {
                reject("Unable to create category: " + err.message);
            });
    });
}

// Delete Category by ID Function
function deleteCategoryById(id) {
    return new Promise((resolve, reject) => {
        // Attempt to delete the category by ID
        Category.destroy({
            where: {
                id: id
            }
        })
            .then((deleted) => {
                if (deleted === 0) {
                    reject("Category not found or could not be deleted");
                } else {
                    resolve("Category deleted successfully");
                }
            })
            .catch((err) => {
                reject("Unable to delete category: " + err.message);
            });
    });
}

// Delete Post by ID Function
function deletePostById(id) {
    return new Promise((resolve, reject) => {
        // Attempt to delete the post by ID
        Post.destroy({
            where: {
                id: id
            }
        })
            .then((deleted) => {
                if (deleted === 0) {
                    reject("Post not found or could not be deleted");
                } else {
                    resolve("Post deleted successfully");
                }
            })
            .catch((err) => {
                reject("Unable to delete post: " + err.message);
            });
    });
}

module.exports = {
    addCategory,
    deleteCategoryById,
    deletePostById
};


// store-service.js
const Post = require('./models/Post'); // Adjust based on your ORM or model

/**
 * Delete a post by its ID.
 * @param {number} id - The ID of the post to delete.
 * @returns {Promise} Resolves if deleted, rejects if error occurs.
 */
function deletePostById(id) {
    return new Promise((resolve, reject) => {
        Post.destroy({
            where: { id: id }
        })
        .then(() => resolve())
        .catch(err => reject(err));
    });
}

module.exports = {
    deletePostById,
    // Other service methods
};
