/**
 * Main file with all the app services
 */

import express, { Request } from "express";
import bodyParser from "body-parser";
import Joi from "joi";
import session from "express-session";
import MongoStore from "connect-mongo";
import expressResponse from "../middleware/expressResponse";
import CtrlUser from "../controller/user";
import CtrlPost from "../controller/post";
import cors from 'cors';
import Time from '../utils/time'

/**
 * Main server class
 */
export default class Server {

    //calling the express to app variable
    app = express();
    //function to start services
    async start() {
        console.log("Starting services")
        //Listening to port no. in .env file
        this.app.listen(process.env.PORT);
        console.log(`Express server started at http://localhost:${process.env.PORT}`)
        //calling middleware
        this.middleware();
        //calling routes
        this.routes();
    }

    /**
     * Middleware
     */
    middleware() {
        //for parsing the URL-encoded data
        this.app.use(bodyParser.urlencoded({extended: false}));
        this.app.use(bodyParser.json());
        this.app.use(cors());
        //initializing the session
        this.app.use(
            session({
                secret: process.env.SESSION_SECRET,
                resave: false,
                saveUninitialized: false,
                store: MongoStore.create({
                    mongoUrl: process.env.SESSION_MONGO_URL,
                }),
                cookie: {
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                },
            }),
        );
    }

    /**
     * App routes for VConnect API
     */
    routes() {

        /**
         * Create a user
         */
        this.app.post("/user/create", expressResponse(async (req: Request) => {
            //creating joi schema
            const schema = Joi.object({
                name: Joi.string().required(),//user's name
                email: Joi.string().email().required(),//user email id
                password: Joi.string().required(),//user password
                dob: Joi.string().required(),
                country: Joi.string().required(),
                friendList: Joi.array().items(Joi.string()).default([]),
                friendRequest: Joi.array().items(Joi.string()).default([]),
                notification: Joi.array().items(Joi.object()).default([]),
                disabled: Joi.boolean().default(false),
                profilePic: Joi.string().default("https://www.iconsdb.com/icons/preview/violet/add-user-2-xxl.png"),
                bio: Joi.string().default(""),
                numberOfPosts: Joi.number().default(0),
            })
            //validate the schema
            const data = await schema.validateAsync(req.body);
            //call and return controller
            //@ts-ignore
            return CtrlUser.create(data);
        }));

        /**
         * Edit a user
         */
        this.app.put("/user/edit", expressResponse(async (req: Request) => {
            //creating joi schema
            const schema = Joi.object({
                name: Joi.string().required(),//user's name
                email: Joi.string().email().required(),//user email id
                dob: Joi.string().required(),
                country: Joi.string().required(),
                profilePic: Joi.string(),
                bio: Joi.string(),
            })
            //validate the schema
            // @ts-ignore
            const data = await schema.validateAsync(req.body);
            //call and return controller
            //@ts-ignore
            return CtrlUser.edit(req.session.user.uid, data);
        }));

        /**
         * Authenticate a user
         */
        this.app.post("/user/auth", expressResponse(async (req: Request) => {
            //joi schema
            const schema = Joi.object({
                email: Joi.string().email().required(), //email of user
                password: Joi.string().required(), //password for user
            });
            //validate joi schema
            await schema.validateAsync(req.body);
            //calling controller
            //setting session for user
            //@ts-ignore
            req.session.user = await CtrlUser.auth(req.body.email, req.body.password);
            //show success
            return "Login Success!";
        }));

        /**
         * update a user details
         */
        this.app.put("/user/userDetails", expressResponse(async (req: Request) => {
            //joi schema
            const schema = Joi.object({
                profilePic: Joi.string().required(), //profile pic of user
                bio: Joi.string().required(), //bio for user
            });
            //validate joi schema
            await schema.validateAsync(req.body);
            //@ts-ignore
            const email = req.session.user.email;
            //calling controller
            //setting session for user
            //@ts-ignore
            await CtrlUser.userDetails(email, req.body.bio, req.body.profilePic);
        }));

        /**
         * User's profile
         * only by user
         */
        this.app.get("/user/me", expressResponse(async (req: Request) => {
            //joi schema
            /*const schema = Joi.object({
                email: Joi.string().email(), //email of user
            });
            //validate joi schema
            await schema.validateAsync(req.query);*/
            //return and call controller
            //@ts-ignore
            return CtrlUser.profile(req.session.user.email);
        }));

        /**
         * Create a Post
         * by the user
         */
        this.app.post("/post/create", expressResponse(async (req: Request) => {
            //joi schema
            const schema = Joi.object({
                body: Joi.string().required(),
                picture: Joi.string().default(''),
                public: Joi.boolean().default(false),
                weight: Joi.string().default('normal'),
                style: Joi.string().default('normal'),
                mediaType: Joi.string().default(''),
                dateAdded: Joi.string().default(Time.current()),
            });
            //validate joi schema
            const data = await schema.validateAsync(req.body);
            //calling controller
            //@ts-ignore
            return CtrlPost.create({...data, uid: req.session.user.uid});
        }));

        /**
         * All post
         * only by user
         */
        this.app.get("/post/all", expressResponse(async (req: Request) => {
            //return and call controller\
            //@ts-ignore
            return CtrlPost.findAllPost(req.session.user.uid);
        }));

        /**
         * User's post
         * only by user
         */
        this.app.get("/post/user", expressResponse(async (req: Request) => {
            //return and call controller
            //@ts-ignore
            return CtrlPost.findUserPost(req.session.user.uid);
        }));

        /**
         * User's post
         * other
         */
        this.app.get("/post/other", expressResponse(async (req: Request) => {
            //joi schema
            const schema = Joi.object({
                uid: Joi.string().required(), //id of user
            });
            //validate joi schema
            await schema.validateAsync(req.query);
            //return and call controller
            //@ts-ignore
            return CtrlPost.findOtherUserPost(req.query.uid, req.session.user.uid);
        }));

        /**
         * like post
         */
        this.app.put("/post/like", expressResponse(async (req: Request) => {
            //joi schema
            const schema = Joi.object({
                postId: Joi.string().required(), //ID of post
            });
            //validate joi schema
            await schema.validateAsync(req.body);
            //calling controller
            //@ts-ignore
            return CtrlPost.likePost(req.session.user.uid, req.body.postId);
        }));

        /**
         * unlike post
         */
        this.app.put("/post/unlike", expressResponse(async (req: Request) => {
            //joi schema
            const schema = Joi.object({
                postId: Joi.string().required(), //ID of post
            });
            //validate joi schema
            await schema.validateAsync(req.body);
            //calling controller
            //@ts-ignore
            return CtrlPost.unlikePost(req.session.user.uid, req.body.postId);
        }));

        /**
         * User list
         * only by user
         */
        this.app.get("/user/search", expressResponse(async (req: Request) => {
            //joi schema
            const schema = Joi.object({
                searchData: Joi.string(),
            });
            //validate joi schema
            await schema.validateAsync(req.query);
            //return and call controller
            //@ts-ignore
            return CtrlUser.findUserList(req.query.searchData);
        }));

        /**
         * Other User's profile
         * only by user
         */
        this.app.get("/user/other", expressResponse(async (req: Request) => {
            //joi schema
            const schema = Joi.object({
                email: Joi.string().required(), //email of user
            });
            //validate joi schema
            await schema.validateAsync(req.query);
            //return and call controller
            //@ts-ignore
            return CtrlUser.profile(req.query.email);
        }));

        /**
         * Send Request
         * only by user
         */
        this.app.put("/user/request", expressResponse(async (req: Request) => {
            //joi schema
            const schema = Joi.object({
                targetId: Joi.string().required(), //id of target user
            });
            //validate joi schema
            await schema.validateAsync(req.body);
            //return and call controller
            //@ts-ignore
            return CtrlUser.sendRequest(req.session.user.uid, req.body.targetId);
        }));

        /**
         * Confirm Request
         * only by user
         */
        this.app.put("/user/confirm", expressResponse(async (req: Request) => {
            //joi schema
            const schema = Joi.object({
                targetId: Joi.string().required(), //id of target user
            });
            //validate joi schema
            await schema.validateAsync(req.body);
            //return and call controller
            //@ts-ignore
            return CtrlUser.confirmRequest(req.session.user.uid, req.body.targetId);
        }));

        /**
         * Remove Friend
         * only by user
         */
        this.app.put("/user/deleteFriend", expressResponse(async (req: Request) => {
            //joi schema
            const schema = Joi.object({
                targetId: Joi.string().required(), //id of target user
            });
            //validate joi schema
            await schema.validateAsync(req.body);
            //return and call controller
            //@ts-ignore
            return CtrlUser.unFriend(req.session.user.uid, req.body.targetId);
        }));

        /**
         * Request User Data
         */
        this.app.get("/user/requestUserData", expressResponse(async (req: Request) => {
            //joi schema
            const schema = Joi.object({
                userIds: Joi.array().items(Joi.string()).default([]),
            });
            //validate joi schema
            const data = await schema.validateAsync(req.query);
            //return and call controller
            //@ts-ignore
            return CtrlUser.findUserRequestList(data.userIds);
        }));
    }
}
