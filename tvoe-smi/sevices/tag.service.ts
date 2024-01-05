import { ResponseStatuses } from "../consts/ResponseStatuses"
import { tagModel, ITag } from "../models/tags.entity"
import { serviceResponse } from '../utils/serviceResponse'

export const TagService = {
    async getTags() {
        try {
            const tags = await tagModel.find()
            return serviceResponse(tags, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    async getCategoryTags(categoryId: string) {
        try {
            const tags = await tagModel.find({ category: categoryId }, 'title')
            return serviceResponse(tags, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    async createTag(data: ITag) {
        try {
            const tag = await tagModel.create(data)
            return serviceResponse(tag, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    async deleteTag(id: string) {
        try {
            const result = await tagModel.findByIdAndDelete(id)
            return serviceResponse(result, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },
}