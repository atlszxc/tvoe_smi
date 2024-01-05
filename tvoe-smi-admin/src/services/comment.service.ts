import {serviceResponse} from "../utils/serviceResponse";
import {ResponseStatuses, ResponseStatusKeys} from "../consts/ResponsesStatuses";
import {commentsModel} from "../models/clientModels/comment.entity";
import {clientPostModel} from "../models/clientModels/post.entity";

export const CommentService = {
    mergeCommentWithReplies(comments: any[], replies: any[]) {
        return comments.map((comment, idx) => ({ ...comment, replies: replies[idx] }))
    },

    async getPostComments(postId: string) {
        try {
            const post = await clientPostModel.findById(postId)
            if(!post) {
                return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
            }

            const comments = await commentsModel.find(
                { post: postId, parentComment: null },
                { text: true, likes: true, dislikes: true, post: true, createdAt: true }
            )
                .populate('user', ['firstname', 'lastname', 'avatar'])
                .lean()

            const commentsRepliesPromises = comments.map(comment => commentsModel.find(
                    { parentComment: comment._id },
                    { text: true, likes: true, dislikes: true, createdAt: true, post: true }
                )
                    .populate('user', ['firstname', 'lastname', 'avatar'])
                    .lean()
            )

            const commentReplies = await Promise.all(commentsRepliesPromises)
            const response = CommentService.mergeCommentWithReplies(comments, commentReplies)

            return serviceResponse(response, null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    }
}