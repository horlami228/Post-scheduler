// Import necessary modules
import { Router } from 'express'; // Express Router to handle routing
// Import createUser controller
import { createUser, allUsers, userByName, deleteUser } from "../controller/userController.js"; // Import createUser controller
// Import createUser controller





// Create a new router instance
const router = Router();

/**
 * Route for creating a new user.
 * POST /user/create
 * This route handles the creation of a new user by utilizing the createUser controller.
 * The actual logic for user creation is encapsulated in the createUser function within the userController.
 */
router.post("/user/create", createUser);

/**
 * Route for getting all users in the system
 * GET /user/get_users
 * The actual logic is handled by the controller function createUSer within the userController
 */
router.get("/user/get_users", allUsers);

/**
 * Route for getting a user by the userName
 * GET /user/get_user/:userName
 * The actual logic is handled by the controller function userByName within userController
 */
router.get("/user/get_user/:userName", userByName);


/**
 * Route for deleting a User
 * Get /user/deleteUser/:userName
 * The actual logic is handled by the controller function deleteUser within the userController
 */
router.get("/user/delete_user/:userName", deleteUser);


// Export the router for use in other parts of the application
export default router;
