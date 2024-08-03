# Post Scheduler

## Live Link
### [Post Scheduler](https://github.com/horlami228/Post-scheduler)

## Getting Started

## Description

### This project is a simple automated post scheduler that makes use of linkedin API, twitter API to post to linkedin and twitter successfully. The distincitve feature is the use of generative AI to generate post captions suited for the social platforms. The project was build using nodejs, typescript and express js.

## Features

This project includes the following features:

- Store image in google drive using google drive API(user access token) and store the image id in mongodb database
- Store image description in mongodb database
- Store google drive web content and web view link in mongodb database
- Generate post caption using generative AI (Gemini)
- Post to linkedin using user access token
- Post to twitter using user access token

## Technologies

The project is built with the following technologies:
- Nodejs
- Typescript
- Express js
- MongoDB
- Prisma
- Google Drive API
- Twitter API
- Linkedin API
- Gemini API
- Swagger

## Demo Video
[![Experience the Demo](/src/public/images/scheduler.png)](https://drive.google.com/file/d/1qvwyOoQ6wxyDiQKtAQYTxU4gkwT7E6L4/view?usp=sharing)

## API Documentation
[API Documentation](https://localhost:8000/api-docs)

## Installation
fork the repository and clone it to your local machine

```bash

$ git clone 
$ cd post-scheduler
$ npm install
$ npm run dev

```
find the application running on localhost:8000

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env.development` filen in the root directory and you can also follow the `.env.example`:

### Database Configuration

- `DATABASE_URL`: The MongoDB connection string. Replace `<username>` and `<password>` with your MongoDB Atlas credentials.

### Server Configuration

- `SERVER`: The server URL or port for your backend (e.g., `localhost:8000`).
- `SESSION_SECRET`: A secret key used to sign session cookies. Generate a strong, random value.

### Google Drive OAuth Credentials

- `GOOGLE_DRIVE_CLIENT_ID`: Your Google Drive OAuth Client ID. Obtain this from the [Google Cloud Console](https://console.cloud.google.com/).
- `GOOGLE_DRIVE_CLIENT_SECRET`: Your Google Drive OAuth Client Secret. Obtain this from the [Google Cloud Console](https://console.cloud.google.com/).
- `GOOGLE_DRIVE_FOLDER_ID`: The ID of the folder in Google Drive where files will be stored.

### LinkedIn OAuth Credentials

- `LINKEDIN_CLIENT_ID`: Your LinkedIn OAuth Client ID. Obtain this from the [LinkedIn Developer Portal](https://developer.linkedin.com/).
- `LINKEDIN_CLIENT_SECRET`: Your LinkedIn OAuth Client Secret. Obtain this from the [LinkedIn Developer Portal](https://developer.linkedin.com/).

### Twitter OAuth Credentials

- `TWITTER_API_KEY`: Your Twitter API Key. Obtain this from the [Twitter Developer Portal](https://developer.x.com/en).
- `TWITTER_API_SECRET_KEY`: Your Twitter API Secret Key. Obtain this from the [Twitter Developer Portal](https://developer.x.com/en).
- `TWITTER_ACCESS_TOKEN`: The access token for Twitter API.Obtain this from the [Twitter Developer Portal](https://developer.x.com/en).
- `TWITTER_ACCESS_TOKEN_SECRET`: The access token secret for Twitter API.Obtain this from the [Twitter Developer Portal](https://developer.x.com/en).
- `TWITTER_CLIENT_ID`: Your Twitter OAuth Client ID. Obtain this from the [Twitter Developer Portal](https://developer.x.com/en).
- `TWITTER_CLIENT_SECRET`: Your Twitter OAuth Client Secret. Obtain this from the [Twitter Developer Portal](https://developer.x.com/en).
- `TWITTER_BEARER_TOKEN`: The bearer token for Twitter API.

### Gemini API

- `GEMINI_API_KEY`: Your API key for the Gemini service.Obtain this from the [Gemini API](https://ai.google.dev/).

### Redirect URI

- `REDIRECT_URI`: The redirect URI for your application.

## Usage

### create your own account using the API documentation which would be used to login to your Post Scheduler UI


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Contact

- [Email](mailto:akintolaolamilekan51@gmail.com)
- [LinkedIn](www.linkedin.com/in/akintola-olamilekan)
- [Twitter](https://twitter.com/lazy_codding)
- Portfolio: [portfolio-infiniteglitch](https://portfolio-infiniteglitch.vercel.app)
