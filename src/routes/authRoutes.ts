// twitter api routes
import { Router } from "express";
import prisma from "../config/prismaClient.js";
import cronJob from "../controller/cronJob.js";

const router = Router();

router.post("/auth/login", async (req, res)  => {

    try {
        const { username, password } = req.body;

        console.log(username, password);

        if (!username || !password) {
            return res.status(400).json({ error: "Please provide username and password" });
        }
    
        // Check if user exists
        const user = await prisma.user.findFirst({
            where: {
                username: username,
                password: password
            }
        });
        
        console.log(user);
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
    
        // // Check if password is correct
        // const isMatch = password === user.password;
    
        // if (!isMatch) {
        //     return res.status(401).json({ error: "Invalid credentials" });
        // }
        
          // Set session authentication flag
        (req.session as any).isAuthenticated = true;

        res.redirect("/home");
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }  
});

router.post("/auth/logout", async (req, res) => {
    // Clear session
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Internal server error" });
        }
        res.redirect("/");
    });
});

router.get("/run", async (req, res) => {
    // Clear session
    await cronJob();

    res.status(200).json({ message: "Cron job completed" });
});

export default router;