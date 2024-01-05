import { Request, Response } from 'express'
import { CuncurrancyService } from '../sevices/cuncurrancy.service'
import { ResponseStatuses } from '../consts/ResponseStatuses'

export const CuncurrancyController = {
    async getCuncurrancy(_: Request, res: Response) {
        try {
            const { response, err } = await CuncurrancyService.getCuncurancy()
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    }
}