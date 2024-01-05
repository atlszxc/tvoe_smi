import { Response, Request } from 'express'
import { AdvertisingSevice } from '../sevices/advertising.service'
import { BucketName, ImageService } from '../sevices/image.service'
import { FitEnum } from 'sharp'
import { ResponseStatuses } from '../consts/ResponseStatuses'

/**
 * Обработка запросов связанных с рекламой
 */
export const AdvertisingController = {
    /**
     * 
     * @param _ - объект запроса
     * @param res - объект ответа
     * @returns 
     */
    async getAdvertising(_: Request, res: Response) {
        try {
            const { response, err } = await AdvertisingSevice.getAdvertising()
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(500).send(error)
        }
    },

    /**
     * 
     * @param req - объект запроса
     * @param res - объект ответа
     * @returns 
     */
    async createAdvertising(req: Request, res: Response) {
        if(!req.body || !req.file) {
            return res.status(400).send(ResponseStatuses.get('Reject'))
        }

        const width = req.query.width ? Number(req.query.width) : 320
        const height = req.query.height? Number(req.query.height) : 480
        const fit: keyof FitEnum = req.query.fit ? req.query.fit as keyof FitEnum : 'cover'
        const bucket: keyof BucketName = req.query.bucket? req.query.bucket as keyof BucketName : 'ADVERTISING'

        try {
            const { response: imgResponse, err: imgErr } = await ImageService.upload(req.file, width, height, 'jpg', fit, bucket )
            if(imgErr) {
                return res.status(400).send(imgErr)
            }

            const { response, err } = await AdvertisingSevice.createAdvertising({...req.body, img: imgResponse})
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(201).send(response)
        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    }
}