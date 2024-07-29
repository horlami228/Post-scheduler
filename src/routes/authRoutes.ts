// twitter api routes
import { Router } from "express";
import prisma from "../config/prismaClient.js";
const router = Router();

router.post("/auth/login", async (req, res)  => {

    try {
        const { username, password } = req.body;

        console.log(username, password);

        if (!username || !password) {
            return res.status(400).json({ error: "Please provide username and password" });
        }
    
        // Check if user exists
        const user = await prisma.user.findMany({})
        //     where: {
        //         username: username,
        //     },
        // });
        
        console.log(user)
        // if (!user) {
        //     return res.status(401).json({ error: "Invalid credentials" });
        // }
    
        // // Check if password is correct
        // const isMatch = password === user.password;
    
        // if (!isMatch) {
        //     return res.status(401).json({ error: "Invalid credentials" });
        // }
    
        res.status(200).json({ message: "Login successful" });
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }  
});

export default router;