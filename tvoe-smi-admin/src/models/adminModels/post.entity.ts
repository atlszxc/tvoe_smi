import { Schema } from "mongoose";
import { ICategory } from "./category.entity";
import { IEmployee } from "./employee.entity";
import { ITag } from "./tag.entity";
import { adminDB } from "../../consts/dbClients";

export enum PostStatuses {
    CREATED,
    MODERATE,
    PUBLISHED,
    REWORKED,
    ARCHIVE,
    PUBLICATION_DATE_BOOK
}

export interface IAdminPost {
    title: string,
    content?: string,
    creator: IEmployee,
    alias?: string,
    img?: string,
    category: ICategory,
    status?: PostStatuses,
    tag?: ITag,
    publicationDateBook?: Date,
    publishedDate?: Date,
    source: string
    videoUrls?: string[]
}

const adminPostSchema = new Schema<IAdminPost>({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        default: null,
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'employee',
    },
    alias: {
        type: String,
        unique: true,
        default: null,
    },
    videoUrls: {
        type: [String],
        default: []
    },
    img: {
        type: String,
        default: null
    },
    source: {
      type: String,
      default: null
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'category',
    },
    tag: {
        type: Schema.Types.ObjectId,
        ref: 'tag',
        default: null
    },
    status: {
        type: Number,
        enum: PostStatuses,
        default: PostStatuses.CREATED
    },
    publicationDateBook: {
        type: Date,
        default: null
    },
    publishedDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
})

export const adminPostModel = adminDB.model('post', adminPostSchema)