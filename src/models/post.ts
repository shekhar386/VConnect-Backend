/**
 * Model for Post
 */

import { Schema, model } from "mongoose";
import {IUser} from "./user";

export interface IPost {
    uid: string | IUser,
    body: string,
    picture: string,
    likes: string[] | IUser[],
    nComments: number,
    shares: string[] | IUser[]
    public: boolean,
    weight: string,
    style: string,
}

//Creating schema for user
const postSchema=new Schema({
    uid: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    body: {
        type: String,
        required: true,
    },
    picture: {
        type: String,
        default: '',
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "user",
        default: [],
    }],
    nComments: {
        type: Number,
        default: 0,
    },
    shares: [{
        type: Schema.Types.ObjectId,
        ref: "user",
        default: []
    }],
    public: {
        type: Boolean,
        required: true,
    },
    weight: {
        type: String,
        required: true,
    },
    style: {
        type: String,
        required: true,
    },
})

//Exporting the model
export default model<IPost>("post", postSchema);
