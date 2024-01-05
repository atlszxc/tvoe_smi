import {Request, Response} from 'express'
import {EmployeeService} from "../services/employee.service";
import {ResponseStatuses, ResponseStatusKeys} from "../consts/ResponsesStatuses";
import jwt, {JwtPayload} from 'jsonwebtoken'
import {getCookie} from "../utils/getCookie";

export const EmployeesController = {
    async getEmployees(req: Request, res: Response) {
        try {
            const { response, err } = await EmployeeService.getEmployees(Number(req.query.page), Number(req.query.role))
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(503).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    },

    async getEmployee(req: Request, res: Response) {
        try {
            const token = getCookie('employee_token', req.headers.cookie)
            if(!token) {
                return res.status(403).send(ResponseStatuses.get(ResponseStatusKeys.REJECT))
            }

            const { id } = jwt.verify(token, process.env.AUTH_SECRET_KEY as string) as JwtPayload
            const { response, err } = await  EmployeeService.getEmployee(id)
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            console.log(error)
            return res.status(503).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    },

    async updateEmployee(req: Request, res: Response) {
        try {
            const token = getCookie('employee_token', req.headers.cookie)
            if(!token) {
                return res.status(403).send(ResponseStatuses.get(ResponseStatusKeys.REJECT))
            }

            const { id } = jwt.verify(token, process.env.AUTH_SECRET_KEY as string) as JwtPayload

            const { response, err } = await  EmployeeService.updateEmployee(id, req.body)
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            console.log(error)
            return res.status(503).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    }
}