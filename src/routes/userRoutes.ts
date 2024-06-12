// Import necessary modules
import { Router } from 'express'; // Express Router to handle routing

import { createNewUser } from '../controller/userController.js';

// Create a new router instance
const router = Router();

// new user
router.post("/user/new", createNewUser);

// // new post
// router.post("/user/post", createNewPost);


export default router;
