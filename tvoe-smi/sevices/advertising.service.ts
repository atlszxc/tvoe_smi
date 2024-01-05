import { advertisingModel, IAdvertising } from "../models/advertising.entity"
import { serviceResponse } from "../utils/serviceResponse"

export const AdvertisingSevice = {
    async getAdvertising() {
        try {
            const advertising = await advertisingModel.aggregate().sample(1)
            return serviceResponse(advertising, null)
        } catch (error) {
            return serviceResponse(null, error)
        }
    },

    async createAdvertising(data: IAdvertising) {
        try {
            const advertising = await advertisingModel.create(data)
            return serviceResponse(advertising, null)
        } catch (error) {
            return serviceResponse(null, error)
        }
    }
}