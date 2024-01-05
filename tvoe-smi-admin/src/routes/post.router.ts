import { Router } from "express";
import { PostController } from "../controllers/post.controller";
import multer from 'multer'
import {verifyToken} from "../middlewares/verifyToken";

export const postRouter = Router()

const storage = multer.memoryStorage()
const uploadStorage = multer({ storage })

postRouter.get('/', verifyToken, PostController.getPosts)
postRouter.get('/all', PostController.getAllPosts)
postRouter.post("/create", verifyToken, uploadStorage.fields([{ name: 'titleImg', maxCount: 1 }, { name: 'imgs' }]), PostController.createPost)
postRouter.get('/:id', verifyToken, PostController.getPost)
postRouter.delete('/:id', verifyToken, PostController.deletePost)
postRouter.patch('/update/:id', verifyToken, uploadStorage.fields([{ name: 'titleImg', maxCount: 1 }, { name: 'imgs' }]), PostController.updatePost)
postRouter.patch('/moderate/:id', verifyToken, PostController.changeStatusToModered)
postRouter.patch('/reworked/:id', verifyToken, PostController.changeStatusToReworked)
postRouter.patch('/archive/:id', verifyToken, PostController.changeStatusToArchive)
postRouter.patch('/publish/:id', verifyToken, PostController.changeStatusToPublished)
