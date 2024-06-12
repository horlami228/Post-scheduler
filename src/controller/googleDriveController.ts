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
import dotevn from 'dotenv';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const envPath = path.resolve('.env.development')

dotevn.config({path: envPath})

console.log(path.resolve('.env.development'));

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

const filePath = path.resolve('1717401116086.jpeg')
console.log('filepath:', filePath);

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
    limits: {fileSize: 1000000},
    fileFilter: function (req: Request, file: CustomFile, cb:FileFilterCallback) {
        try {
            checkFileType(file, cb);
        } catch (error) {
            // Handle the error gracefully
            cb(new Error('Invalid file type'));
        }
    }
}).single('media');

export const googlAuth = async (req: CustomRequest, res: Response, next: NextFunction) => {
    // initialize google Oauth flow
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
        fs.writeFileSync('tokens.json', JSON.stringify(data?.tokens));

        console.log('Tokens saved to tokens.json');
        res.send('Authentication successful! You can close this window.');
    } catch (error) {
        console.error('Error retrieving access token:', error);
        
        next(error);
    }
}

export const driveUpload = async (req: CustomRequest, res: Response, next: NextFunction) => {
    
    try {

        upload(req, res, async (err) => {
            if (err) {
                res.render('index', {msg: err});
            } else {
                if (req.file === undefined) {
                    res.render('index', {msg: 'No file selected'});
                } else {

                    const oAuth2Client = req.drive?.oAuth2;
        
                    // Access the uploaded file from req.file
                    const uploadedFile = req.file;

                    console.log('auth received')
            
                    const drive = google.drive({version: 'v3', auth: oAuth2Client}) // initiate a new drive instance
            
                    const folderId: string = process.env.GOOGLE_DRIVE_FOLDER_ID || "";
            
                    console.log('The folderId is', folderId)
            
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
            
                    // add to the database
                    const post = await prisma.post.create({
                        data: {
                            description: req.body.description,
                            webViewLink: fileDriveUrl?.webViewLink,
                            webContentLink: fileDriveUrl?.webContentLink,
                            fileId: fileId
                        }
                    })
                    
                    const description = req.body.description;
                    console.log(`File uploaded successfully with description: ${description}`);
                    return res.status(201).json({msg: "post created", post: post});

                }
            }
        });

        // const oAuth2Client = req.drive?.oAuth2;
        

        // console.log('auth received')

        // const drive = google.drive({version: 'v3', auth: oAuth2Client}) // initiate a new drive instance

        // const folderId: string = process.env.GOOGLE_DRIVE_FOLDER_ID || "";

        // console.log('The folderId is', folderId)

        // const fileMetaData: gDriveMetaData = {
        //     name: `schedule${Date.now()}.png`,
        //     parents: [folderId]
        // };

        // const media: gDriveMedia = {
        //     mimeType: 'image/jpeg',
        //     body: fs.createReadStream(filePath)
        // };

        // console.log('uploading image');

        // // upload the image here
        // const file = await drive.files.create({
        //     requestBody: fileMetaData,
        //     media: media,
        //     fields: 'id'
        // });

        // console.log(`File uploaded successfully, ID: ${file?.data?.id}`)

        // // generate a public url
        // const fileId: any = file?.data?.id;

        // const fileDriveUrl: any = await generatePublicUrl(fileId, oAuth2Client, next)

        // // add to the database
        // const post = await prisma.post.create({
        //     data: {
        //         description: 'something nice',
        //         webViewLink: fileDriveUrl?.webViewLink,
        //         webContentLink: fileDriveUrl?.webContentLink,
        //         fileId: fileId
        //     }
        // })
        
        // res.status(201).json({msg: "post created", post: post});

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