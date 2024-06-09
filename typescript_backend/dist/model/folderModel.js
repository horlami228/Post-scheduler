import mongoose from './engine/dataBase.js';
import { Schema } from 'mongoose';
const folderSchema = new Schema({
    folderName: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    isRoot: { type: Boolean },
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: Date.now() }
});
const folder = mongoose.model("Folder", folderSchema, "folders_collection");
export default folder;
