import { googlAuth, googleCallback, driveUpload, uploadMedia, deleteFile } from "../controller/googleDriveController.js";
import attachment from "../middleware/attachGDriveOAuth.js";
import loadTokens from "../middleware/gDriveLoadToken.js";
import { Router } from "express";

const router = Router();

// endpoint for Oauth flow
router.get('/auth/google', attachment, googlAuth);

// endpoint for oAuth call back
router.get('/auth/google/callback', attachment, googleCallback);

//endpoint to upload to google drive
router.post('/drive/upload', attachment, loadTokens, driveUpload);

//endpoint to upload from local machine
router.post('/upload/media', uploadMedia);

//endpoint to delete a file from google drive
router.delete('/drive/delete', attachment, loadTokens, deleteFile);
export default router;