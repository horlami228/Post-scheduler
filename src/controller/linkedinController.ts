// linkedin api
import axios from 'axios';
import axiosRetry from 'axios-retry';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import random from 'randomstring';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import queryString from 'querystring';
import appendToFile from '../utilities/appendFile.js';
import { CustomRequest } from '../types/customeRequest';


const envPath = path.resolve('.env.development')

// Configure axios to retry requests
// Configure axios to retry requests
axiosRetry(axios, {
        retries: 10, // Number of retry attempts
        retryDelay: (retryCount) => {
            console.log(`Retry attempt: ${retryCount}`);
            return retryCount * 1000; // Exponential back-off (1000ms = 1 second)
        },
        retryCondition: (error) => {
            // Retry on network errors or 5xx status codes
            return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error?.response?.status ?? 0) >= 500;
        }
    });

dotenv.config({path: envPath})
const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || "";
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || "";
const SCOPE = 'email%20profile%20w_member_social%20openid';
const STATE = random.generate();

export const linkedinAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${STATE}&scope=${SCOPE}`
    res.redirect(authUrl);
}

export const linkedinCallBack = async (req: Request, res: Response, next: NextFunction) => {
    const {code} = req.query;

    if (!code) {
        return res.status(400).json({msg: 'No code received from callback'})
    }

    console.log('LinkedIn auth code:', code);

    try {
        // get the access token
        const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', queryString.stringify({
            grant_type: 'authorization_code',
            code: code as string, // Cast 'code' to string
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // save the access token in a file for later use
        fs.writeFileSync('linkedin.json', JSON.stringify(response?.data));

        console.log('Tokens saved to linkedin.json', response?.data);

        res.send('Authentication successful! You can close this window.');

    } catch (error) {
        next(error);
    }
}


export const profile = async (req: CustomRequest, res: Response, next: NextFunction) => {
    // get LinkedIn token
    const accessToken = req.linkedin?.accessToken;

    console.log('The token:', accessToken);

    try {
        const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        await appendToFile('linkedin.json', profileResponse.data);

        res.status(200).json({ me: profileResponse.data });

    } catch (error: any) {
        console.error('Error fetching LinkedIn user profile:', error.message || error);

        next(error);
    }
};

export const makePost = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const text = req.body.text;

    if(!text) {
        return res.status(400).json({error: 'text is required'});
    }

    const access_token = req.linkedin?.accessToken; // access token
    const userId = req.linkedin?.userId;    //sub id


    try {
        const postData = {
            "author": `urn:li:person:${userId}`,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {
                        "text": text
                    },
                    "shareMediaCategory": "NONE"
                }
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        }
        const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', postData, {
            headers: {
                Authorization: `Bearer ${access_token}`,
                // "Content-Type": 'application/json'
            },
        });

        res.status(200).json(response.data);

    } catch(error: any) {

        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error creating post:', error.response.data);
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
          } else if (error.request) {
            // The request was made but no response was received
            console.error('Error creating post, no response received:', error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error creating post:', error.message);
          }
        next(error);
    }
}

