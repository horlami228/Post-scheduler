// twitter api routes
import { Router } from "express";
import {
  twitterAuth,
  twitterCallback,
  profile,
  makePost,
  makePostWithImage
} from "../controller/twitterController.js";
import { postWithMedia, tweetImage} from "../controller/xController.js";
import loadTokens from "../middleware/twitterLoadToken.js";

const router = Router();

// endpoint to authenticate with Oauth2
router.get("/auth/twitter", twitterAuth);

// callback endpoint for twitter
router.get("/auth/callback/twitter", twitterCallback);

// get user profile
router.get("/profile/twitter", loadTokens, profile);

// make a post
router.post("/post/twitter", loadTokens, makePost);

// make a post with image
router.post("/post/twitter/image", loadTokens, makePostWithImage);

router.post("/post/x/image", tweetImage);

// router.post("/post/x/image/v2", postWithMediaV2);

export default router;
