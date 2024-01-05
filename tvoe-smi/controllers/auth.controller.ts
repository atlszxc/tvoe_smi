import 'dotenv/config'
import { Request, Response } from 'express'
import { Auth, AuthServiceType } from '../sevices/auth.service'
import { ResponseStatuses } from '../consts/ResponseStatuses'
import jwt, { JwtPayload } from 'jsonwebtoken'

/**
 * Обработка запросов связанных с авторизацией/регистрицией
 */
export const AuthController = {
    // Инстанс сервиса авторизации/регистрации
    AuthInstances: [] as Auth[],

    /**
     * 
     * @param req - объект запроса
     * @param res - объкет ответа
     * @returns 
     */
    sendSMS: async (req: Request, res: Response) => {
        // if(process.env.NODE_ENV === 'prod') {
        //     if(req.useragent?.isBot) {
        //         return res.status(400).send(ResponseStatuses.get('Reject'))
        //     }
        // }

        if(!req.query.number) {
            return res.status(400).send(ResponseStatuses.get('Reject'))
        }

        const sendSMSRequestType = req.query.type? req.query.type as string : AuthServiceType.AUTH

        try {
            const findedInstance = AuthController.AuthInstances.find(item => item.phone === req.query.number as string && item.type === sendSMSRequestType)
            const authInstance = findedInstance? findedInstance : new Auth(AuthController.AuthInstances.length, req.query.number as string, req.query.type ? req.query.type as string : AuthServiceType.AUTH)
            if(!findedInstance) {
                AuthController.AuthInstances.push(authInstance)
            }

            console.log(AuthController.AuthInstances.length)


            const { response, err } = await authInstance.sendSMS(req.body.imgcode, req.headers['x-real-ip'] as string)

            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send({ ...response, id: authInstance.id, retry: authInstance.checkRetries() })
        } catch (error) {
            console.log(error)
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
        }
    },

    verifyPhone: async (req: Request, res: Response) => {
        try {
            const { id } = jwt.verify(req.cookies.token, process.env.AUTH_SECRET_KEY as string) as JwtPayload

            const {response, err} = await AuthController.AuthInstances[Number(req.query.id)].verifyPhone(Number(req.query.code), id)
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
     * Вход в аккаунт
     * 
     * @param req - объект запроса
     * @param res - объект ответа
     * @returns 
     */
    login: async (req: Request, res: Response) => {
       try {
            const { response, err } = await AuthController.AuthInstances[Number(req.query.id)].login(Number(req.query.code))
            
            if(err) {
                return res.status(403).send({ retry: AuthController.AuthInstances[Number(req.query.id)].checkRetries(), ...ResponseStatuses.get('Reject') })
            }

            console.log(process.env.DOMAIN)

            return res.status(200).cookie('token', response?.token, {
                path: '/',
                domain: process.env.DOMAIN,
                secure: true,
                sameSite: 'none',
            }).send(ResponseStatuses.get('Success'))
       } catch (error) {
            console.log(error)
            return res.status(500).send(ResponseStatuses.get('BrokenServer'))
       }
    },

    logout: async (_: Request, res: Response) => {
        try {
            return res.status(200).cookie('token', '', {
                path: '/',
                domain: process.env.DOMAIN,
                secure: true,
                sameSite: 'none',
                maxAge: -1
            }).send(ResponseStatuses.get('Success'))

        } catch (error) {
            return res.status(500).send(ResponseStatuses.get('BrokenServer'));
        }
    }
}