/**
 * Connects to the MongoDB database using the provided URI.
 * @throws {Error} If DATABASE_URI is not defined.
 */
import mongoose from 'mongoose';
import {Config, DbConfig, config} from '../../config/config.js';

// Define the URI for the MongoDB database
const env: keyof Config = (process.env.NODE_ENV as keyof Config) || 'development';

const dbConfig:DbConfig = config[env];
// Connect to the MongoDB database using the provided URI
mongoose.connect(dbConfig.uri)
    .then(() => console.log("connected succesfully"))
    .catch((err) => console.log("failed to connect", err.message));

// Export the mongoose object as the default export
export default mongoose;
