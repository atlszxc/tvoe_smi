import {Schema} from "mongoose";
import {IClientPost} from "./post.entity";
import {IUser} from "./user.entity";
import {clientDB} from "../../consts/dbClients";

export interface IComment {
    post: IClientPost,
    user: IUser,
    text: string,
    likes?: number,
    dislikes?: number,
    parentComment: IComment
}

const commentSchema = new Schema<IComment>({
    post: {
        type: Schema.Types.ObjectId,
        ref: 'post',
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    parentComment: {
        type: Schema.Types.ObjectId,
        ref: 'comment',
        default: null,
    },
    text: {
        type: String,
        required: true,
    },
    likes: {
        type: Number,
        default: 0,
    },
    dislikes: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

export const commentsModel = clientDB.model('comment', commentSchema)