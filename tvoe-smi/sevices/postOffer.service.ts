import { ResponseStatuses } from '../consts/ResponseStatuses'
import { postOfferModel, IPostOffer } from '../models/offerPost.entity'
import { serviceResponse } from '../utils/serviceResponse'

export const PostOfferService = {
    async createPostOffer(data: IPostOffer) {
        try {
            const offer = await postOfferModel.create(data)
            return serviceResponse(ResponseStatuses.get('Success'), null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject')) 
        }
    },

    async getOffers() {
        try {
            const offers = await postOfferModel.find()
            return serviceResponse(offers, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    }
}