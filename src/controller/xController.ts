// This controller is for the twitter api
import axios from "axios";
import axiosRetry from "axios-retry";
import fs from "fs";
import path from "path";
import { TwitterApi } from "twitter-api-v2";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
// import getImage from "../utilities/getImageBuffer.js";
import { CustomRequest } from "../types/customeRequest.js";
import { fileTypeFromBuffer } from 'file-type';
import {OAuth} from 'oauth';
import Twit from 'twit';
import download from "../utilities/download.js";

const envPath = path.resolve(".env.development");
console.log(process.env.TWITTER_API_KEY); // Should log your API key
console.log(process.env.TWITTER_API_SECRET_KEY); // Should log your API secret key
const api = process.env.TWITTER_API_KEY

const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY || "",
    appSecret: process.env.TWITTER_API_SECRET_KEY || "",
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });

  const twitterClient = client.readWrite;

  // const clientel = new TwitterApi({
  //   appKey: "zwZckmoORRR2ViplNDIPct0Km",
  //   appSecret: "1kXvOOT9BDgR9ZSbrnnRamnJmQFlgBWYEni9Pz21Z1EtJltKLu",
  //   accessToken:"1379029194412326914-lpqjID4DYIkhhMCHcLvuzQ4fDNc3Go",
  //   accessSecret:"RVvBRCFE6yZXkPjCTJbjqPKR7ALtGSj50BJsy0EdltBtY",
  // });

dotenv.config({ path: envPath });
// const oauth = new OAuth(
//     'https://api.twitter.com/oauth/request_token',
//     'https://api.twitter.com/oauth/access_token',
//     process.env.TWITTER_API_KEY || '',
//     process.env.TWITTER_API_SECRET || '',
//     '1.0A',
//     process.env.REDIRECT_URI || '',
//     'HMAC-SHA1'
// )
console.log('Consumer Key:', process.env.TWITTER_API_KEY);
console.log('Consumer Secret:', process.env.TWITTER_API_SECRET_KEY);


const T = new Twit({
    consumer_key: process.env.TWITTER_API_KEY || '',
    consumer_secret: process.env.TWITTER_API_SECRET_KEY || '',
    access_token: process.env.TWITTER_ACCESS_TOKEN || '',
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET || '',
});

// post with media

// export const postWithMedia = async (req: Request, res: Response) => {
//     try {

//         const mediaUrl = req.body.mediaUrl;
//         const mediaResponse = await getImage(mediaUrl);
//         console.log("imageContent", mediaResponse);
//         const mediaData = Buffer.from(mediaResponse, 'binary');
    
//         console.log("mediaData", mediaData);

//         console.log('Image:', mediaResponse);
//         console.log('Media Data:', mediaData);

//         const fileType: any = await fileTypeFromBuffer(mediaData);

//         if (!fileType || !['image/jpeg', 'image/png', 'image/gif'].includes(fileType.mime)) {
//             return res.status(400).json({ message: 'Unsupported image type' });
//         }

//         const media: any = await T.post('media/upload', { media_data: mediaData.toString('base64') });
//         const tweet = {
//             status: req.body.status,
//             media_ids: media.data.media_id_string
//         }
//         const response = await T.post('statuses/update', tweet);
//         res.status(200).json({ message: 'Tweet posted successfully', data: response.data });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// }

// Function to post a tweet with media using Twitter API v2
// export const postWithMediaV2 = async (req: Request, res: Response) => {
//     try {

//         const mediaUrl = req.body.mediaUrl;
//         const mediaResponse = await getImage(mediaUrl);
//         console.log("imageContent", mediaResponse);
//         const mediaData = Buffer.from(mediaResponse, 'binary');
    
//         console.log("mediaData", mediaData);

//         console.log('Image:', mediaResponse);
//         console.log('Media Data:', mediaData);

//         // Example of uploading media and posting a tweet using v2 endpoints
//         // Replace these URLs and methods with the correct ones for your access level
//         const uploadResponse = await axios.post('https://api.twitter.com/1.1/media/upload.json', mediaData, {
//             headers: {
//                 'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
//                 'Content-Type': 'application/json',
//             }
//         });

//         const tweetResponse = await axios.post('https://api.twitter.com/2/tweets', {
//             text: req.body.status,
//             media: { media_ids: uploadResponse.data.media_id_string }
//         }, {
//             headers: {
//                 'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
//                 'Content-Type': 'application/json',
//             }
//         });

//         res.status(200).json({ message: 'Tweet posted successfully', data: tweetResponse.data });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

const getImage = async (webContentLink: string): Promise<Buffer | null> => {
    try {
      const response = await axios.get(webContentLink, { responseType: 'arraybuffer' });
      return Buffer.from(response.data);
    } catch (error: any) {
      console.error('Error fetching image:', error.message);
      return null;
    }
  };
  
  const uploadMedia = async (media: Buffer) => {
    try {
      const response = await axios.post('https://upload.twitter.com/1.1/media/upload.json?media_category=tweet_image', media, {
        headers: {
          'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
          'Content-Type': 'multipart/form-data',
        },
        maxRedirects: 0, // Avoid redirects for binary uploads
      });
      return response.data;
    } catch (error: any) {
      console.error('Error uploading media:', error.message);
      throw error;
    }
  };
  
  const postTweet = async (status: string, mediaId: string) => {
    try {
      const response = await axios.post('https://api.twitter.com/1.1/statuses/update.json', {
        status,
        media_ids: mediaId,
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error posting tweet:', error.message);
      throw error;
    }
  };
  
  export const postWithMedia = async (req: Request, res: Response) => {
    try {
      const image = await getImage(req.body.imageUrl);
  
      if (!image) {
        return res.status(400).json({ message: 'Failed to fetch image' });
      }
  
      const mediaUploadResponse = await uploadMedia(image);
      const mediaId = mediaUploadResponse.media_id_string;
  
      const tweetResponse = await postTweet(req.body.status, mediaId);
      res.status(200).json({ message: 'Tweet posted successfully', data: tweetResponse });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


export const tweetImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const uri = req.body.uri;
      const tweetText = req.body.text;

      if (!uri || !tweetText) {
        return res.status(400).send('URI and tweet text are required');
      }

      download(uri, async function (err: any, imageBuffer: any) {
        if (err) {
          return console.log(err);
        }
        try {
          const mediaId = await twitterClient.v1.uploadMedia(imageBuffer, { type: 'buffer' });
          await twitterClient.v2.tweet({
            text: tweetText,
            media: {
              media_ids: [mediaId]
            }
          });
          res.status(200).send('Tweeted successfully');
          console.log("Tweeted successfully");
        } catch (e) {
          console.log(e);
        }
      });
      
      
    } catch (error) {
        next(error);
    }
}


