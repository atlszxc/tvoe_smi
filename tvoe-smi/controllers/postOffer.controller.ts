import { Request, Response } from 'express'
import { PostOfferService } from '../sevices/postOffer.service'
import { ResponseStatuses } from '../consts/ResponseStatuses'

export const PostOfferController = {
    async createPostOffer(req: Request, res: Response) {
        try {
            const { response, err } = await PostOfferService.createPostOffer(req.body)
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(201).send(response)
        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },

    async getPostOffers(_: Request, res: Response) {
        try {
            const { response, err } = await PostOfferService.getOffers()
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    }
}