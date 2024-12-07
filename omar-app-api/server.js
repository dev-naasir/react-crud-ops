const jsonServer = require('json-server');
const multer = require('multer');
const fs = require('fs'); // To check for directory existence
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Ensure the upload directory exists
const uploadDir = 'public/images';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set default middlewares (logger, static, cors, and no-cache)
server.use(middlewares);

// DiskStorage for Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const date = new Date();
        const imageFilename = date.getTime() + " " + file.originalname; // Fixed syntax
        req.body.imageFilename = imageFilename;
        cb(null, imageFilename);
    }
});

// Multer middleware
const upload = multer({ storage: storage });

// Middleware to parse form data
server.use(upload.any());

// POST request validation and processing
server.post("/products", (req, res, next) => {
    const date = new Date();
    req.body.createdAt = date.toISOString();

    // Convert price to a number if it exists
    if (req.body.price) {
        req.body.price = Number(req.body.price);
    }

    // Validation logic
    let hasErrors = false;
    const errors = {};

    if (!req.body.name || req.body.name.length < 2) {
        hasErrors = true;
        errors.name = "The name length should be at least 2 characters";
    }

    if (!req.body.brand || req.body.brand.length < 2) {
        hasErrors = true;
        errors.brand = "The brand length should be at least 2 characters";
    }

    if (!req.body.category || req.body.category.length < 2) {
        hasErrors = true;
        errors.category = "The category length should be at least 2 characters";
    }

    if (!req.body.price || req.body.price <= 0) {
        hasErrors = true;
        errors.price = "The price is not valid";
    }

    if (!req.body.description || req.body.description.length < 10) {
        hasErrors = true;
        errors.description = "The description length should be at least 10 characters";
    }

    if (hasErrors) {
        // Return bad request (400) with validation errors
        return res.status(400).jsonp(errors); // Ensure the response halts further execution
    }

    // Proceed to JSON Server router
    next();
});

// Use default router
server.use(router);

// Start the server
server.listen(3000, () => {
    console.log('JSON Server is running on http://localhost:4000');
});
