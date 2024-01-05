import {userPostReactionModel} from "../models/userPostReaction.entity";
import {serviceResponse} from "../utils/serviceResponse";
import {ResponseStatuses} from "../consts/ResponseStatuses";

export const UserPostReactionService = {
    async getUserPostReaction(userId: string, postId: string) {
        try {
            const userPostReaction = await userPostReactionModel.findOne(
                { user: userId, post: postId }
            )

            return serviceResponse(userPostReaction, null)
        } catch (error) {
            return  serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    async createUserPostReaction(userId: string, postId: string, reactionId: number) {
        try {
            const userPostReaction = await  userPostReactionModel.create({
                user: userId,
                post: postId,
                reactionId
            })

            return  serviceResponse(userPostReaction, null)
        } catch (error) {
            return  serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    }
}