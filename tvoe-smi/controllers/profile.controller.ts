import { Request, Response } from 'express'
import { UserService } from '../sevices/user.service'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { ResponseStatuses } from '../consts/ResponseStatuses'

/**
 * Контроллер для работы с профилем
 */
export const ProfileController = {
    /**
     * Обработка запроса на получение данных пользователя
     * 
     * @param req - объект запроса
     * @param res - объект ответа
     * @returns 
     */
    async getUser(req: Request, res: Response) {
        // const token = req.headers.authorization?.split(' ')[1]
        // if(!token) {
        //     return res.status(400).send(ResponseStatuses.get('Reject'))
        // }
        // console.log(token)
        try {
            const jwtResponse = jwt.verify(req.cookies.token as string, process.env.AUTH_SECRET_KEY as string) as JwtPayload
            const { response, err } = await UserService.getUser(jwtResponse.id)

            if(err && !response) {
                return res.status(400).send(ResponseStatuses.get('Reject'))
            }

            return res.status(200).send(response)
        } catch (error) {
            console.log(error)
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },

    /**
     * Обработка запроса на удаление аккаунта
     * 
     * @param req - объект запроса
     * @param res - объект ответа
     * @returns 
     */
    async deleteAccount(req: Request, res: Response) {
        try {
            const jwtReaponse = jwt.verify(req.cookies.token, process.env.AUTH_SECRET_KEY as string) as JwtPayload
            const { response, err } = await UserService.deleteAccount(jwtReaponse.id)
            if(err) {
                return res.status(400).send(ResponseStatuses.get('Reject'))
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },

    /**
     * Обновить данные пользователя
     * 
     * @param req - express.Request
     * @param res - express.Response
     * @returns - Возвращает обновленные данные пользователя
     */
    async updateUser(req: Request, res: Response) {
        try {
            const { response, err } = await UserService.updateUser(req.params.id, JSON.parse(req.body.data), req.file)
            if(err) {
                console.log(err)
                return res.status(400).send({ data: response, err })
            }

            return res.status(200).send({...ResponseStatuses.get('Success')})
        } catch (error) {
            console.log(error)
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },

    /**
     * Получить список постов в заметках
     * 
     * @param req - express.Request
     * @param res - express.Response
     * @returns - Возвращает список постов в заметках
     */
    async getBookmarks(req: Request, res: Response) {
        try {
            const { response, err } = await UserService.getIsBookmarkPosts(req.params.id)
            if(err) {
                return res.status(400).send(ResponseStatuses.get('Reject'))
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },

    /**
     * Добавить пост в заметки
     * 
     * @param req - express.Request
     * @param res - express.Response
     * @returns - Возвращает добавленный пост
     */
    async addBookmark(req: Request, res: Response) {
        try {
            const { response, err } = await UserService.addBookmark(req.body)
            if(err) {
                return res.status(400).send(ResponseStatuses.get('Reject'))
            }

            return res.status(201).send(response)
        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },

    /**
     * Убрать пост из заметок
     * 
     * @param req - express.Request
     * @param res - express.Response
     * @returns - Возвращает убранный пост из заметок
     */
    async deleteBookmark(req: Request, res: Response) {
        try {
            const { id } = jwt.verify(req.cookies.token, process.env.AUTH_SECRET_KEY as string) as JwtPayload
            const { response, err } = await UserService.deleteBookmark(id ,req.params.id)
            if(err) {
                return res.status(400).send(ResponseStatuses.get('Reject'))
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },
}