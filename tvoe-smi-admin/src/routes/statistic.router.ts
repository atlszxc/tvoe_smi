import { Router } from "express";
import {StatisticController} from "../controllers/statistic.controller";

export const statisticRouter = Router()

statisticRouter.get('/post', StatisticController.getPostsStatistic)
statisticRouter.get('/category', StatisticController.getCategoryStatistic)
statisticRouter.get('/user', StatisticController.getUserStatistic)
statisticRouter.get('/auth', StatisticController.getAuthStatistic)