import { ResponseStatuses } from "../consts/ResponseStatuses"
import { bookmarkModel } from "../models/bookmark.entity"
import { postModel, IPost } from "../models/post.entity"
import { serviceResponse } from '../utils/serviceResponse'
import { Document } from "mongoose"
import {userPostReactionModel} from "../models/userPostReaction.entity";
import {UserPostReactionService} from "./userPostReaction.service";

export const PostService = {
    async getPosts() {
        try {
            const posts = await postModel
                .find({ inArchive: false }, ['title', 'content', 'tag', 'category', 'inBookmark', 'commentCount'])
                .populate({ path: 'tag', select: 'title' })
                .populate({ path: 'category', select: 'title' })
                .lean()
            
            return serviceResponse(posts, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    async getTagPosts(tagId: string, skip: number, limit: number) {
        try {
            const [ posts, totalSize ] = await Promise.all([
                postModel
                    .find({ tag: tagId, inArchive: false }, { __v: false, updatedAt: false, content: false })
                    .populate('category', 'title')
                    .populate('tag', 'title')
                    .lean()
                    .skip(skip)
                    .limit(limit),
                postModel.find({ tag: tagId, inArchive: false }).count()
            ])
            
            return serviceResponse({ posts, totalSize }, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    async getPopularNews() {
        try {
            const posts = await postModel.find({ inArchive: false }, ['title', 'viewsCount'])
                .sort({ viewsCount: 'desc' })
                .limit(5)
                .lean()
            
            return serviceResponse(posts, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    async getPost(slug: string, userId: string | null = null) {
        try {
            const post = await postModel.findOne({ alias: slug }, { __v: false })
                .populate('tag', 'title')
                .populate('category', 'title')
                .lean()

            console.log(post?.alias)
            
            if(userId) {
                const bookmark = await bookmarkModel.findOne({ user: userId, post: post?._id, isDeleted: false }, { _id: true })
                const postReaction = await userPostReactionModel.findOne(
                    { user: userId, post: post?._id }
                ).lean()

                const reactionId = postReaction? postReaction.reactionId : null

                return serviceResponse({ ...post, isSaved: !!bookmark, reactionId }, null)
            }

            return serviceResponse({ ...post, isSaved: false, reactionId: null }, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    async getCategoryPosts(categoryId: string, limit: number = 0, skip: number = 0) {
        try {
            if(limit === 0) {
                const [posts, totalSize] = await Promise.all([
                    postModel
                        .find({ category: categoryId, inArchive: false }, { __v: false, updatedAt: false, content: false })
                        .skip(skip)
                        .populate({ path: 'tag', select: 'title' })
                        .populate({ path: 'category', select: 'title' })
                        .lean(),
                        
                    postModel.find({ category: categoryId, inArchive: false }).count()
                ])
                
                return serviceResponse({ posts, totalSize }, null)
            }
            
            const [posts, totalSize] = await Promise.all([
                postModel
                    .find({ category: categoryId, inArchive: false }, { __v: false, updatedAt: false, content: false })
                    .skip(skip)
                    .populate({ path: 'tag', select: 'title' })
                    .populate({ path: 'category', select: 'title' })
                    .lean()
                    .limit(limit),
                postModel.find({ category: categoryId }).count()
            ])

            return serviceResponse({ posts, totalSize }, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    async getNewNews() {
        try {
            const posts = await postModel
                .find({ createdAt: { $lte: new Date().toISOString(), $gt: new Date(Date.now()-(86400000*3)) }, inArchive: false }, { tag: false, content: false })
                .sort({ viewsCount: 'desc' })
                .populate('category', 'title')
                .lean()
                .limit(5)

            return serviceResponse(posts, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    async updateViewsCount(id: string) {
        try {
            const post = await postModel.findByIdAndUpdate(id, {
                $inc: {
                    viewsCount: 1
                }
            }, { new: true })

            return serviceResponse(post?.viewsCount, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    async getFeeds(limit?: number) {
        const l = limit? limit : 10

        try {
            const posts = await postModel.find({ inArchive: false }, { content: false, tag: false }).limit(l).populate('category', 'title')
            return serviceResponse<Document<unknown, {}, IPost>[]>(posts, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    async updateCommentCount(id: string) {
        try {
            const post = await postModel.findByIdAndUpdate(id, {
                $inc: {
                    commentCount: 1
                }
            }, { new: true })
            
            return serviceResponse(post?.commentCount, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    async findPosts(searchStr: string, skip: number, limit: number) {
        try {
            const [ posts, totalSize ] = await Promise.all([
                postModel
                    .find({ title: { $regex: searchStr, $options: 'i' }, inArchive: false },
                        ['title', 'content', 'tag', 'category', 'commentCount', 'inBookmark', 'createdAt', 'img', 'alias'])
                    .populate({ path: 'tag', select: 'title' })
                    .populate({ path: 'category', select: 'title' }).skip(skip).limit(limit),
                postModel.find({ title: { $regex: searchStr, $options: 'i' }, inArchive: false }).count()
            ])
            
            return serviceResponse({ posts, totalSize }, null)
        } catch (error) {
            return serviceResponse(null, error)
        }
    },

    async updateReaction(postId: string, reactionId: number, userId: string) {
        try {
            const { response, err } = await UserPostReactionService.getUserPostReaction(userId, postId)
            if(err) {
                return  serviceResponse(null, ResponseStatuses.get('Reject'))
            }

            if(response) {
                const prevReaction = response.reactionId

                if(prevReaction === reactionId) {
                    return serviceResponse(null, ResponseStatuses.get('Warning'))
                }

                response.reactionId = reactionId
                await response.save()

                const post = await postModel.findById(postId)
                if(!post) {
                    return serviceResponse(null, ResponseStatuses.get('Reject'))
                }

                const reactions = post.reactions

                reactions![prevReaction].count--
                reactions![reactionId].count++

                const updatedPostData = await postModel.findByIdAndUpdate(postId, {
                    $set: {
                        reactions
                    }
                }, { new: true })

                return serviceResponse(updatedPostData?.reactions![reactionId], null)
            }

            const { err: createErr } = await UserPostReactionService.createUserPostReaction(userId, postId, reactionId)
            if(createErr) {
                return  serviceResponse(null, ResponseStatuses.get('Reject'))
            }

            const post = await postModel.findById(postId)
            if(!post) {
                return serviceResponse(null, ResponseStatuses.get('Reject'))
            }

            const reactions = post.reactions

            reactions![reactionId].count++

            const updatedPostData = await postModel.findByIdAndUpdate(postId, {
                $set: {
                    reactions
                }
            }, { new: true })

            return serviceResponse(updatedPostData?.reactions![reactionId], null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },
}