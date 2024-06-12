import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { CustomRequest } from '../types/customeRequest';
interface Tokens {
    access_token: string;
    scope: string;
    token_type: string;
    expiry_date: number;
}

// Middleware to load the tokens during request

const loadTokens = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const oAuth2Client = req.drive?.oAuth2;

        if (!oAuth2Client) {
            const error = new Error('oAuth2Client in load token failed');
            return next(error);
        }

        const tokens = JSON.parse(fs.readFileSync('tokens.json', 'utf8'));

        oAuth2Client.setCredentials(tokens);

        console.log('Used the tokens')
        // check if the access token already expired
        const now = Date.now();
        if (tokens.expiry_date && tokens.expiry_date <= now) {
            console.log('Access token expired, refreshing token ...');

            if (!tokens.refresh_token) {
                throw new Error('No refresh token is set.');
            }

            const { credentials } =  await oAuth2Client.refreshAccessToken();

            oAuth2Client.setCredentials(credentials);

            // save the new tokens to a file
            fs.writeFileSync('tokens.json', JSON.stringify(credentials));
            
            console.log('Token refreshed and saved in tokens.json');
        }

        // req.drive = { oAuth2: oAuth2Client };

        next();
     } catch (error) {
        console.error('Error loading or refreshing tokens:', error);
        next(error);
     }

}

export default loadTokens;
