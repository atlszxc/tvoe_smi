import { serviceResponse } from '../utils/serviceResponse'
import { userCategoryModel } from '../models/userCategory.entity'
import { ObjectId, Document } from 'mongoose'
import { ICategory } from '../models/category.entity'
import { ResponseStatuses } from '../consts/ResponseStatuses'

interface ICreateUserCategoryDto {
    user: string,
    categories: (Document<unknown, {}, ICategory> & ICategory & { _id: ObjectId; })[] | null
}

export const UserCategoryService = {
    async createUserCategories(data: ICreateUserCategoryDto) {
        try {
            const userCategories = await userCategoryModel.create(data)
            return serviceResponse(userCategories, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    async getUserCategories(userId: string) {
        try {
            const userCategories = await userCategoryModel.findOne({ user: userId }, { _id: false, __v: false }).lean()
            return serviceResponse(userCategories, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    }
}