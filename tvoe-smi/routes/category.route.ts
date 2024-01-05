import { Router } from "express";
import { CategoryControllers } from "../controllers/category.controller";

export const categoryRouter = Router()

categoryRouter.get('/', CategoryControllers.getCategories)
categoryRouter.get('/:id', CategoryControllers.getCategory)