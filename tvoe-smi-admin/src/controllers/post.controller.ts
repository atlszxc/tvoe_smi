import {Request, Response} from 'express'
import {PostService} from '../services/post.service'
import {ResponseStatusKeys, ResponseStatuses} from '../consts/ResponsesStatuses'
import {FitEnum, FormatEnum} from 'sharp'
import {BucketName, ImageService} from '../services/image.service'
import {SortOrder} from "mongoose";
import {getPostImageFormat} from "../consts/imageSizes";
import jwt, { JwtPayload } from 'jsonwebtoken'
import {EmployeeService} from "../services/employee.service";
import {EmployeeRole} from "../models/adminModels/employee.entity";
import {getCookie} from "../utils/getCookie";

export const PostController = {
    async getAllPosts(_: Request, res: Response) {
        try {
            const { response, err } = await PostService.getAllPosts()
            if (err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(503).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    },

    async deletePost(req: Request, res: Response) {
        try {
            const { response, err } = await PostService.deletePost(req.params.id)
            if (err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            console.log(error)
            return res.status(503).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    },

    async getPosts(req: Request, res: Response) {
        const categories = req.query.categories ? String(req.query.categories)?.split('|') : null
        const sortField = req.query.field ? String(req.query.field) : null
        const sortType = req.query.type ? Number(req.query.type) : 1

        try {
            const token = getCookie('employee_token', req.headers.cookie)
            if(!token) {
                return res.status(403).send(ResponseStatuses.get(ResponseStatusKeys.REJECT))
            }

            const { id } = jwt.verify(token, process.env.AUTH_SECRET_KEY as string) as JwtPayload

            const { response: user, err: userErr } = await EmployeeService.getEmployee(id)
            if(userErr) {
                return res.status(400).send(userErr)
            }

            if(user?.role === EmployeeRole.JOURNALIST) {
                const { response, err } = await PostService.getEmployeePosts(
                    id,
                    Number(req.query.status),
                    Number(req.query.page),
                    req.query.start as string,
                    req.query.finish as string,
                    categories,
                    sortField,
                    sortType as SortOrder
                )

                if(err) {
                    return res.status(400).send(err)
                }

                return res.status(200).send(response)
            }

            const {response, err} = await PostService.getPosts(
                Number(req.query.status),
                Number(req.query.page),
                req.query.start as string,
                req.query.finish as string,
                categories,
                sortField,
                sortType as SortOrder
            )
            if (err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            console.log(error)
            return res.status(503).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    },

    async getPost(req: Request, res: Response) {
        try {
            const { response, err } = await  PostService.getPost(req.params.id)
            if(err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(503).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    },
    
    async updatePost(req: Request, res: Response) {
        if (!req.body || !req.files) {
            return res.status(400).send(ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }

        const token = getCookie('employee_token', req.headers.cookie)
        if(!token) {
            return res.status(403).send(ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }

        const { id } = jwt.verify(token, process.env.AUTH_SECRET_KEY as string) as JwtPayload

        const postFiles: any = {...req.files}

        const postImgs: Express.Multer.File[] = postFiles['imgs']
        const titleImage: Express.Multer.File | null = postFiles['titleImg']? postFiles['titleImg'][0] : null

        const imageFormatData = getPostImageFormat(
            Number(req.query.width || 720),
            Number(req.query.height || 480),
            req.query.fit as keyof FormatEnum,
            req.query.bucket as keyof FitEnum
        )

        const bucket: keyof BucketName = req.query.bucket ? req.query.bucket as keyof BucketName : 'POST_IMG'

        const postContent = JSON.parse(req.body.data)

        const postKeys = JSON.parse(req.body.keys)
        const existing = Number(req.body.existing)
        const videosUrls = req.body.video ? JSON.parse(req.body.video) : []
        const alias = req.body.alias || null

        const imgsData: any[] = postContent.content.filter((item: any) => item.type === "image")

        try {
            if(postImgs) {
                if (postImgs && postImgs.length !== imgsData.length - existing) {
                    return res.status(400).send(ResponseStatuses.get(ResponseStatusKeys.REJECT))
                }

                const files = postImgs.map((file, idx) => ({
                    name: postKeys[idx],
                    file
                }))

                const { err: postContentErr } = await ImageService.uploadMany(
                    files,
                    imageFormatData,
                    bucket
                )

                if(postContentErr) {
                    return res.status(400).send(ResponseStatuses.get(ResponseStatusKeys.REJECT))
                }
            }

            const { response, err: updatePostErr } = await  PostService.updatePost(
                req.params.id,
                {
                    creator: id,
                    content: JSON.stringify(postContent),
                    tag: req.body.tag,
                    category: req.body.category,
                    title: req.body.title,
                    source: req.body.source,
                    videoUrls: videosUrls,
                    publicationDateBook: req.body.publicationDateBook || null,
                    alias
                },
                titleImage
            )

            if(updatePostErr) {
                return res.status(400).send(ResponseStatuses.get(ResponseStatusKeys.REJECT))
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(503).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    },

    async createPost(req: Request, res: Response) {
        if (!req.body || !req.files) {
            return res.status(400).send(ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }

        const token = getCookie('employee_token', req.headers.cookie)
        if(!token) {
            return res.status(403).send(ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }

        const { id } = jwt.verify(token, process.env.AUTH_SECRET_KEY as string) as JwtPayload

        const postFiles: any = {...req.files}
        const postImgs: Express.Multer.File[] = postFiles['imgs']
        const titleImage: Express.Multer.File = postFiles['titleImg'][0]

        const bucket: keyof BucketName = req.query.bucket ? req.query.bucket as keyof BucketName : 'POST_IMG'

        const imageFormatData = getPostImageFormat(
            Number(req.query.width || 720),
            Number(req.query.height || 480),
            req.query.fit as keyof FormatEnum,
            req.query.bucket as keyof FitEnum
        )

        const postContent = JSON.parse(req.body.data)
        const videosUrls = req.body.video ? JSON.parse(req.body.video) : []
        const alias = req.body.alias || null

        const imgsData: any[] = postContent.content.filter((item: any) => item.type === "image")

        try {
            if(postImgs) {
                if (postImgs && postImgs.length !== imgsData.length) {
                    console.log(4)
                    return res.status(400).send(ResponseStatuses.get(ResponseStatusKeys.REJECT))
                }

                const files = postImgs.map((file, idx) => ({
                    name: imgsData[idx].data.id,
                    file
                }))

                const { err: postContentErr } = await ImageService.uploadMany(
                    files,
                    imageFormatData,
                    bucket
                )

                if(postContentErr) {
                    console.log(3)
                    return res.status(400).send(ResponseStatuses.get(ResponseStatusKeys.REJECT))
                }
            }

            const {response: img, err} = await ImageService.upload(titleImage, imageFormatData, bucket)
            if (err) {
                console.log(1)
                return res.status(400).send(ResponseStatuses.get(ResponseStatusKeys.REJECT))
            }

            const {response, err: createPostErr} = await PostService.createPost({
                creator: id,
                content: JSON.stringify(postContent),
                img,
                alias,
                tag: req.body.tag,
                category: req.body.category,
                title: req.body.title,
                source: req.body.source,
                videoUrls: videosUrls,
                publicationDateBook: req.body.publicationDateBook || null
            })

            if (createPostErr) {
                console.log(2)
                return res.status(400).send(ResponseStatuses.get(ResponseStatusKeys.REJECT))
            }

            return res.status(201).send(response)
        } catch (error) {
            return res.status(503).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    },

    async changeStatusToModered(req: Request, res: Response) {
        try {
            const {response, err} = await PostService.changeStatusToModered(req.params.id)
            if (err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(503).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    },

    async changeStatusToReworked(req: Request, res: Response) {
        try {
            const {response, err} = await PostService.changeStatusToReworked(req.params.id)
            if (err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(503).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    },

    async changeStatusToPublished(req: Request, res: Response) {
        try {
            const {response, err} = await PostService.changeStatusToPublished(req.params.id)
            if (err) {
                return res.status(400).send(err)
            }

            return res.status(201).send(response)
        } catch (error) {
            return res.status(503).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    },

    async changeStatusToArchive(req: Request, res: Response) {
        try {
            const {response, err} = await PostService.changeStatusToArchive(req.params.id)
            if (err) {
                return res.status(400).send(err)
            }

            return res.status(200).send(response)
        } catch (error) {
            return res.status(503).send(ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    }
}