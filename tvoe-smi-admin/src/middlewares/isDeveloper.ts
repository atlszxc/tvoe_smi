import { Request, Response, NextFunction } from 'express'
import { getCookie } from "../utils/getCookie"
import jwt, { JwtPayload } from 'jsonwebtoken'
import { ResponseStatusKeys, ResponseStatuses } from '../consts/ResponsesStatuses'
import { EmployeeRole, employeeModel } from '../models/adminModels/employee.entity'

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const token = getCookie('employee_token', req.headers.cookie)

    if(!token) {
        return res.status(401).send(ResponseStatuses.get(ResponseStatusKeys.REJECT))
    }

    try {
        const { id } = jwt.verify(token, process.env.AUTH_SECRET_KEY as string) as JwtPayload
        const userRole = await employeeModel?.findById(id, { role: true }).lean()
        if(userRole?.role !== EmployeeRole.DEVELOPER) {
            return res.status(401).send(ResponseStatuses.get((ResponseStatusKeys.REJECT)))
        }

        next()
    } catch (error) {
        return res.status(500).send(ResponseStatuses.get((ResponseStatusKeys.BROKEN_SERVER)))
    }
}