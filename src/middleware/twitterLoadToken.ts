import fs from "fs";
import { Request, Response, NextFunction } from "express";
import { CustomRequest } from "../types/customeRequest";
import { TwitterApi } from "twitter-api-v2";
import dotenv from "dotenv";
import path from "path";
import prisma from "../config/prismaClient.js";

const envPath = path.resolve(".env.development");

dotenv.config({ path: envPath });

const loadTokens = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
  // Read the tokens from the file
  let tokenData: any;
  const token = await prisma.twitterToken.findFirst({
    orderBy: {
    id: 'asc'
    }
  });

  tokenData = token?.tokenData;
  
  // tokenData = JSON.parse(fs.readFileSync("twitter.json", "utf-8"));
  const { accessToken, refreshToken, expiresIn } = tokenData;

  let clientel = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY || "",
    appSecret: process.env.TWITTER_API_SECRET_KEY || "",
    accessToken: accessToken,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN
  });

  const  client = clientel.readWrite;

  // Check if the token is expired
  const tokenExpiryTime = Date.now() + expiresIn * 1000; // Calculate expiry time
  const currentTime = Date.now();

  // if (currentTime > tokenExpiryTime) {
  //   console.log('Token expired. Refreshing token...');

  //   // Refresh the token
  //   const refreshResult = await client.refreshOAuth2Token(refreshToken);
  //   const { client: refreshedClient, accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn: newExpiresIn } = refreshResult;

  //   // Update the client and tokens
  //   client = refreshedClient;  // Use the refreshed client
  //   tokenData.accessToken = newAccessToken;
  //   tokenData.refreshToken = newRefreshToken;
  //   tokenData.expiresIn = newExpiresIn;

  //   // Save the updated tokens to the file
  //   fs.writeFileSync("twitter.json", JSON.stringify(tokenData, null, 2));
  // }

  // Attach the client to the request object
  req.twitter = {
    client: client,
  };

  next();


  } catch (error) {
    next(error);
  }
};

export default loadTokens;