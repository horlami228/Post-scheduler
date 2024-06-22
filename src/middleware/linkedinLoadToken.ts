// this controller is used to load linkedin access token
import fs from "fs";
import { Request, Response, NextFunction } from "express";
import { CustomRequest } from "../types/customeRequest";
const loadTokens = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // parse token

    const tokens = await JSON.parse(fs.readFileSync("linkedin.json", "utf-8"));
    console.log("full token", typeof tokens.access_token);

    if (!req.linkedin) {
      req.linkedin = {};
    }

    // req.linkedin?.accessToken = tokens.access_token;
    console.log("Does req.linkedin exist?", req.linkedin);

    req.linkedin.accessToken = tokens.access_token;
    req.linkedin.userId = tokens.sub;

    next();
  } catch (error) {
    next(error);
  }
};

export default loadTokens;
