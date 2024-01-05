import {userReactionModel} from "../models/userReactionByComment.entity";
import {serviceResponse} from "../utils/serviceResponse";
import {ResponseStatuses} from "../consts/ResponseStatuses";

export const UserReactionByCommentService = {
    async createUserReaction(userId: string, commentId: string, type: Number) {
        try {
            await userReactionModel.create({
                user: userId,
                comment: commentId,
                reactionType: type
            })

            return serviceResponse(ResponseStatuses.get('Success'), null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    async getUserReaction(userId: string, commentId: string) {
        try {
            const reaction = await userReactionModel.findOne({ user: userId, comment: commentId })
            return serviceResponse(reaction, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    }
}