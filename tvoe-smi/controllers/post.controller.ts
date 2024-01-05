import { Request, Response } from 'express'
import { PostService } from '../sevices/post.service'
import { ResponseStatuses } from '../consts/ResponseStatuses'
import jwt, { JwtPayload } from 'jsonwebtoken'

/**
 * Контроллер для работы с поставми
 */
export const PostController = {
    /**
     * Получить все посты
     * 
     * @param _ - express.Request
     * @param res - express.Response
     * @returns - Возвращает список постов
     */
    async getPosts(_: Request, res: Response) {
        try {
            const { response, err } = await PostService.getPosts()

            if(err) {
                return res.status(400).send(err)
            }

            res.status(200).send(response)
        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },

    /**
     * Получить список постов по подкатегории
     * 
     * @param req - express.Request
     * @param res - express.Response
     * @returns - Возвращает список постов по подкатегории
     */
    async getTagPosts(req: Request, res: Response) {
        const skip = req.query.skip? Number(req.query.skip) : 0
        const limit = req.query.limit? Number(req.query.limit) : 100

        try {
            const { response, err } = await PostService.getTagPosts(req.params.tagId, skip, limit)

            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },

    /**
     * Получить пост
     * 
     * @param req - express.Request
     * @param res - express.Response
     * @returns - Возвращает пост по id 
     */
    async getPost(req: Request, res: Response) {
        try {
            const jwtResult = req.cookies.token && jwt.verify(req.cookies.token, process.env.AUTH_SECRET_KEY as string) as JwtPayload

            const { response, err } = await PostService.getPost(req.params.slug, jwtResult? jwtResult.id : null)

            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            console.log(error)
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },

    /**
     * Получить посты по категории
     * 
     * @param req - express.Request
     * @param res - express.Response
     * @returns - Возвращает список постов по категории
     */
    async getCategoryPosts(req: Request, res: Response) {
        const skip = req.query.skip? Number(req.query.skip) : 0
        const limit = req.query.limit? Number(req.query.limit) : 100

        try {
            const { response, err } = await PostService.getCategoryPosts(req.params.categoryId, limit, skip)
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send({ posts: response?.posts, totalSize: response?.totalSize })

        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },

    /**
     * Обновить кол-во просмотров
     * 
     * @param req - express.Request
     * @param res - express.Response
     * @returns - Возвращает обновленное кол-во просмотров
     */
    async updateViewsCount(req: Request, res: Response) {
        try {
            const { response, err } = await PostService.updateViewsCount(req.params.id)

            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send({ viewsCount: response })
        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },

    /**
     * Получить самые популярные посты
     * 
     * @param req - express.Request
     * @param res - express.Response
     * @returns - Возвращает список самых популярных постов
     */
    async getPopularPosts(_: Request, res: Response) {
        try {
            const { response, err } = await PostService.getPopularNews()

            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))   
        }
    },

    /**
     * Найти посты по подстаке 
     * 
     * @param req - express.Request
     * @param res - express.Response
     * @returns - Возвращает список найденных постов
     */
    async searchPosts(req: Request, res: Response) {
        const limit = req.query.limit? Number(req.query.limit) : 100
        const skip = req.query.skip ? Number(req.query.skip) : 0

        if(!req.query.searchStr) {
            return res.status(403).send({ msg: 'Пустая поисковая строка' })
        }

        try {
            const { response, err } = await PostService.findPosts(req.query.searchStr as string, skip, limit)
            
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },

    /**
     * Обновить оценку поста
     * 
     * @param req - express.Request
     * @param res - express.Response
     * @returns - Возвращает обнавленную оценку 
     */
    async updatePostReactions(req: Request, res: Response) {
        try {
            const { id } = req.cookies.token && jwt.verify(req.cookies.token, process.env.AUTH_SECRET_KEY as string) as JwtPayload

            const { response, err } = await PostService.updateReaction(req.params.id, Number(req.query.reactionId as string), id)

            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(503).send(ResponseStatuses.get('BrokenServer'))
        }
    },

    /**
     * Получить список новостей за день
     *
     * @param _
     * @param res - express.Response
     * @returns - Возвращает список новостей за день
     */
    async getNewNews(_: Request, res: Response) {
        try {
            const { response, err } = await PostService.getNewNews()

            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },
}