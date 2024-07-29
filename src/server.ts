// Import required modules and components
import express from "express";
import userRoutes from "./routes/userRoutes.js";
import googleRoutes from "./routes/googleDriveRoutes.js";
import linkedRoutes from "./routes/linkedinRoutes.js";
import twitterRoutes from "./routes/twitterRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import swaggerSpec from "./swaggerConfig.js";
import swaggerUi from "swagger-ui-express";
import prisma from "./config/prismaClient.js";
import errorHandlingMiddleware from "./middleware/errorHandling.js";
import { Request, Response, NextFunction } from "express";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the correct .env file based on NODE_ENV
if (process.env.NODE_ENV === "production") {
  config({ path: ".env.production" });
} else {
  config({ path: ".env.development" });
}

// Initialize Express app
const app = express();

// Test database connection
try {
  await prisma.$connect();
  console.log("Connected to the database successfully");
  await prisma.$disconnect();
} catch (error) {
  console.error("Could not connect to the database");
  console.error(error);
}
// Set default port or use provided PORT environment variable
const PORT = process.env.PORT || 8000;

// Middleware configuration
// Enable express to parse JSON data
app.use(express.json());

// frontend
// // Serve static files from the 'public' directory within 'src'
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Swagger documentation setup
// '/api-docs' endpoint serves the Swagger UI based on the swaggerSpec configuration
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Route configuration

// All API routes are prefixed with '/api/v1'
app.use("/api", userRoutes);

// google drive routes
app.use("/api", googleRoutes);

// linkedin routes
app.use("/api", linkedRoutes);

// twitter routes
app.use("/api", twitterRoutes);

// auth routes
app.use("/api", authRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Example route to serve login.html
app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

// A custom 404 'not found' middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).send("404 Page Not Found");
  next();
});

// error handling middleware
app.use(errorHandlingMiddleware);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the server
console.log(`The environment is ${process.env.NODE_ENV}`);

// Listens for requests on the specified PORT
app.listen(PORT, () => {
  console.log(`Server is now listening on port ${PORT}`);
});
