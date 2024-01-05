import { Request, Response } from 'express'
import { CategoryService } from '../sevices/category.service'
import { PostService } from '../sevices/post.service'
import { ResponseStatuses } from '../consts/ResponseStatuses'

export const MainPageController = {
    async getAll(_: Request, res: Response) {
        try {
            const [ 
                    { response: categoriesResponse }, 
                    { response: feedsResponse }, 
                    { response: newPostsResponse } 
                ] = await Promise.all([CategoryService.getAll(), PostService.getFeeds(), PostService.getNewNews()])

            const { response: categoriesId } = await CategoryService.getCategoriesId()

            const promisesCategoriesId = categoriesId?.map(item => PostService.getCategoryPosts(item._id.toString()))

            const categoriesPosts = promisesCategoriesId? await Promise.all(promisesCategoriesId) : []

            const categoriesPostsResponse = categoriesPosts.map(item => item.response)

            return res.status(200).send({
                categoriesResponse,
                feedsResponse,
                newPostsResponse,
                categoriesPostsResponse,
            })

        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    }
}