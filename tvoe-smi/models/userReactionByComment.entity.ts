import {IUser} from "./user.entity";
import {IComment} from "./comment.entity";
import {model, Schema} from "mongoose";

export enum ReactionType {
    LIKE,
    DISLIKE
}

export interface IUserReactionByComment {
    user: IUser,
    comment: IComment,
    reactionType: number
}

const userReactionByCommentSchema = new Schema<IUserReactionByComment>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: 'comment'
    },
    reactionType: {
        type: Number,
        enum: ReactionType,
    }
})

export const userReactionModel = model('userReactionByCommentSchema', userReactionByCommentSchema)