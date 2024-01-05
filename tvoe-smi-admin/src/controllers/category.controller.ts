import { Request, Response } from 'express'
import { CategoryService } from '../services/category.service'
import { ResponseStatusKeys, ResponseStatuses } from '../consts/ResponsesStatuses'

export const CategoryController = {
    async getCategories(_: Request, res: Response) {
        try {
            const { response, err } = await CategoryService.getCategories()
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(201).send(response)
        } catch (error) {
            console.log(error)
            return res.status(503).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    },

    async createCategory(req: Request, res: Response) {
        try {
            const { response, err } = await CategoryService.createCategory(req.body)
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(201).send(response)
        } catch (error) {
            console.log(error)
            return res.status(503).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    },

    async deleteCategory(req: Request, res: Response) {
        try {
            const { response, err } = await CategoryService.deleteCategory(req.params.id)
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