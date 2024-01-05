import {Request, Response} from 'express'
import {Auth, AuthService} from '../services/auth.service'
import {ResponseStatuses, ResponseStatusKeys} from '../consts/ResponsesStatuses'

export const AuthController = {
    AuthInstances: [] as Auth[],

    async sendSMS(req: Request, res: Response) {
        try {
            const authInstance = new Auth(AuthController.AuthInstances.length, req.query.number as string)
            AuthController.AuthInstances.push(authInstance)

            const { response, err } = await authInstance.sendSMS(req.body.imgcode, req.headers['x-real-ip'] as string)

            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send({ ...response, id: authInstance.id, retry: authInstance.checkRetries() })
        } catch (error) {
            console.log(error)
            return res.status(500).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    },

    async login (req: Request, res: Response) {
        try {
            const { response, err } = await AuthController.AuthInstances[Number(req.query.id)].login(Number(req.query.code))

            if(err) {
                return res.status(403).send({ retry: AuthController.AuthInstances[Number(req.query.id)].checkRetries(), ...ResponseStatuses.get(ResponseStatusKeys.REJECT) })
            }

            return res.status(200).cookie('employee_token', response?.token, {
                path: '/',
                domain: process.env.DOMAIN,
                secure: true,
                sameSite: 'none',
            }).send(ResponseStatuses.get(ResponseStatusKeys.SUCCESS))
        } catch (error) {
            console.log(error)
            return res.status(500).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    },

    async createEmployee(req: Request, res: Response) {
        try {
            const { response, err } = await AuthService.createEmployee(req.body)
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(201).send(response?.employee)
        } catch (error) {
            return res.status(503).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    },

    async loginEmployee(req: Request, res: Response) {
        try {
            const { response, err } = await AuthService.loginEmployee(req.body.login, req.body.password)
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).cookie('token', response?.token).send(response?.employee)
        } catch (error) {
            return res.status(503).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    }
}