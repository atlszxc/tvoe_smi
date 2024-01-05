import { Request, Response } from 'express'
import { CategoryService } from '../sevices/category.service'
import { ResponseStatuses } from '../consts/ResponseStatuses'


/**
 * Контроллер для работы с категориями
 */
export const CategoryControllers = {
    /**
     * Получение всех категорий
     * @param _ 
     * @param res - express.Response
     * @returns - Список всех категорий
     */
    async getCategories(_: Request, res: Response) {
        try {
            const { response, err } = await CategoryService.getAll()

            if(err) {
                return res.status(400).send({ err })
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },

    /**
     * Получить категорию
     * @param req - express.Request
     * @param res - express.Response
     * @returns - Возвращает категорию по id
     */
    async getCategory(req: Request, res: Response) {
        const limit = req.query.limit? Number(req.query.limit) : 100
        const skip = req.query.skip? Number(req.query.skip) : 0

        try {
            const { response, err } = await CategoryService.getCategory(req.params.id, limit, skip)

            if(err) {
                return res.status(400).send({ err })
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },
}