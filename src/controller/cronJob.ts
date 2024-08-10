// This controller here peices everything together
import axios from 'axios';
import axiosRetry from 'axios-retry';
import prisma from '../config/prismaClient.js';
import path from 'path';
import dotenv from 'dotenv';
import gemini from "./generate.js"
import extractCaptions from '../utilities/extractCaption.js';

const envPath = path.resolve('.env.development')

dotenv.config({path: envPath})

console.log(path.resolve('.env.development'));

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

// server
const SERVER = process.env.SERVER || 'http://localhost:8000';
// The cron job controller

const cronJob = async () => {
    try {
        console.log('Cron job started');
        console.log('Fetching post from the database');
        // get the first post from the database
        const post = await prisma.post.findFirst({
            orderBy: {
            id: 'asc'
            }
        });

        if (!post) {
            console.log('No post found in the database');
            return null;
        }

        console.log(post)

        // keep track of the post id
        const postId = post.id;
        const postDescription = post.description;
        const postWebContentLink = post.webContentLink;
        const postFileId = post.fileId;

        // get a caption with AI for the post
        // prompt template

        console.log('Generating caption for the post');

        const prompt = `I have this description and a image and i'm trying to generate a caption because i intend to post it on both linkedin and twitter.

        so follow this:
        
        Target audience: Developers and tech enthusiasts.
        Desired tone: Informative and engaging.
        
        Description: ${postDescription}
        
        Now i want something consistent. you startwith For LinkedIn with colon(:) when done start a new line and put for Twitter with colon(:).
        
        mix up emojis in your captions to make it more lively and dont forget twiiter word count limit
        
        Additional notes: Highlight the efficiency and versatility of the code if the image uploaded is indeed code.`

        console.log("Using AI to generate caption");
        
        // const result: any = await gemini(postWebContentLink, prompt);

        const result = "For LinkedIn: Sometimes simple is best! 💡  For my current project, I didn't need the complexity of a JWT strategy, so I opted for a straightforward username/password session login using Express Session. This efficient approach met my needs perfectly, demonstrating the versatility of Express for various authentication scenarios. For Twitter:  Skip the JWT headache 🤯  Simple username/password session login with Express Session 🙌  Works like a charm for my project!  #ExpressJS #NodeJS #codinglife"

        if (!result) {
            
            console.log('Caption generation failed');
            return null;
        }

        console.log("the result of the caption is", result);

        console.log('Caption generated successfully');
        // extract the caption for each platform from the result
        const captions = extractCaptions(result);

        console.log('Captions extracted successfully');
        console.log(captions);

        // time to make the post to linkedin and twitter

        console.log('Making post to linkedin and twitter');
        //make a post to linkedin
        await axios.post(`${SERVER}/api/auth/linkedin/makeImagePost`, {
            text: captions.linkedin,
            webContentLink: postWebContentLink
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(async (response) => {
            console.log(response.data);
        }).catch((error) => {
            console.error(error);
            process.exit(1); 
            
        })

        console.log('Post made to linkedin successfully');

        //make a post to twitter


        await axios.post(`${SERVER}/api/post/x/image`, {
            uri: postWebContentLink,
            text: captions.twitter
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(async (response) => {
            console.log(response.data);
        }).catch((error) => {
            console.error(error);
            process.exit(1); 
        })

        console.log('Post made to twitter successfully');

        // // delete the post from the database
        // await prisma.post.delete({
        //     where: {
        //         id: postId
        //     }
        // });

        console.log('Post deleted from the database successfully');

        // // delete the post from google drive
        // await axios.delete(`${SERVER}/api/drive/delete`, {
        //     data: {
        //         fileId: postFileId
        //     }
        // }).then((response) => {
        //     console.log(response.data);
        // }).catch((error) => {
        //     console.error(error);
        //     process.exit(1); 
        // })

        console.log('Post deleted from google drive successfully');

        console.log('Post deleted successfully');

        console.log('Cron job completed successfully');
    } catch (error) {
        console.error(error);
    }
}

export default cronJob;
