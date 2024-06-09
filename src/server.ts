// Import required modules and components
import express from 'express';
import userRoutes from "./routes/userRoutes.js";
import swaggerSpec from './swaggerConfig.js';
import swaggerUi from 'swagger-ui-express';

// Initialize Express app
const app = express();

// Set default port or use provided PORT environment variable
const PORT = process.env.PORT || 8000;

// Middleware configuration
// Enable express to parse JSON data
app.use(express.json());

// Swagger documentation setup
// '/api-docs' endpoint serves the Swagger UI based on the swaggerSpec configuration
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Route configuration
// All API routes are prefixed with '/api/v1'
app.use('/api/v1', userRoutes);

// A custom 404 'not found' middleware
app.use((req, res, next) => {
    res.status(404).send("404 Page Not Found");
    next();
});


// Start the server
// Listens for requests on the specified PORT
app.listen(PORT, () => {
    console.log(`Server is now listening on port ${PORT}`);
});
