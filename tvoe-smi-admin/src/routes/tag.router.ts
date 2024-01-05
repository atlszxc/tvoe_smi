import { Router } from "express";
import { TagController } from "../controllers/tag.controller";

export const tagRouter = Router()

tagRouter.post('/create', TagController.createTag)