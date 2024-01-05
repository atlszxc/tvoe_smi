import { ResponseStatuses } from "../consts/ResponseStatuses"
import { commentModel, IComment } from "../models/comment.entity"
import { serviceResponse } from '../utils/serviceResponse'
import { PostService } from "./post.service"
import {UserReactionByCommentService} from "./userReactionByComment.service";
import {ReactionType, userReactionModel} from "../models/userReactionByComment.entity";
import {postModel} from "../models/post.entity";

export const CommentService = {
    async getUserReactionOnComment(comments: any[], userId: string) {
        const commentsResponse = []

        for (const comment of comments) {
            const userReaction = await userReactionModel.findOne(
                { user: userId, comment: comment._id },
                { reactionType: true }
            ).lean()
            const type = userReaction? userReaction.reactionType : null
            commentsResponse.push({ ...comment, reactionType: type })
        }

        return commentsResponse
    },

    mergeCommentWithReplies(comments: any[], replies: any[], repliesTotalCount: number[]) {
        return comments.map((comment, idx) => ({ ...comment, replies: {
            totalCount: repliesTotalCount[idx],
            items: replies[idx]
        } }))
    },

    async createComment(data: IComment) {
        try {
            const comment = await (await commentModel.create(data)).populate('user', ['firstname', 'lastname', 'avatar'])
            if(!comment) {
                return serviceResponse(null, ResponseStatuses.get('Reject'))
            }

            const { err } = await PostService.updateCommentCount(String(data.post))
            if(err) {
                return serviceResponse(null, ResponseStatuses.get('Reject'))
            }

            return serviceResponse(comment, null)
        } catch (error) {
            return serviceResponse(null, error)
        }
    },

    async getCommentReplies(commentId: string, userId: string | null, limit: number | null) {
        const skip = limit || 5

        try {
            const comments = await commentModel.find(
                { parentComment: commentId },
                { text: true, likes: true, dislikes: true, createdAt: true, post: true }
            )
                .populate('user', ['firstname', 'lastname', 'avatar'])
                .skip(skip)
                .limit(5)
                .lean()

            if(userId) {
                const commentsResponse = await CommentService.getUserReactionOnComment(comments, userId)
                return serviceResponse(commentsResponse, null)
            }

            const commentsResponse = comments.map(comment => ({ ...comment, reactionType: null }))
            return serviceResponse(commentsResponse, null)
        } catch (error) {
            return serviceResponse(null, error)
        }
    },
    
    async getPostsComments(slug: string, userId: string | null) {
        try {
            const post = await postModel.findOne({ alias: slug }, { _id: true}).lean()
            if(!post) {
                return serviceResponse(null, ResponseStatuses.get('Reject'))
            }

            const comments = await commentModel.find(
                { post: post._id, parentComment: null },
                { text: true, likes: true, dislikes: true, createdAt: true, post: true }
            )
                .populate('user', ['firstname', 'lastname', 'avatar'])
                .lean()

            const commentsRepliesPromises = comments.map(comment => commentModel.find(
                { parentComment: comment._id },
                { text: true, likes: true, dislikes: true, createdAt: true, post: true }
                )
                .populate('user', ['firstname', 'lastname', 'avatar'])
                .limit(5)
                .lean()
            )

            const repliesCountsPromises = comments.map(comment => commentModel.find(
                { parentComment: comment._id }
                )
                    .countDocuments()
            )

            const repliesCounts = await Promise.all(repliesCountsPromises)

            const commentReplies = await Promise.all(commentsRepliesPromises)

            if(userId) {
                const commentsResponse = await CommentService.getUserReactionOnComment(comments, userId)
                const repliesResponse = []
                for (const replies of commentReplies) {
                    const item = await CommentService.getUserReactionOnComment(replies, userId)
                    repliesResponse.push(item)
                }

                const response = CommentService.mergeCommentWithReplies(commentsResponse, repliesResponse, repliesCounts)


                return  serviceResponse(response, null)
            }

            const commentsResponse = comments.map(comment => ({ ...comment, reactionType: null }))
            const repliesResponse = commentReplies.map(replies => replies.map(reply => ({...reply, reactionType: null})))
            const response = CommentService.mergeCommentWithReplies(commentsResponse, repliesResponse, repliesCounts)

            return serviceResponse(response, null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    async deleteUserComment(id: string) {
        try {
            await commentModel.findByIdAndDelete(id)
            return serviceResponse(ResponseStatuses.get('Success'), null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    async getUserComments(userId: string) {
        try {
            const comments = await commentModel.find({ user: userId }, { text: true, likes: true, dislikes: true, user: true, post: true, createdAt: true  })
                .populate('post', 'title')
                .populate('user', ['firstname', 'lastname', 'avatar'])
                .lean()
            return serviceResponse(comments, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    async updateLikes(id: string, userId: string) {
        try {
            const { response, err: findReactionErr } = await UserReactionByCommentService.getUserReaction(userId, id)
            if(findReactionErr) {
                return serviceResponse(null, ResponseStatuses.get('Reject'))
            }

            if(response) {
                response.reactionType = ReactionType.LIKE
                await response.save()

                const comment = await commentModel.findByIdAndUpdate(id, {
                    $inc: {
                        likes: 1,
                        dislikes: -1
                    }
                }, { new: true })

                return serviceResponse({ likes: comment?.likes }, null)
            }

            const { err } = await UserReactionByCommentService.createUserReaction(userId, id, ReactionType.LIKE)
            if(err) {
                return serviceResponse(null, ResponseStatuses.get('Reject'))
            }

            const comment = await commentModel.findByIdAndUpdate(id, {
                $inc: {
                    likes: 1
                }
            }, { new: true })


            return serviceResponse({ likes: comment?.likes }, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    async updateDislikes(id: string, userId: string) {
        try {
            const { response, err: findReactionErr } = await UserReactionByCommentService.getUserReaction(userId, id)
            if(findReactionErr) {
                return serviceResponse(null, ResponseStatuses.get('Reject'))
            }

            if(response) {
                response.reactionType = ReactionType.DISLIKE
                await response.save()

                const comment = await commentModel.findByIdAndUpdate(id, {
                    $inc: {
                        likes: -1,
                        dislikes: 1
                    }
                }, { new: true })

                return serviceResponse({ likes: comment?.dislikes }, null)
            }

            const { err } = await UserReactionByCommentService.createUserReaction(userId, id, ReactionType.DISLIKE)
            if(err) {
                return serviceResponse(null, ResponseStatuses.get('Reject'))
            }

            const comment = await commentModel.findByIdAndUpdate(id, {
                $inc: {
                    dislikes: 1
                }
            }, { new: true })

            return serviceResponse({ dislikes: comment?.dislikes }, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    }
}