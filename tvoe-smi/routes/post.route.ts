import { Router } from "express";
import { PostController } from "../controllers/post.controller";
import { PostOfferController } from "../controllers/postOffer.controller";
import { verifyToken } from "../middlewares/verifyToken";

export const postRouter = Router()

postRouter.get('/', PostController.getPosts)
postRouter.get('/search', PostController.searchPosts)
postRouter.get('/search/popular', PostController.getPopularPosts)
postRouter.get('/new', PostController.getNewNews)
postRouter.get('/offers', PostOfferController.getPostOffers)
postRouter.post('/offer/create', PostOfferController.createPostOffer)
postRouter.get('/:slug', PostController.getPost)
postRouter.get('/category/:categoryId', PostController.getCategoryPosts)
postRouter.patch('/update/viewscounter/:id', PostController.updateViewsCount)
postRouter.patch('/update/:id', verifyToken, PostController.updatePostReactions)
postRouter.get('/tag/:tagId', PostController.getTagPosts)