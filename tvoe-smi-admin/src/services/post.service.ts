import 'dotenv/config'
import {ResponseStatuses, ResponseStatusKeys} from '../consts/ResponsesStatuses'
import {adminPostModel, IAdminPost, PostStatuses} from '../models/adminModels/post.entity'
import {clientCategoryModel} from '../models/clientModels/category.entity'
import {clientPostModel} from '../models/clientModels/post.entity'
import {clientTagModel} from '../models/clientModels/tag.entity'
import {serviceResponse} from '../utils/serviceResponse'
import {getCategoryFilter, getDateFilter, getSortFilter} from "../utils/getFilters";
import {ImageService} from "./image.service";
import {SortOrder} from "mongoose";
import {getPostImageFormat} from "../consts/imageSizes";
import {employeeModel} from "../models/adminModels/employee.entity";
import {commentsModel} from "../models/clientModels/comment.entity";


/*
* Сервис для взамодействия с постами
* */
export const PostService = {
    async getAllPosts() {
        try {
            const posts = await adminPostModel.find({}, {
                _id: true
            })
                .lean()

            return serviceResponse(posts, null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

    async deletePost(id: string) {
        try {
            const adminPost = await adminPostModel.findById(id)
            if(!adminPost) {
                return serviceResponse(ResponseStatuses.get(ResponseStatusKeys.WARNING), null)
            }

            await adminPostModel.findByIdAndDelete(id)

            await clientPostModel.findOneAndDelete({ alias: adminPost.alias })

            return serviceResponse(ResponseStatuses.get(ResponseStatusKeys.SUCCESS), null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

    async updatePost(id: string, data: IAdminPost, titleImg: Express.Multer.File | null) {
        const imageFormatData = getPostImageFormat()

        try {
            const post = await adminPostModel.findByIdAndUpdate(id, {
                $set: {
                    ...data
                }
            }, {new: true})

            if (titleImg) {
                if (post?.img) {
                    const {err} = await ImageService.update(titleImg, imageFormatData, post.img)
                    if (err) {
                        return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
                    }
                } else {
                    const {err} = await ImageService.upload(titleImg, imageFormatData, 'POST_IMG')
                    if (err) {
                        return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
                    }
                }
            }

            return serviceResponse(post, null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

    async getEmployeePosts(
        userId: string,
        status: number,
        page: number,
        start: string | null,
        finish: string | null,
        categories: string[] | null,
        sortField: string | null,
        sortType: SortOrder = 1
    ) {
        const skip = page * Number(process.env.PAGINATION_ITEMS_COUNT)
        const limit = Number(process.env.PAGINATION_ITEMS_COUNT)
        const postCount = await adminPostModel.find({ status, creator: userId }).countDocuments()
        const pages = Math.ceil(postCount / limit)

        const dateFilter = start && finish && getDateFilter(start, finish)
        const categoryFilter = categories && getCategoryFilter(categories)
        const sortFilter = getSortFilter(sortField || 'title', sortType || 1)

        try {

            if(status === PostStatuses.PUBLISHED) {
                const posts = await clientPostModel.find(
                    { creator: userId, ...dateFilter, ...categoryFilter },
                    { title: true, publishedDate: true, createdAt: true, creator: true }
                )
                    .populate('tag', ['title'])
                    .populate('category', ['title'])
                    .sort(sortFilter)
                    .skip(skip)
                    .limit(limit)
                    .lean()

                return serviceResponse({
                    posts,
                    pages,
                    currentPage: page,
                    totalCount: postCount
                }, null)
            }

            const posts = await adminPostModel.find(
                { creator: userId,  status, ...dateFilter, ...categoryFilter },
                { title: true, publishedDate: true, updatedAt: true }
            )
                .populate('tag', ['title'])
                .populate('category', ['title'])
                .sort(sortFilter)
                .skip(skip)
                .limit(limit)
                .lean()

            return serviceResponse({
                posts,
                pages,
                currentPage: page,
                totalCount: postCount
            }, null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

    async getPosts(status: number, page: number, start: string | null, finish: string | null, categories: string[] | null, sortField: string | null, sortType: SortOrder = 1) {
        const skip = page * Number(process.env.PAGINATION_ITEMS_COUNT)
        const limit = Number(process.env.PAGINATION_ITEMS_COUNT)
        const postCount = await adminPostModel.find({status}).countDocuments()
        const pages = Math.ceil(postCount / limit)

        const dateFilter = start && finish && getDateFilter(start, finish)
        const categoryFilter = categories && getCategoryFilter(categories)
        const sortFilter = getSortFilter(sortField || 'title', sortType || 1)

        try {
            if(status === PostStatuses.PUBLISHED) {
                const posts = await clientPostModel.find(
                    { creator: { $not: { $eq: null } },  ...dateFilter, ...categoryFilter },
                { title: true, publishedDate: true, createdAt: true, creator: true}
                )
                    .populate('tag', ['title'])
                    .populate('category', ['title'])
                    .sort(sortFilter)
                    .skip(skip)
                    .limit(limit)
                    .lean()

                const creatorsPromises = posts.map(post => employeeModel.findById(post.creator, { firstname: true, lastname: true }).lean())
                const creators = await Promise.all(creatorsPromises)

                const response = posts.map((post, idx) => ({
                    ...post,
                    creator: creators[idx]
                }))

                return serviceResponse({
                    posts: response,
                    pages,
                    currentPage: page,
                    totalCount: postCount
                }, null)
            }

            const posts = await adminPostModel.find(
                {status, ...dateFilter, ...categoryFilter},
                {title: true, publishedDate: true, updatedAt: true}
            )
                .populate('creator', ['firstname', 'lastname'])
                .populate('tag', ['title'])
                .populate('category', ['title'])
                .sort(sortFilter)
                .skip(skip)
                .limit(limit)
                .lean()

            return serviceResponse({
                posts,
                pages,
                currentPage: page,
                totalCount: postCount
            }, null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

    async getPost(id: string) {
        try {
            const post =
                await adminPostModel.findById(id)
                    .populate('creator', ['firstname', 'lastname'])
                    .populate('tag', ['title'])
                    .populate('category', ['title'])
                    .lean()

            if(!post) {
                const post = await clientPostModel.findById(id)
                    .populate('tag', ['title'])
                    .populate('category', ['title'])
                    .lean()

                if(!post) {
                    return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
                }

                const commentCount = await commentsModel.find({ post: post._id }).countDocuments()

                const adminId = await adminPostModel.findOne(
                    { title: post.title, creator: post.creator },
                    { _id: true }
                )

                const creator = await employeeModel.findById(
                    post?.creator,
                    { firstname: true, lastname: true})

                return serviceResponse({
                    ...post,
                    creator: creator,
                    adminId: adminId?._id,
                    status: PostStatuses.PUBLISHED,
                    commentCount
                }, null)
            }

            return serviceResponse(post, null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

    async createPost(data: IAdminPost) {
        try {
            const post = await adminPostModel.create(data)
            if (!post) {
                return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
            }

            return serviceResponse(post, null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

    async changeStatusToModered(id: string) {
        try {
            await adminPostModel.findByIdAndUpdate(id, {
                $set: {
                    status: PostStatuses.MODERATE
                }
            })

            return serviceResponse(ResponseStatuses.get(ResponseStatusKeys.SUCCESS), null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

    async changeStatusToReworked(id: string) {
        try {
            await adminPostModel.findByIdAndUpdate(id, {
                $set: {
                    status: PostStatuses.REWORKED
                }
            })

            return serviceResponse(ResponseStatuses.get(ResponseStatusKeys.SUCCESS), null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

    async changeStatusToPublished(id: string) {
        try {
            const post = await adminPostModel.findById(id)
                .populate('category', ['title'])
                .populate('tag', ['title'])

            if (!post) {
                return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
            } else if (post.status === PostStatuses.PUBLISHED) {
                return serviceResponse(ResponseStatuses.get(ResponseStatusKeys.WARNING), null)
            }

            post.status = PostStatuses.PUBLISHED
            await post.save()

            const clientCategoryPromise = clientCategoryModel.findOne({title: post.category.title}).lean()
            const clientTagPromise = clientTagModel.findOne({title: post.tag?.title}).lean()

            const [clientCategory, clientTag] = await Promise.all([clientCategoryPromise, clientTagPromise])

            if (!clientCategory) {
                return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
            }

            await clientPostModel.create({
                title: post.title,
                creator: post.creator,
                content: post.content,
                img: post.img,
                category: clientCategory._id,
                tag: clientTag?._id,
                publishedDate: new Date(),
                source: post.source,
                alias: post.alias
            })

            return serviceResponse(ResponseStatuses.get(ResponseStatusKeys.SUCCESS), null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

    async changeStatusToArchive(id: string) {
        try {
            const adminPost =  await adminPostModel.findByIdAndUpdate(id, {
                $set: {
                    status: PostStatuses.ARCHIVE
                }
            }, { new: true })

            if (!adminPost) {
                return serviceResponse(ResponseStatuses.get(ResponseStatusKeys.WARNING), null)
            }

            const clientPost = await clientPostModel.findOneAndUpdate({ alias: adminPost.alias }, {
                $set: {
                    inArchive: true
                }
            }, { new: true })

            if(!clientPost) {
                return serviceResponse(ResponseStatuses.get(ResponseStatusKeys.WARNING), null)
            }

            return serviceResponse(ResponseStatuses.get(ResponseStatusKeys.SUCCESS), null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },
}