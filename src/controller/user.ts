/**
 * Controller for user
 */

import Bcrypt from "../services/bcrypt";
import user, { IUser } from "../models/user";
import mongoose from "mongoose";
import e from "express";

export default class CtrlUser {
    /**
     * Create new user
     * @param body
     */
    static async create(body: any): Promise<IUser> {
        //hashing the password
        const hash = await Bcrypt.hashing(body.password);
        //replacing password with hashed password
        const data = {
            ...body,
            password: hash,
        };
        //create jobSeeker
        return user.create(data);
    }

    /**
     * Authorize user
     * @param email
     * @param password
     */
    static async auth(email: string, password: string): Promise<any> {
        // fetch user from database
        const userData = await user.findOne({ email }).lean();
        // if users exists or not
        if (userData) {
            // verify the password
            const result = await Bcrypt.comparing(password, userData.password);
            // if password is correct or not
            // if correct, return the user
            if (result) {
                await user.findOneAndUpdate({ email: email }, { disabled: false });
                return { uid: userData._id, email: email };
            }
            // throw error
            else {
                throw new Error("password doesn't match");
            }
        }
        // throw error
        else {
            throw new Error("user doesn't exists");
        }
    }

    /**
     * Check if user unique
     * @param email
     * @param userName
     */
    static async uniqueCheck(email: string, userName: string): Promise<any> {
        // fetch user from database
        const user1 = await user.findOne({ email }).lean();

        const user2 = await user.findOne({ name : userName }).lean();

        // if users exists or not
        if (user2) {
            return { success: false, message: "UserName already taken" };
        }
        else if (user1) {
            return { success: false, message: "Email already in use" };
        }
        else { return { success: true, message: "Values unique" } };

    }

    /**
     * Add User Details
     * @param email
     * @param bio
     * @param profilePic
     */
    static async userDetails(email: string, bio: string, profilePic: string): Promise<any> {
        // fetch user from database
        const userData = await user.findOneAndUpdate({
            //@ts-ignore
            email: email
        },
            {
                bio: bio, profilePic: profilePic
            }).lean();
        // if users exists or not
        return userData;

    }

    /**
     * Return the user's profile
     * @param userData
     */
    static async profile(userData): Promise<IUser[]> {
        //return all tickets which are not expired
        return user.aggregate([
            {
                $match: {
                    //@ts-ignore
                    email: userData,
                }
            },
        ]);
    }

    /**
     * Return the user list
     * @param searchData
     * for profile screen
     */
    static async findUserList(searchData): Promise<IUser[]> {
        return user.find({ name: { $regex: '^' + searchData + '.*', $options: 'i' }, disabled: false });
    }

    /**
     * Return the user request list
     * for notification screen
     * @param userIds
     */
    static async findUserRequestList(userIds): Promise<any> {
        let allUserData = [];
        for (const user1 of userIds) {
            let userData = await user.find({ _id: new mongoose.Types.ObjectId(user1) })
            allUserData.push(userData[0]);
        }
        return allUserData;
    }

    /**
     * Send Request
     */
    static async sendRequest(currUser, targetUser): Promise<IUser> {
        return user.findOneAndUpdate(
            { _id: targetUser },
            { $push: { friendRequest: new mongoose.Types.ObjectId(currUser) } },
            { new: true }
        )
    }

    /**
     * Confirm Request
     */
    static async confirmRequest(currUser, targetUser): Promise<String> {
        const curUserData = await user.findOneAndUpdate(
            { _id: currUser },
            {
                $push: { friendList: new mongoose.Types.ObjectId(targetUser) },
                $pull: { friendRequest: new mongoose.Types.ObjectId(targetUser) }
            },
            { new: true }
        )

        await user.findOneAndUpdate(
            { _id: targetUser },
            { $push: { friendList: new mongoose.Types.ObjectId(currUser) } },
            { new: true }
        )

        await user.findOneAndUpdate({ _id: targetUser }, { $push: { notification: { uName: curUserData.name, type: 4 } } });
        return "Success";
    }


    /**
     * Unfriend
     */
    static async unFriend(currUser, targetUser): Promise<String> {
        await user.findOneAndUpdate(
            { _id: currUser },
            { $pull: { friendList: new mongoose.Types.ObjectId(targetUser) } },
            { new: true }
        )

        await user.findOneAndUpdate(
            { _id: targetUser },
            { $pull: { friendList: new mongoose.Types.ObjectId(currUser) } },
            { new: true }
        )
        return "Success";
    }
}

