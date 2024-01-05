import {Router} from "express";
import {CommentController} from "../controllers/comment.controller";

export const commentRouter = Router()

commentRouter.get('/post/:id', CommentController.getPostController)