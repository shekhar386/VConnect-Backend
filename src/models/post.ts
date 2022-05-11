/**
 * Model for Post
 */

import { Schema, model } from "mongoose";
import {IUser} from "./user";
import {boolean} from "joi";

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
    mediaType: string,
    dateAdded: string,
    sharedPost: string | IPost,

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
    mediaType: {
        type: String,
    },
    dateAdded: {
        type: String,
    },
    sharedPost: {
        type: Schema.Types.ObjectId,
    },
})

//Exporting the model
export default model<IPost>("post", postSchema);
