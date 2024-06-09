import mongoose from './engine/dataBase.js';
import { Schema } from 'mongoose';
const userSchema = new Schema({
    userName: { type: String, required: [true, "username is required"] },
    email: { type: String, required: [true, "email is required"] },
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: Date.now() }
});
const User = mongoose.model("User", userSchema, "users_collection");
export default User;
