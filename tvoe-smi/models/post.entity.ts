import { Schema, model } from "mongoose";
import { ICategory } from "./category.entity";
import { ITag } from "./tags.entity";
import { IGrade } from "../consts/ReactionList";
import { ReactionList } from "../consts/ReactionList";

// export enum PostStatuses {
//     CREATED,
//     MODERATE,
//     PUBLISHED,
//     REWORKED,
// }

export interface IPost {
    title: string,
    content: string,
    creator: string,
    img?: string,
    alias?: string,
    category: ICategory,
    tag?: ITag,
    publishedDate?: Date,
    reactions?: IGrade[],
    viewsCount?: number,
    commentCount?: number,
    inBookmark?: number,
    videoUrls?: string[],
    source: string,
    inArchive: boolean,
}

const postSchema = new Schema<IPost>({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    img: {
        type: String
    },
    alias: {
        type: String,
        required: true
    },
    inArchive: {
        type: Boolean,
        default: false
    },
    creator: {
        type: String,
        // ref: 'user',
        required: true,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'category',
        required: true,
    },
    tag: {
        type: Schema.Types.ObjectId,
        ref: 'tag',
    },
    inBookmark: {
        type: Number,
        default: 0
    },
    source: {
        type: String,
        default: null
    },
    videoUrls: {
        type: [String],
        default: []
    },
    commentCount: {
        type: Number,
        default: 0
    },
    publishedDate: {
        type: Date,
        default: null,
    },
    viewsCount: {
        type: Number,
        default: 0
    },
    reactions: {
        type: [Object],
        default: ReactionList
    }
}, {
    timestamps: true
})

export const postModel = model('post', postSchema)