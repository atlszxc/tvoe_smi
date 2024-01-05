import {Request, Response} from 'express'
import {ResponseStatuses, ResponseStatusKeys} from "../consts/ResponsesStatuses";
import {PostStatisticService} from "../services/statistics/postStatistic.service";
import {CategoryStatisticsService} from "../services/statistics/categoryStatistics.service";
import {UserStatisticsService} from "../services/statistics/usersStatistics.service";

export const StatisticController = {
    async getPostsStatistic(req: Request, res: Response) {
        try {
            const { response, err } = await PostStatisticService.getPostsStatusStatistic(
                req.query.start as string,
                req.query.finish as string,
            )
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            console.log(error)
            return res.status(503).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    },

    async getCategoryStatistic(req: Request, res: Response) {
        try {
            const { response, err } = await CategoryStatisticsService.getViewsByCategory(
                req.query.start as string,
                req.query.finish as string,
            )
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            console.log(error)
            return res.status(503).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    },

    async getUserStatistic(req: Request, res: Response) {
        try {
            const { response, err } = await UserStatisticsService.getUsersCountStatistics(
                req.query.start as string,
                req.query.finish as string,
            )
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            console.log(error)
            return res.status(503).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    },

    async getAuthStatistic(_: Request, res: Response) {
        try {
            const { response, err } = await UserStatisticsService.getNewUsersByLastWeek()
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            console.log(error)
            return res.status(503).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    }
}