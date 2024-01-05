import 'dotenv/config'
import { Request, Response } from 'express'
import { CommentService } from '../sevices/comment.service'
import { ResponseStatuses } from '../consts/ResponseStatuses'
import jwt, { JwtPayload } from 'jsonwebtoken'


/**
 * Контроллер для работы с комментариями поста
 */
export const CommentController = {
    /**
     * Создать комментарий
     * 
     * @param req - express.Request
     * @param res - express.Response
     * @returns - Возвращает созданный комментарий
     */
    async createComment(req: Request, res: Response) {
        try {
            const { response, err } = await CommentService.createComment(req.body)
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(201).send(response)
        } catch (error) {
            return res.status(500).send(error)
        }
    },

    /**
     * Получить комментарии к посту
     * 
     * @param req - express.Request
     * @param res - express.Response
     * @returns - Возвращает список комментариев к посту
     */
    async getPostComments(req: Request, res: Response) {
        try {
            const jwtPayload = req.cookies.token && jwt.verify(req.cookies.token as string, process.env.AUTH_SECRET_KEY as string) as JwtPayload

            const { response, err } = await CommentService.getPostsComments(req.params.slug, jwtPayload? jwtPayload.id: null)
            if(err) {
                console.log('err', err)
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            console.log(error)
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },

    async getCommentReplies(req: Request, res: Response) {
        try {
            const jwtPayload = req.cookies.token && jwt.verify(req.cookies.token as string, process.env.AUTH_SECRET_KEY as string) as JwtPayload

            const { response, err } = await CommentService.getCommentReplies(
                req.params.id,
                jwtPayload? jwtPayload.id: null,
                Number(req.query.skip) || null
            )
            if(err) {
                console.log('err', err)
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            console.log(error)
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },

    async getUserComments(req: Request, res: Response) {
        try {
            const { response, err } = await CommentService.getUserComments(req.params.id)
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },

    async deleteUserComment(req: Request, res: Response) {
        try {
            const { response, err } = await CommentService.deleteUserComment(req.params.id)
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },

    /**
     * Обновить кол-во лайков комментария
     * 
     * @param req - express.Request
     * @param res - express.Response
     * @returns - Возвращает обновленное кол-во лайков 
     */
    async updateLikes(req: Request, res: Response) {
        try {
            const { id } = jwt.verify(req.cookies.token as string, process.env.AUTH_SECRET_KEY as string) as JwtPayload

            const { response, err } = await CommentService.updateLikes(req.params.id, id)
            console.log(response)
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },

    /**
     * Обновить кол-во дизлайков комментария
     * 
     * @param req - express.Request
     * @param res - express.Response
     * @returns - Возвращает обновленное кол-во дизлайков 
     */
    async updateDislikes(req: Request, res: Response) {
        try {
            const { id } = jwt.verify(req.cookies.token as string, process.env.AUTH_SECRET_KEY as string) as JwtPayload

            const { response, err } = await CommentService.updateDislikes(req.params.id, id)
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    }
}