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
        await user.findOneAndUpdate({_id: body.uid}, {$inc: {numberOfPosts: 1}}).lean();
        //create post
        return post.create(body);
    }

    /**
     * Create shared Post
     * @param body
     */
    static async createSharedPost(body: any): Promise<IPost> {
        await user.findOneAndUpdate({_id: body.uid}, {$inc: {numberOfPosts: 1}}).lean();
        await post.findOneAndUpdate(
            {_id: body.sharedPost},
            {$push: {shares: body.uid}},
            {new: true}
        );
        //share post
        return post.create(body);
    }

    /**
     * Return the single posts
     * @param userData
     * for profile screen
     */
    static async findSinglePost(postId): Promise<IPost[]> {
        //return all tickets which are not expired
        const postData = post.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(postId)
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
        ]);
        return postData;
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
                    from: "posts",
                    localField: "sharedPost",
                    foreignField: "_id",
                    as: "post",
                    pipeline: [
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
                    ]
                }
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
                            {$or: [{$eq: ["$public", true]}, {$in: [userId, "$user.friendList"]}]},
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
                $lookup: {
                    from: "posts",
                    localField: "sharedPost",
                    foreignField: "_id",
                    as: "post",
                    pipeline: [
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
                    ]
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
    static async findOtherUserPost(userData, currUserData): Promise<IPost[]> {
        console.log(userData);
        const postData =  post.aggregate([
            {
                $match: {
                    uid: new mongoose.Types.ObjectId(userData),
                },
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "sharedPost",
                    foreignField: "_id",
                    as: "post",
                    pipeline: [
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
                    ]
                }
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
                            {$or: [{$eq: ["$public", true]}, {$in: [ currUserData, "$user.friendList"]}]}
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
    static async likePost(userId, postId): Promise<any> {
        const postData = await post.findOneAndUpdate(
            {_id: postId},
            {$push: {likes: userId}},
            {new: true}
        );
        const userData = await user.findOne({_id: userId})
        await user.findOneAndUpdate({_id: postData.uid}, {$push: {notification: {uName: userData.name, type: 1}}});
        return postData;
    }

    /**
     * unlike post
     * @param userData
     */
    static async unlikePost(userId, postId): Promise<IPost[]> {
        return post.findOneAndUpdate({_id: postId}, {$pull: {likes: userId}}, {new: true});
    }
}

