import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { authModel } from '../models/auth.entity'
import { ResponseStatuses } from '../consts/ResponseStatuses'
import { generateToken } from '../utils/generateToken'
import { getCookie } from '../utils/getCookie'

/**
 * Мидлвеир для проверки и обновления токена
 * 
 * @param req - объект запроса
 * @param res - объект ответа
 * @param next - метод вызова следущего метода по цепочке
 * @returns 
 */
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = getCookie('token', req.headers.cookie)

    if(!token) {
        return res.status(401).send(ResponseStatuses.get('Reject'))
    }

    try {
        jwt.verify(token, process.env.AUTH_SECRET_KEY as string)
        console.log('1',token)
        next()
    } catch (error) {
        try {
            const authData = await authModel.findOne({ token }, { refreshToken: true, _id: true })
            if(!authData) {
                const errorDesc = ResponseStatuses.get('Reject')
                return res.status(401).send(errorDesc)
            }
            const decodedRefreshToken = jwt.verify(authData.refreshToken, process.env.AUTH_REFRESH_SECRET_KEY as string)
            const { id } = decodedRefreshToken as jwt.JwtPayload

            const [newToken, newRefreshToken] = generateToken(id)
            authData.token = newToken
            authData.refreshToken = newRefreshToken
            await authData.save()

            req.cookies.token = newToken
            res.cookie('token', newToken)

            next()
             
        } catch (error) {
            const errorDesc = ResponseStatuses.get('Reject')
            return res.status(401).send(errorDesc)
        }
        
        return res.status(500).send(ResponseStatuses.get('BrokenServer'))
    }
}