import { ResponseStatusKeys, ResponseStatuses } from '../consts/ResponsesStatuses'
import { adminCategoryModel } from '../models/adminModels/category.entity'
import { ITag, adminTagModel } from '../models/adminModels/tag.entity'
import { clientCategoryModel } from '../models/clientModels/category.entity'
import { clientTagModel } from '../models/clientModels/tag.entity'
import { serviceResponse } from '../utils/serviceResponse'

/*
* Сервис для взаимодействия с категориями
* */
export const TagService = {
    async createTag(data: ITag) {
        try {
            const tag = await adminTagModel.create(data)
            if(!tag) {
                return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
            }

            const adminCategoryTitle = await adminCategoryModel.findById(data.category, { title: true }).lean()

            const clientCategory = await clientCategoryModel.findOne({ title: adminCategoryTitle?.title }, { _id: true }).lean()

            const clientTag = await clientTagModel.create({
                category: clientCategory?._id,
                title: data.title
            })

            if(!clientTag) {
                return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
            }

            return serviceResponse(ResponseStatuses.get(ResponseStatusKeys.SUCCESS), null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

   async getTagsByCategory(id: string) {
        try {
            const tags = await clientTagModel.find({ category: id }).lean()
            return serviceResponse(tags, null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
   }
}