import { ResponseStatuses, ResponseStatusKeys } from "../consts/ResponsesStatuses"
import { adminCategoryModel, ICategory } from "../models/adminModels/category.entity"
import { clientCategoryModel } from '../models/clientModels/category.entity'
import { serviceResponse } from "../utils/serviceResponse"
import {adminTagModel} from "../models/adminModels/tag.entity";

/*
* Сервис для взаимодействия с категориями
* */
export const CategoryService = {
    async getCategories() {
        try {
            const categories = await adminCategoryModel.find(
                {},
                { title: true }
            )
                .lean()

            const tagsPromises = categories.map(cat => adminTagModel.find(
                { category: cat._id },
                { title: true }
            ).lean())

            const tags = await Promise.all(tagsPromises)

            const response = categories.map((cat, idx) => {
                return {
                    id: cat._id,
                    title: cat.title,
                    subcategories: tags[idx]
                }
            })

            return serviceResponse(response, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

    async createCategory(data: ICategory) {
        try {
            const category = await adminCategoryModel.create(data)
            
            if(!category) {
                return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
            }

            if(category.isPublic) {
                const clientCategory = await clientCategoryModel.create({
                    title: category.title
                })
    
                if(!clientCategory) {
                    return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
                }
            }

            return serviceResponse(category, null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

    async deleteCategory(id: string) {
        try {
            const category = await adminCategoryModel.findById(id)

            if(!category) {
                return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
            }

            const deleteClientCategoryPromise = clientCategoryModel.findOneAndDelete({ title: category?.title })
            const deleteAdminCategoryPromise = adminCategoryModel.findByIdAndDelete(id)

            const [clientDBResponse, adminDBResponse] = await Promise.allSettled([ deleteClientCategoryPromise, deleteAdminCategoryPromise ])

            if(clientDBResponse.status !== 'fulfilled' || adminDBResponse.status !== "fulfilled") {
                return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
            }

            return serviceResponse(ResponseStatuses.get(ResponseStatusKeys.SUCCESS), null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    }
}