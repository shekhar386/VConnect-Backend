/**
 * Controller for post
 */
import mongoose from "mongoose";
import post, {IPost} from "../models/post";
import user from "../models/user";

export default class CtrlPost {
    /**
     * Create new Post
     * @param body
     */
    static async create(body: any): Promise<IPost> {
        const userData = await user.findOneAndUpdate({_id: body.uid}, {$inc: {numberOfPosts: 1}}).lean();
        console.log(body);
        //create jobSeeker
        return post.create(body);
    }

    /**
     * Return the all posts
     * @param userData
     * for profile screen
     */
    static async findAllPost(userId): Promise<IPost[]> {
        //return all tickets which are not expired
        const postData =  post.aggregate([
            {
                $match: {
                    uid: {$ne: new mongoose.Types.ObjectId(userId)}
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "uid",
                    foreignField: "_id",
                    as: "user",
                }
            },
            {
                $unwind: "$user"
            },
            {
                $match: {
                    $expr: {
                        $and: [
                            {$eq: ["$user.disabled", false]},
                            {$or: [{$eq: ["$public", true]}, {$in: ["$uid", "$user.friendList"]}]}
                        ]
                    }
                }
            },
            {
                $sort: {
                    dateAdded: -1,
                }
            }
        ]).exec();
        return postData;
    }

    /**
     * Return the user's posts
     * @param userData
     * for profile screen
     */
    static async findUserPost(userData): Promise<IPost[]> {
        //return all tickets which are not expired

        return post.aggregate([
            {
                $match: {
                    //@ts-ignore
                    uid: new mongoose.Types.ObjectId(userData),
                }
            },
            {
                $sort: {
                    dateAdded: -1,
                }
            }
        ]);
    }

    /**
     * Return the user's posts
     * @param userData
     * for profile screen
     */
    static async findOtherUserPost(userData): Promise<IPost[]> {
        console.log(userData);
        const postData =  post.aggregate([
            {
                $match: {
                    uid: new mongoose.Types.ObjectId(userData),
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "uid",
                    foreignField: "_id",
                    as: "user",
                }
            },
            {
                $unwind: "$user"
            },
            {
                $match: {
                    $expr: {
                        $and: [
                            {$or: [{$eq: ["$public", true]}, {$in: ["$uid", "$user.friendList"]}]}
                        ]
                    }
                }
            },
            {
                $sort: {
                    dateAdded: -1,
                }
            }
        ]).exec();
        return postData;
    }

    /**
     * like post
     * @param userData
     */
    static async likePost(userId, postId): Promise<IPost[]> {
        return post.findOneAndUpdate({_id: postId}, {$push: {likes: userId}}, {new: true})
    }

    /**
     * unlike post
     * @param userData
     */
    static async unlikePost(userId, postId): Promise<IPost[]> {
        return post.findOneAndUpdate({_id: postId}, {$pull: {likes: userId}}, {new: true})
    }
}

