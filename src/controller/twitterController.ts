// This controller is for the twitter api
import axios from "axios";
import axiosRetry from "axios-retry";
import fs from "fs";
import path from "path";
import { TwitterApi } from "twitter-api-v2";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import getImage from "../utilities/getImageBuffer.js";
import { CustomRequest } from "../types/customeRequest.js";
import { fileTypeFromBuffer } from 'file-type';

const envPath = path.resolve(".env.development");

// configure axios to retry requests
axiosRetry(axios, {
  retries: 10, // Number of retry attempts
  retryDelay: (retryCount) => {
    console.log(`Retry attempt: ${retryCount}`);
    return retryCount * 1000; // Exponential back-off (1000ms = 1 second)
  },
  retryCondition: (error) => {
    // Retry on network errors or 5xx status codes
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error?.response?.status ?? 0) >= 500
    );
  },
});

dotenv.config({ path: envPath });
const CLIENT_ID: string = process.env.TWITTER_CLIENT_ID || "";
const CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.REDIRECT_URI || "";
const SCOPE: string[] = [
  "tweet.read",
  "tweet.write",
  "users.read",
  "offline.access",
];

const twitterClient = new TwitterApi({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
});

// const twitterClient = new TwitterApi({
//   //   clientId: CLIENT_ID,
// //   clientSecret: CLIENT_SECRET,
//   appKey: process.env.TWITTER_API_KEY || "",
//   appSecret: process.env.TWITTER_API_SECRET_KEY || "",
//   accessToken: process.env.TWITTER_ACCESS_TOKEN,
//   accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
// });



let tokenRequest: any;
// Initiate the Oauth flow
export const twitterAuth = async (req: Request, res: Response) => {
  try {
    // get the redirect url from twitter using the twitter sdk
    tokenRequest = await twitterClient.generateOAuth2AuthLink(
      `${REDIRECT_URI}/api/auth/callback/twitter`,
      {
        scope: SCOPE,
      },
    );
    console.log("tokenredirect", tokenRequest.url);
    console.log("token", tokenRequest);
    res.redirect(tokenRequest.url); // make a redirection to the generated url
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
};

// callback endpoint
export const twitterCallback = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const code: string = req.query.code as string;
  const state: string = req.query.state as string;
  console.log("code", code, "state", state);
  console.log("tokenState", tokenRequest.state);
  if (!tokenRequest || state !== tokenRequest.state) {
    return res.status(400).send("Stored tokens do not match!");
  }

  try {
    const twitter = await twitterClient.loginWithOAuth2({
      code,
      codeVerifier: tokenRequest.codeVerifier,
      redirectUri: `${REDIRECT_URI}/api/auth/callback/twitter`,
    });

    console.log("client", twitter);
    // save the client in a file for later use
    fs.writeFileSync("twitter.json", JSON.stringify(twitter, null, 2));
    res.send("Successfully authenicated with twitter!");
  } catch (error) {
    next(error);
  }
};

// get user profile
export const profile = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const client = req?.twitter?.client;

    console.log("client", client);
    // Make a request to get the authenticated user's tweets
    const user = await client.currentUser();
    console.log("user", user);
    const userId = user.data.id;
    const tweets = await client.v2.userTimeline(userId);

    res.json(tweets);

  } catch (error: any) {
    next(error);
  }
}

export const makePost = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const client = req?.twitter?.client;

    const tweetText = req.body.text;
  
    if (!tweetText) {
      return res.status(400).send('Tweet text is required');
    }

    const response = await client.v2.tweet(tweetText);
    res.status(200).send(response.data);

  } catch(error) {
    next(error);
  }

}

export const makePostWithImage = async (req: CustomRequest, res: Response, next: NextFunction) => {

  const client = req?.twitter?.client;

  const tweetText = req.body.tweetText;
  const mediaUrl = req.body.mediaUrl;

  console.log("tweetText", tweetText, "mediaUrl", mediaUrl);

  if (!tweetText || !mediaUrl) {
    return res.status(400).send('Tweet text and media URL are required');
  }

  try {
    const mediaResponse = await getImage(mediaUrl);
    console.log("imageContent", mediaResponse);
    const mediaData = Buffer.from(mediaResponse, 'binary');

    console.log("mediaData", mediaData);
    // Determine the file type of the media
    const type = await fileTypeFromBuffer(mediaData);
    const mimeType = type ? type.mime : 'application/octet-stream';
    console.log('Mime type:', mimeType);
    await await client.v1.uploadMedia("/home/horlami/Post-scheduler/src/controller/1717401116086.jpeg")
    const mediaUploadResponse = await client.v1.uploadMedia(mediaData, { media_category: 'tweet_image', mimeType });
    const mediaId = mediaUploadResponse.data.id;

    console.log("mediaId", mediaId);

    const tweet = {
      Text: tweetText,
      media: { media_ids: [mediaId] },
    };

    const tweetResponse = await client.v1.tweet(tweet);
    res.status(200).send(tweetResponse);

  } catch (error) {
    next(error);
  }
}


