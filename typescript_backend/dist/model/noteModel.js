import mongoose from './engine/dataBase.js';
import { Schema } from 'mongoose';
const noteSchema = new Schema({
    fileName: { type: String },
    title: { type: String, default: "Untitled" },
    content: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    folderId: { type: Schema.Types.ObjectId, ref: "Folder" },
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: Date.now() }
});
const note = mongoose.model("Note", noteSchema, "notes_collection");
export default note;
