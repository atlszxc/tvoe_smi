import { Router } from "express";
import { CommentController } from "../controllers/comment.controller";
import { verifyToken } from "../middlewares/verifyToken";
import {updateToken} from "../middlewares/updateToken";

export const commentRoute = Router()

commentRoute.get('/:slug', updateToken, CommentController.getPostComments)
commentRoute.get('/comment/:id', updateToken, CommentController.getCommentReplies)
commentRoute.get('/user/:id', verifyToken, CommentController.getUserComments)
commentRoute.delete('/user/:id', verifyToken, CommentController.deleteUserComment)
commentRoute.post('/create', verifyToken, CommentController.createComment)
commentRoute.patch('/likes/:id', verifyToken, CommentController.updateLikes)
commentRoute.patch('/disslikes/:id', verifyToken, CommentController.updateDislikes)