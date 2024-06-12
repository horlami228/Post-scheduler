import {google} from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';

import { Request, Response, NextFunction } from 'express';
import { CustomRequest } from '../types/customeRequest';

const envPath = path.resolve(".env.development") 

dotenv.config({path: envPath});

const attachment = async (req: CustomRequest, res: Response, next: NextFunction) => {
        
        // initialize auth
        const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_DRIVE_CLIENT_ID,
        process.env.GOOGLE_DRIVE_CLIENT_SECRET,
        process.env.GOOGLE_DRIVE_REDIRECT_URI
);
        
        if (!req.drive) {
            req.drive = {}
        }

        req.drive = {
            oAuth2: oAuth2Client
    };


        next();
}

export default attachment;
