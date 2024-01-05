import { Request, Response } from 'express'
import { TagService } from "../sevices/tag.service"
import { ResponseStatuses } from '../consts/ResponseStatuses'

export const TagController = {
    async getTags(_: Request, res: Response) {
        try {
            const { response, err } = await TagService.getTags()

            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },

    async getCategoryTags(req: Request, res: Response) {
        try {
            const { response, err } = await TagService.getCategoryTags(req.params.categoryId)

            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },

    async createTag(req: Request, res: Response) {
        try {
            const { response, err } = await TagService.createTag(req.body)

            if(err) {
                return res.status(400).send(err)
            }

            return res.status(201).send(response)
        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },

    async deleteTag(req: Request, res: Response) {
        try {
            const { response, err } = await TagService.deleteTag(req.params.id)

            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    }
}