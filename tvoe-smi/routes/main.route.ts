import { Router } from "express";
import { MainPageController } from "../controllers/mainPage.controller";

export const mainRouter = Router()

mainRouter.get('/', MainPageController.getAll)