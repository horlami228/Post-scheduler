// Importing necessary modules from the 'express' package to handle HTTP requests and responses.
import {Request, Response} from 'express';
// Importing the User model from the userModel.js file, which defines the schema for the user documents in the MongoDB database.
import User from '../model/userModel.js';
// Importing the base model from the baseModel.ts file, which defines generic functions




// Define the 'createUser' controller function as an asynchronous function to handle POST requests for creating a new user.
export const createUser = async  (req: Request, res: Response) => {
    
    try {
            // Validates the incoming request to ensure it contains a body with JSON data.
        if (!req.body) {
            // Responds with a 400 Bad Request error if the request body is missing.
            return res.status(400).json({"Error": "Not a valid JSON"});
        } else if (!("userName" in req.body)) {
            // Responds with a 400 Bad Request error if the 'userName' field is missing in the request body.
            return res.status(400).json({"Error": "Missing Username"});
        } else if (!("email" in req.body)) {
            // Responds with a 400 Bad Request error if the 'email' field is missing in the request body.
            return res.status(400).json({"Error": "Missing Email"});
        }

        // Extracts the data from the request body.
        const data = req.body;

        // Initializes a new instance of the User model with the extracted data.
        const new_user = new User(data);

        // Saves the new user instance to the MongoDB database and awaits its completion.
        const user = await new_user.save();

        // Responds with a 200 OK status and the newly created user data in JSON format.
        res.status(200).json(user);

    } catch(error) {
        // Catches any errors that occur during the execution of the try block.
        if (error instanceof Error) {
            // Responds with a 500 Internal Server Error status and the error details if an exception occurs.
            res.status(500).json({
                "Error": "Error creating a user",
                "Details": error.message
            });
        }
    }
 
};


// Export the 'allUsers' function to handle GET requests for retrieving all users.
export const allUsers = (req: Request, res: Response) => {
    // Use the 'find' method on the User model to query the database.
    // This returns a Promise.
    User.find({})
        .then(users => {
            if (users.length === 0) {
                return res.status(404).json({
                    "Error": "No user was found"
                });
            }
            
            // If the query is successful, send a 200 OK response with the users data.
            res.status(200).json(users);
        })
        .catch(error => {
            // If there's an error during the query, respond with a 500 Internal Server Error.
            // The error message is included in the response.
            res.status(500).json({
                "Error": "Getting all Users",
                "Details": error.message
            });
        });
};


// Export the 'userByName' function to handle GET requests for retrieving a user
export const userByName = (req: Request, res: Response) => {
    // use the 'find' method on the User model to find a user by the userName
    // This returns a promise

    const userName: string | number = req.params.userName;

    User.find({"userName": userName})
    .then(user => {
        if (user.length === 0) {
            return res.status(404).json({
                "Error": "User not found"
            });
        }
        
        // if the query is succesfull, send a 200 OK response with the user data

        res.status(200).json(user);
    })
    .catch(error => {
        // if there is an error during query, respons with a 500 Internal Server Error

        res.status(500).json({
            "Error": "Getting User",
            "Details": error.message
        });
    });
};

// export the deleteUser function to handle get request for deleting a user
export const deleteUser = (req: Request, res: Response) => {
    const userName: string = req.params.userName;

    User.findOneAndDelete({"userName": userName})
    .then(user => {

        // if succesful send a 200 OK with the deleted data
        res.status(200).json({"Deleted": user});
        
    })
    .catch(error => {
        // if error occured response with 500 Internal Server Error and print out error
        // error message is included in the response
        res.status(500).json({
            "Error": "Failed to perform delete",
            "Details": error.message
        });
    });
};

