import prisma from "../config/prismaClient.js";
import { Request, Response, NextFunction } from "express";


// create an new user
export const createNewUser = async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Please provide username, email and password" });
    }
    
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

