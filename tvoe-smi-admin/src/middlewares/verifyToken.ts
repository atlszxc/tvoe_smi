import { Request, Response, NextFunction } from 'express'
import { getCookie } from '../utils/getCookie'
import { ResponseStatusKeys, ResponseStatuses } from '../consts/ResponsesStatuses'
import { generateToken } from '../utils/generateToken'
import jwt from 'jsonwebtoken'
import { employeeAuthModel } from '../models/adminModels/employeeAuth'

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = getCookie('employee_token', req.headers.cookie)

    if(!token) {
        return res.status(401).send(ResponseStatuses.get(ResponseStatusKeys.REJECT))
    }

    try {
        jwt.verify(token, process.env.AUTH_SECRET_KEY as string)
        next()
    } catch (error) {
        try {
            const authData = await employeeAuthModel?.findOne({ token }, { refreshToken: true, _id: true })
            if(!authData) {
                console.log("1")
                const errorDesc = ResponseStatuses.get(ResponseStatusKeys.REJECT)
                return res.status(401).send(errorDesc)
            }
            const decodedRefreshToken = jwt.verify(authData.refreshToken, process.env.AUTH_REFRESH_SECRET_KEY as string)
            const { id } = decodedRefreshToken as jwt.JwtPayload

            const [newToken, newRefreshToken] = generateToken(id)
            authData.token = newToken
            authData.refreshToken = newRefreshToken
            await authData.save()

            res.cookie('token', newToken)

            next()
             
        } catch (error) {
            const errorDesc = ResponseStatuses.get(ResponseStatusKeys.REJECT)
            return res.status(401).send(errorDesc)
        }
        
        return res.status(500).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
    }
}