import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";

export const categoryRouter = Router()

categoryRouter.get('/', CategoryController.getCategories)
categoryRouter.post('/create', CategoryController.createCategory)
categoryRouter.delete('/delete/:id', CategoryController.deleteCategory)