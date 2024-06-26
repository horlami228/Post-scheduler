import prisma from "../config/prismaClient.js";
import { Request, Response, NextFunction } from "express";


// create an new user
export const createNewUser = async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body;

    try {
        const user = await prisma.user.create({
            data: { // Add the 'id' property here
                username: username,
                email: email,
                password: password,
            }
        })

        res.status(201).json({user: user})
    } catch(error) {
        next(error)
    }
}

// create a new post
// export const createNewPost = async (req: Request, res: Response, next: NextFunction) => {
//     const {imageUrl, description} = req.body;

//     try {
//         const post = await prisma.post.create({
//             data: {
//                 webContentLink: imageUrl,
//                 webViewLink?:
//                 description: description
//             }
//         })
//     } catch (error) {
//         next(error)
//     }
// }

