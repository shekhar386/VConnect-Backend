/**
 * Model for Users
 */

import { Schema, model } from "mongoose";
import { generate } from "shortid";

export interface IUser {
    name: string, //user name
    email: string, //user email
    password: string, //user password
    dob: string,
    country: string,
    friendList: string[],
    friendRequest: string[],
    notification: string[],
    disabled: boolean,
    profilePic: string,
    bio: string,
    numberOfPosts: number

}

//Creating schema for user
const userSchema=new Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    dob:{
        type:String,
        required: true,
    },
    country:{
        type:String,
        required: true,
    },
    friendList:[{
        type:String,
    }],
    friendRequest:[{
        type:String,
    }],
    notification:[{
        type:String,
    }],
    disabled:{
        type:Boolean,
    },
    profilePic:{
        type:String,
    },
    bio:{
        type:String,
    },
    numberOfPosts:{
        type:Number,
    },
})

//Exporting the model
export default model<IUser>("user", userSchema);
