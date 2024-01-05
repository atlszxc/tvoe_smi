import {adminPostModel, PostStatuses} from "../../models/adminModels/post.entity";
import {serviceResponse} from "../../utils/serviceResponse";
import {ResponseStatuses, ResponseStatusKeys} from "../../consts/ResponsesStatuses";
import {getDateFilter} from "../../utils/getFilters";

/*
* Сервис для получения статистических данных по потам
* */
export const PostStatisticService = {
    /*
    * Метод для получения кол-ва постов на каждом этапе (созданные, на модерации, на доработке, опубликованные)
    * */
    async getPostsStatusStatistic(start: string | null, finish: string | null) {
        const dateFilter = start && finish && getDateFilter(start, finish)

        try {
            const createdPostCountPromise =  adminPostModel.find({ status: PostStatuses.CREATED, ...dateFilter }).countDocuments()
            const moderatePostCountPromise = adminPostModel.find({ status: PostStatuses.MODERATE, ...dateFilter }).countDocuments()
            const publishedPostCountPromise = adminPostModel.find({ status: PostStatuses.PUBLISHED, ...dateFilter }).countDocuments()
            const reworkedPostCountPromise = adminPostModel.find({ status: PostStatuses.REWORKED, ...dateFilter }).countDocuments()

            const [
                createdPostCount,
                moderatePostCount,
                publishedPostCount,
                reworkedPostCount
            ] = await Promise.all([createdPostCountPromise, moderatePostCountPromise, publishedPostCountPromise, reworkedPostCountPromise])

            return serviceResponse({
                createdPostCount,
                moderatePostCount,
                publishedPostCount,
                reworkedPostCount,
                totalCount: createdPostCount + moderatePostCount + publishedPostCount + reworkedPostCount
            }, null)

        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

}