const Sequelize = require('sequelize');
const { Op } = Sequelize;
const sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'npg_6BZ2tbfiSVDr', {
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

// Initialize Sequelize
module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve())
            .catch(() => reject("unable to sync the database"));
    });
};

// Get All Items
module.exports.getAllItems = function () {
    return new Promise((resolve, reject) => {
        Item.findAll()
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
};

// Get Published Items
module.exports.getPublishedItems = function () {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { published: true }
        })
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
};

// Get All Categories
module.exports.getAllCategories = function () {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
};

// Add Item
module.exports.addItem = function (itemData) {
    return new Promise((resolve, reject) => {
        itemData.published = itemData.published ? true : false;

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

// Get Items by Category
module.exports.getItemsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { category: category }
        })
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
};

// Get Items by Minimum Date
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

// Get Item by ID
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

// Get Published Items by Category
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

// Add Category
module.exports.addCategory = function (categoryData) {
    return new Promise((resolve, reject) => {
        for (let key in categoryData) {
            if (categoryData[key] === "") {
                categoryData[key] = null;
            }
        }

        Category.create(categoryData)
            .then(() => resolve("Category created successfully"))
            .catch((err) => reject("Unable to create category: " + err.message));
    });
};

// Delete Category by ID
module.exports.deleteCategoryById = function (id) {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: { id: id }
        })
            .then((deleted) => {
                if (deleted === 0) {
                    reject("Category not found or could not be deleted");
                } else {
                    resolve("Category deleted successfully");
                }
            })
            .catch((err) => reject("Unable to delete category: " + err.message));
    });
};

// Delete Post by ID
module.exports.deletePostById = function (id) {
    return new Promise((resolve, reject) => {
        Item.destroy({
            where: { id: id }
        })
            .then((deleted) => {
                if (deleted === 0) {
                    reject("Post not found or could not be deleted");
                } else {
                    resolve("Post deleted successfully");
                }
            })
            .catch((err) => reject("Unable to delete post: " + err.message));
    });
};


