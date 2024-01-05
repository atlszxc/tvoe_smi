import {serviceResponse} from "../../utils/serviceResponse";
import {ResponseStatuses, ResponseStatusKeys} from "../../consts/ResponsesStatuses";
import {clientPostModel} from "../../models/clientModels/post.entity";
import {clientCategoryModel} from "../../models/clientModels/category.entity";
import {TagService} from "../tag.service";
import {getDateFilter} from "../../utils/getFilters";

/*
* Сервис для получения статистических данных по категориям
* */
export const CategoryStatisticsService = {
    /*
    * Метод для получения просмотров по каждой категории
    * */
    async getViewsByCategory(start: string | null, finish: string | null) {
        const dateFilter = start && finish && getDateFilter(start, finish)

        try {
            // Получение списка категорий
            const categories = await clientCategoryModel.find({}, { _id: true, title: true }).lean()

            // Формирование запросов по каждой категории
            const postViewsByCategoryPromise =
                categories.map(category => clientPostModel.find(
                    { category: category._id, ...dateFilter },
                    { viewsCount: true, _id: false, category: true }
                    )
                    .lean()
                )

            const categoryTagsPromise = categories.map(category => TagService.getTagsByCategory(String(category._id)))

            const categoriesTags = await Promise.all(categoryTagsPromise)

            // Получение просмотров постов по каждой категории
            const postViewsByCategory = (await Promise.all(postViewsByCategoryPromise)).reduce((acc, item) => acc.concat(item), [])

            // Формирование ответа на запрос
            const response = categories.reduce((acc: any, item, currIdx) => {
                const categoryTags = categoriesTags[currIdx]

                acc[`${item.title}`] = {
                    categoryViews: postViewsByCategory.reduce((sum, views) =>  {
                        if(views.category._id!.toString() === item._id.toString()) {
                            sum += views.viewsCount!
                        }

                        return sum
                    }, 0),
                    tags: {},
                }

                categoryTags.response?.forEach(tag => {
                    acc[`${item.title}`].tags[`${tag.title}`] = postViewsByCategory.reduce((sum, views) => {
                        if(String(views.tag) == tag._id.toString()) {
                            sum += views.viewsCount!
                        }

                        return sum
                    }, 0)
                })

                return acc
            }, {})

            return  serviceResponse(response, null)

        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    }
}