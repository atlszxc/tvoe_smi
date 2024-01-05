import { Schema } from "mongoose";
import { IGrade, ReactionList } from "../../consts/ReactionList";
import { ICategory } from "./category.entity";
import { ITag } from "./tag.entity";
import { clientDB } from "../../consts/dbClients";

export interface IClientPost {
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

export const clientPostSchema = new Schema<IClientPost>({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    alias: {
        type: String,
        required: true
    },
    creator: {
        type: String,
        required: true
    },
    img: {
        type: String,
        default: null,
    },
    inArchive: {
        type: Boolean,
        default: false
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'category',
        required: true,
    },
    source: {
        type: String,
        default: null
    },
    videoUrls: {
        type: [String],
        default: []
    },
    tag: {
        type: Schema.Types.ObjectId,
        ref: 'tag',
        required: true,
    },
    commentCount: {
        type: Number,
        default: 0
    },
    inBookmark: {
        type: Number,
        default: 0,
    },
    viewsCount: {
        type: Number,
        default: 0,
    },
    reactions: {
        type: [Object],
        default: ReactionList
    },
    publishedDate: {
        type: Date,
        default: new Date()
    }
}, {
    timestamps: true
})

export const clientPostModel = clientDB.model('post', clientPostSchema)