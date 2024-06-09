import mongoose from './engine/dataBase.js';
import { Document, Schema, Model} from 'mongoose';

// Note schema definitions

interface Vnote extends Document {
    fileName: string;
    title: string;
    content: string;
    folderId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const noteSchema: Schema = new Schema<Vnote>({
    fileName: {type: String},
    title: {type: String, default: "Untitled"},
    content: {type: String, required: true},
    userId: {type: Schema.Types.ObjectId, ref: "User"},
    folderId: {type: Schema.Types.ObjectId, ref: "Folder"},
    createdAt: {type: Date, default: Date.now()},
    updatedAt: {type: Date, default: Date.now()}
});

const note: Model<Vnote> = mongoose.model<Vnote>("Note", noteSchema, "notes_collection");

export default note;
