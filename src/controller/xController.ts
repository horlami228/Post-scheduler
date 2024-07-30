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
import download from "../utilities/download.js";

const envPath = path.resolve(".env.development");

const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY || "",
    appSecret: process.env.TWITTER_API_SECRET_KEY || "",
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });

  const twitterClient = client.readWrite;


dotenv.config({ path: envPath });

// post with media

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


