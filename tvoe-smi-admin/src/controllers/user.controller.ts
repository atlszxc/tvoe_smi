import { Request, Response } from 'express'
import {ResponseStatuses, ResponseStatusKeys} from "../consts/ResponsesStatuses";
import {UserService} from "../services/user.service";

export const UserController = {
    async getUsers(req: Request, res: Response) {
        try {
            const { response, err } = await UserService.getUsers(Number(req.query.page))
            if (err) {
                return  res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(503).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    }
}