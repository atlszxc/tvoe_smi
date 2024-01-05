import { Router } from "express";
import { TagController } from "../controllers/tag.controller";

export const tagRouter = Router()

tagRouter.get('/', TagController.getTags)
tagRouter.get('/:categoryId', TagController.getCategoryTags)
tagRouter.post('/create', TagController.createTag)
tagRouter.delete('/:id', TagController.deleteTag)