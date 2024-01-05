import {Request, Response} from 'express'
import {ResponseStatuses, ResponseStatusKeys} from "../consts/ResponsesStatuses";
import {CommentService} from "../services/comment.service";

export const CommentController = {
    async getPostController(req: Request, res: Response) {
        try {
            const { response, err } = await CommentService.getPostComments(req.params.id)
            if(err) {
                return res.status(400).send(ResponseStatuses.get(ResponseStatusKeys.REJECT))
            }

            return res.status(200).send(response)
        } catch (error) {
            console.log(error)
            return res.status(503).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    }
}