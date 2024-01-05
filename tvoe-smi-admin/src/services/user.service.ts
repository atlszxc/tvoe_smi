import {clientUserModel} from "../models/clientModels/user.entity";
import {serviceResponse} from "../utils/serviceResponse";
import {ResponseStatuses, ResponseStatusKeys} from "../consts/ResponsesStatuses";

export const UserService = {
    async getUsers(page: number) {
        const skip = page * 8
        const limit = 8
        const userCount = await clientUserModel.find().countDocuments()
        const pages = Math.ceil(userCount / limit)

        try {
            const users = await  clientUserModel
                .find(
                    {},
                    { firstname: true, lastname: true, phone: true, avatar: true }
                )
                .skip(skip)
                .limit(limit)
                .lean()

            return serviceResponse({
                users,
                pages,
                currentPage: page
            }, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    }
}