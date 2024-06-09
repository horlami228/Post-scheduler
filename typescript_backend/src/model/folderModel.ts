import mongoose from './engine/dataBase.js';
import { Document, Schema, Model} from 'mongoose';

// Schema for folders
interface Vfolder extends Document {
    folderName: string;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    isRoot: boolean;
}

const folderSchema: Schema = new Schema<Vfolder>({
    folderName: {type: String, required: true},
    userId: {type: Schema.Types.ObjectId, ref: "User"},
    isRoot: {type: Boolean},
    createdAt: {type: Date, default: Date.now()},
    updatedAt: {type: Date, default: Date.now()}
});

const folder: Model<Vfolder> = mongoose.model<Vfolder>("Folder", folderSchema, "folders_collection");

export default folder;
