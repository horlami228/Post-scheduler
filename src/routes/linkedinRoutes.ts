// linkedin routes

import Router from 'express';
import { linkedinAuth, linkedinCallBack, profile, makePost } from '../controller/linkedinController.js';
import loadTokens from '../middleware/linkedinLoadToken.js';

const router = Router();

// authentication
router.get('/auth/linkedin', linkedinAuth);

// linkedin callback
router.get('/auth/linkedin/callback', linkedinCallBack);

// get linkedin profile
router.get('/auth/linkedin/profile', loadTokens, profile);

// make linkedin text post
router.post('/auth/linkedin/makePost', loadTokens, makePost);

export default router;
