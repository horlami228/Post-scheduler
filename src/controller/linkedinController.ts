// linkedin api
import axios from "axios";
import axiosRetry from "axios-retry";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import random from "randomstring";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import queryString from "querystring";
import appendToFile from "../utilities/appendFile.js";
import { CustomRequest } from "../types/customeRequest";
import getImage from "../utilities/getImageBuffer.js";
import prisma from "../config/prismaClient.js";
const envPath = path.resolve(".env.development");

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
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error?.response?.status ?? 0) >= 500
    );
  },
});

dotenv.config({ path: envPath });

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || "";
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || "";
const REDIRECT_URI = `${process.env.REDIRECT_URI}/${'api/auth/linkedin/callback'}` || "";
const SCOPE = "email%20profile%20w_member_social%20openid";
const STATE = random.generate();

export const linkedinAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${STATE}&scope=${SCOPE}`;
  res.redirect(authUrl);
};

export const linkedinCallBack = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ msg: "No code received from callback" });
  }

  console.log("LinkedIn auth code:", code);

  try {
    // get the access token
    const response = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      queryString.stringify({
        grant_type: "authorization_code",
        code: code as string, // Cast 'code' to string
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    // save the access token in a file for later use
    fs.writeFileSync("linkedin.json", JSON.stringify(response?.data));

    console.log("Tokens saved to linkedin.json", response?.data);

    // get user profile
    await axios.get(`${process.env.SERVER}/api/auth/linkedin/profile`, {}).then(async (response) => {
      console.log(response.data);


    }).catch((error) => {
      console.error(error);
    });
    


    res.redirect("/home");
  } catch (error) {
    next(error);
  }
};

export const profile = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  // get LinkedIn token
  const accessToken = req.linkedin?.accessToken;

  console.log("The token:", accessToken);

  try {
    const profileResponse = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const token: any = await appendToFile("linkedin.json", profileResponse.data);
    if (!token) {
      throw new Error('Failed to update token data.');
    }
    console.log("token data", token);

    console.log("Profile data appended to linkedin.json", profileResponse.data);
      // // save token to database under linkedin
      const tokenId = "64c8e1f2f9f472c4d3e8f3a1"; // Static ID for LinkedIn token

      console.log("deleting all linkedin tokens");
      await prisma.linkedInToken.deleteMany({});


      // await prisma.linkedInToken.upsert({
      //   where: { id: tokenId }, // Use the static ID
      //   update: { tokenData: token },
      //   create: { id: tokenId, tokenData: token },
      // });

      await prisma.linkedInToken.create({
        data: {
          tokenData: token, // The new token data
        },
      });

    res.status(200).json({ me: profileResponse.data });

  } catch (error: any) {
    console.error(
      "Error fetching LinkedIn user profile:",
      error.message || error,
    );

    next(error);
  }
};

export const makePost = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const text = req.body.text;

  if (!text) {
    return res.status(400).json({ error: "text is required" });
  }

  const access_token = req.linkedin?.accessToken; // access token
  const userId = req.linkedin?.userId; //sub id

  try {
    const postData = {
      author: `urn:li:person:${userId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: text,
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };
    const response = await axios.post(
      "https://api.linkedin.com/v2/ugcPosts",
      postData,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      },
    );

    res.status(200).json(response.data);
  } catch (error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Error creating post:", error.response.data);
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error(
        "Error creating post, no response received:",
        error.request,
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error creating post:", error.message);
    }
    next(error);
  }
};

const registerImage = async (ACCESS_TOKEN: string, personId: string) => {
  const url = "https://api.linkedin.com/v2/assets?action=registerUpload";
  const headers = {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
  const body = {
    registerUploadRequest: {
      owner: `urn:li:person:${personId}`,
      recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
      serviceRelationships: [
        {
          relationshipType: "OWNER",
          identifier: "urn:li:userGeneratedContent",
        },
      ],
      supportedUploadMechanism: ["SYNCHRONOUS_UPLOAD"],
    },
  };

  try {
    const response = await axios.post(url, body, { headers });
    console.log("Image registration response:", response.data);
    return response.data.value;
  } catch (error) {
    console.error("Error registering image:", error);
    throw error;
  }
};

const uploadImage = async (ACCESS_TOKEN: string, personId: string, webContentLink: string) => {
  try {
    // Check if the file exists
    // const webContentLink =
    //   "https://drive.google.com/uc?id=1adH6UFxy3sKfGZbWZsTfjy69vnrHOn20&export=download";
    // download image
    const imageBuffer = await getImage(webContentLink);
    console.log("imageContent", imageBuffer);

    const registrationData = await registerImage(ACCESS_TOKEN, personId);
    console.log("Registration data:", registrationData);
    const uploadUrlData =
      registrationData.uploadMechanism[
        "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
      ];
    const uploadUrl = uploadUrlData.uploadUrl;
    const assetId = registrationData.asset.split(":").pop();

    console.log("Upload URL:", uploadUrl);

    // const imageData = fs.readFileSync(imagePath);
    await axios.put(uploadUrl, imageBuffer, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "image/png",
      },
    });
    console.log("Image uploaded successfully");
    console.log("Asset ID:", assetId);
    return assetId;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// Make a post with an image
export const makeImagePost = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const text = req.body?.text;
  const webContentLink = req.body?.webContentLink;

  const access_token: string = req.linkedin?.accessToken as string; // access token
  const userId: string = req.linkedin?.userId as string; //sub id
  
  if (!text) {
    return res.status(400).send("Text is required");
  }

  try {
    // upload image content to linkedin for assetId
    const assetId = await uploadImage(access_token, userId, webContentLink);

    const response = await axios.post(
      "https://api.linkedin.com/v2/ugcPosts",
      {
        author: `urn:li:person:${userId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: text,
            },
            shareMediaCategory: "IMAGE",
            media: [
              {
                status: "READY",
                description: {
                  text: "Sample Description",
                },
                media: `urn:li:digitalmediaAsset:${assetId}`, // media assetId
              },
            ],
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return res.json({success: true, message: "Post on linkedin made succesfully", details: response.data});
  } catch (error: any) {
    console.error("Error posting to LinkedIn:", error);

    next(error);
  }
};
