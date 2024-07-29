import { Request } from "express";
import { OAuth2Client } from "google-auth-library";

export interface CustomRequest extends Request {
  drive?: {
    oAuth2?: OAuth2Client;
  };

  linkedin?: {
    accessToken?: string;
    userId?: string;
  };
  twitter?: {
    client?: any;
  };
}

