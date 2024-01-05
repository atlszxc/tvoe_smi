import { Request, Response } from 'express'
import { TagService } from '../services/tag.service'
import { ResponseStatusKeys, ResponseStatuses } from '../consts/ResponsesStatuses'

export const TagController = {
    async createTag(req: Request, res: Response) {
        try {
            const { response, err } = await TagService.createTag(req.body)
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(201).send(response)
        } catch (error) {
            return res.status(503).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    }
}