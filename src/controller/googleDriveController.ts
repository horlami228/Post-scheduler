import { google } from 'googleapis';
import * as fs from 'fs';
import { pathToFileURL } from 'url';
import path from 'path';
import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import { CustomRequest } from '../types/customeRequest';
import prisma from '../config/prismaClient.js';
import { Readable } from 'stream';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const envPath = path.resolve('.env.development')

dotenv.config({path: envPath})

// console.log(path.resolve('.env.development'));

// // Create an OAuth2 client
// const oAuth2Client = new google.auth.OAuth2(
//     process.env.GOOGLE_DRIVE_CLIENT_ID,
//     process.env.GOOGLE_DRIVE_CLIENT_SECRET,
//     process.env.GOOGLE_DRIVE_REDIRECT_URI
// );

// Extend the Express.Multer.File interface to include the properties we need
interface CustomFile extends Express.Multer.File {
    mimetype: string;
    originalname: string;
}

interface gDriveMetaData {
    name: string;
    parents: [string]
}

interface gDriveMedia {
    mimeType: string;
    body: Buffer | Readable;
}

// const filePath = path.resolve('1717401116086.jpeg')
// console.log('filepath:', filePath);

// memory storage
const storage = multer.memoryStorage();

// check file type function
function checkFileType(file: CustomFile, cb: FileFilterCallback) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(null, false); // Pass null as the first argument to the cb callback function
    }
}

const upload = multer({
    storage: storage,
    limits: {fileSize: 50000000},
    fileFilter: function (req: Request, file: CustomFile, cb:FileFilterCallback) {
        try {
            checkFileType(file, cb);
        } catch (error) {
            // Handle the error gracefully
            cb(new Error('Invalid file type'));
        }
    }
}).array('media', 4);

export const googlAuth = async (req: CustomRequest, res: Response, next: NextFunction) => {
    // iniialize google Oauth flow
    try {
        const oAuth2Client = req.drive?.oAuth2;

        const authUrl: any = await oAuth2Client?.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: SCOPES
        });
    
        res.redirect(authUrl);

    } catch(error) {
        next(error);
    }

} 


export const googleCallback = async (req: CustomRequest, res: Response, next: NextFunction) => {
    // call back endpoint

    const code = req.query.code;

    if (!code) {
      return res.status(400).send('Authorization code is missing');
    }
  
    try {
        const auth = req.drive?.oAuth2;

        // Exchange authorization code for tokens
        const data: any  = await auth?.getToken(code as string);

        // Set the credentials for the OAuth2 client
        auth?.setCredentials(data?.tokens);

        // Save the tokens to a file for later use
        fs.writeFileSync('tokens.json', JSON.stringify(data?.tokens, null, 2));

        // delete the tokens from the database
        await prisma.googleToken.deleteMany();

        await prisma.googleToken.create({
            data: {
                tokenData: data?.tokens
            }
        })

        console.log('Tokens saved to tokens.json');
        res.redirect("/home");
    } catch (error) {
        console.error('Error retrieving access token:', error);
        
        next(error);
    }
}

export const driveUpload = async (req: CustomRequest, res: Response, next: NextFunction) => {
    
    try {

        upload(req, res, async (err) => {
            if (err) {
                // res.render('index', {msg: err});
                return res.status(500).json({ msg: err.message });
            } else {
                if (!req.files || req.files.length === 0) {
                    // res.render('index', {msg: 'No file selected'});
                    return res.status(400).json({ msg: 'No files selected' });
                } else {

                    const oAuth2Client = req.drive?.oAuth2;
        
                    // Access the uploaded file from req.file
                    const uploadedFiles = req.files as Express.Multer.File[];

                                // First, create a new Post entry
                    const post = await prisma.post.create({
                        data: {
                            description: req.body.description,
                        }
                    });

                    const images = [];

                    console.log('auth received')
            
                    const drive = google.drive({version: 'v3', auth: oAuth2Client}) // initiate a new drive instance
            
                    const folderId: string = process.env.GOOGLE_DRIVE_FOLDER_ID || "";
            
                    console.log('The folderId is', folderId)
                    
                    for (const uploadedFile of uploadedFiles) {
                        const fileMetaData: gDriveMetaData = {
                            name: `schedule${Date.now()}.png`,
                            parents: [folderId]
                        };

                        console.log('filepath', uploadedFile);

                        let bodyContent: Buffer | Readable;

                        bodyContent = uploadedFile.buffer;

                        // make buffer readable
                        const bodyStream = new Readable();
                        bodyStream.push(uploadedFile.buffer);
                        bodyStream.push(null); // Indicates the end of the stream
                        bodyContent = bodyStream;

                        const media: gDriveMedia = {
                            mimeType: uploadedFile.mimetype,
                            body: bodyContent
                        };

                        console.log('uploading image');
                        console.log('readable buffer', bodyContent);
                        
                        // upload the image here
                        const file = await drive.files.create({
                            requestBody: fileMetaData,
                            media: media,
                            fields: 'id'
                        });

                        console.log(`File uploaded successfully, ID: ${file?.data?.id}`)

                        // generate a public url
                        const fileId: any = file?.data?.id;
                
                        const fileDriveUrl: any = await generatePublicUrl(fileId, oAuth2Client, next)
                
                        // Create an Image record for each file
                        const image = await prisma.image.create({
                            data: {
                                postId: post.id,
                                webViewLink: fileDriveUrl?.webViewLink,
                                webContentLink: fileDriveUrl?.webContentLink,
                                fileId: fileId
                            }
                        });

                        images.push(image);
                    };

                    const description = req.body.description;
                    console.log(`File uploaded successfully with description: ${description}`);
                    return res.status(201).json({msg: "Upload Successful", posts: {...post, images}});

                }
            }
        });

    }  catch(error) {
        next(error);
    }
    
}

const generatePublicUrl = async (fileId: any, oAuth2Client: any, next: NextFunction) => {
    // make the post public
    try {

        const drive = google.drive({ version: 'v3', auth: oAuth2Client });

        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        });

        console.log('permissions changed')

        const result = await drive.files.get({
            fileId: fileId,
            fields: 'webViewLink, webContentLink'
        });
    
        console.log(result.data)
    
        return result.data
    } catch (error) {
        next(error)
    }
}

// route to handle file upload
export const uploadMedia = async (req: Request, res: Response, next: NextFunction) => {
    try {
            // call multer upload function
        upload(req, res, (err) => {
            if (err) {
                res.render('index', {msg: err});
            } else {
                if (req.file === undefined) {
                    res.render('index', {msg: 'No file selected'});
                } else {
                    const description = req.body.description;
                    console.log(`File uploaded successfully with description: ${description}`);
                    return res.send(`File uploaded successfully with description: ${description}`);

                }
            }
        });


    } catch(error) {
        next(error);
    }
}

// delete a file from google drive
export const deleteFile = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const fileId = req.body.fileId;
        const oAuth2Client = req.drive?.oAuth2;

        if (!fileId) {
            return res.status(400).send('File ID is required');
        }
        
        const drive = google.drive({ version: 'v3', auth: oAuth2Client });

        await drive.files.update({
            fileId: fileId,
            requestBody: {
                trashed: true
            }
        });

        console.log(`File with ID: ${fileId} moved to trash successfully`);

        res.send(`File with ID: ${fileId} moved to trash successfully`);

    } catch (error) {
        next(error);
    }
}