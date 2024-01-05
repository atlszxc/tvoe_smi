import { Document } from "mongoose"
import { categoryModel, ICategory } from "../models/category.entity"
import { serviceResponse } from '../utils/serviceResponse'
import { TagService } from "./tag.service"
import { PostService } from "./post.service"
import { ResponseStatuses } from "../consts/ResponseStatuses"

export const CategoryService = {
    async getAll() {
        try {
            const categories = await categoryModel.find({}, { __v: false }).lean()
            return serviceResponse(categories, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    async getCategoriesId() {
        try {
            const categories = await categoryModel.find({}, '_id').lean()
            return serviceResponse(categories, null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    async getCategory(id: string, limit: number, skip: number) {
        try {
            const [category, { response, err }] = await Promise.all([categoryModel.findById(id), TagService.getCategoryTags(id)])

            if(err) {
                return serviceResponse(null, ResponseStatuses.get('Reject'))
            }

            if(response?.length === 0) {
                const { response: postsResponse, err } = await PostService.getCategoryPosts(id, limit, skip)
                if(err) {
                    return serviceResponse(null, ResponseStatuses.get('Reject'))
                }

                return serviceResponse({ category, posts: postsResponse?.posts, totalSize: postsResponse?.totalSize }, null)
            }

            return serviceResponse({ category, tags: response }, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    }
}