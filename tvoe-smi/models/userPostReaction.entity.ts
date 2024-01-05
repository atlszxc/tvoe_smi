import {IPost} from "./post.entity";
import {IUser} from "./user.entity";
import {model, Schema} from "mongoose";

export interface IUserPostReaction {
    post: IPost,
    user: IUser,
    reactionId: number
}

const userPostReactionSchema = new Schema<IUserPostReaction>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'post'
    },
    reactionId: {
        type: Number,
        required: true
    }
})

export const userPostReactionModel = model('userPostReactionSchema', userPostReactionSchema)