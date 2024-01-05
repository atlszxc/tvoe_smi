import 'dotenv/config'
import {Upload} from '@aws-sdk/lib-storage'
import {DeleteObjectCommand} from '@aws-sdk/client-s3'
import {getS3Client} from '../utils/getS3Client'
import {serviceResponse} from '../utils/serviceResponse'
import sharp, {FitEnum, FormatEnum} from 'sharp'
import mongoose from 'mongoose'
import {ResponseStatuses, ResponseStatusKeys} from '../consts/ResponsesStatuses'
import {IImageFormat} from "../consts/imageSizes";
import sizeOf from 'image-size'

export interface BucketName {
    POST_IMG: 'postImage',
    AVATAR: 'userAvatars',
    ADVERTISING: 'advertising'
}

export interface IPostImg {
    name: string,
    file: Express.Multer.File
}

/*
* Сервис для работы с картинками
* */

/*
* width: number, height: number, type: keyof FormatEnum = 'jpg', fit: keyof FitEnum = 'cover',
*
* */
export const ImageService = {
    height: 560,

    async uploadMany(files: IPostImg[], formatData: IImageFormat, directory: keyof BucketName = 'POST_IMG') {
        try {
            const convertedFilesPromise = files.map(file =>
                {
                    const dimensions = sizeOf(file.file.buffer)

                    const w = Math.round(ImageService.height / ((dimensions?.height || 560) / (dimensions?.width || 720)))

                    return sharp(file.file.buffer).resize({
                        fit: formatData.fit,
                        width: w,
                        height: ImageService.height
                    })
                        .toFormat(formatData.type, {
                            quality: 100,
                            chromaSubsampling: '4:4:4'
                        })
                        .toBuffer()
                }
            )

            const convertedFiles = await Promise.all(convertedFilesPromise)

            const uploadFilePromises = convertedFiles.map((buffer, idx) => {
                const parallelUpload = new Upload({
                    client: getS3Client(),
                    params: {
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: `${directory}/${files[idx].name}.${formatData.type}`,
                        Body: buffer,
                        ContentType: `image/${formatData.type}`
                    },
                    partSize: 1024 ** 3
                })

                return parallelUpload.done()
            })

            const { err } = await Promise.all(uploadFilePromises).then((res) => serviceResponse(res, null))
                .catch(err => serviceResponse(null, err))

            if(err) {
                return serviceResponse(null, err)
            }

            return serviceResponse(ResponseStatuses.get(ResponseStatusKeys.SUCCESS), null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

    async upload(file: Express.Multer.File, formatData: IImageFormat, directory: keyof BucketName = 'POST_IMG') {
        const dimensions = sizeOf(file.buffer)

        const w = Math.round(ImageService.height / ((dimensions?.height || 560) / (dimensions?.width || 720)))

        try {
            const convertedFile = await sharp(file.buffer).resize({
                fit: formatData.fit,
                width: w,
                height: ImageService.height,
            }).toFormat(formatData.type, {
                quality: 100,
                chromaSubsampling: '4:4:4'
            }).toBuffer()

            const parallelUpload = new Upload({
                client: getS3Client(),
                params: {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: `${directory}/${new mongoose.Types.ObjectId}.${formatData.type}`,
                    Body: convertedFile,
                    ContentType: `image/${formatData.type}`
                },
                partSize: 1024 ** 3
            })

            const res: any = await parallelUpload.done()
            return serviceResponse(res.Key, null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

    async update(file: Express.Multer.File,  formatData: IImageFormat, key: string) {
        try {
            const convertedFile = await sharp(file.buffer).resize({
                fit: formatData.fit,
                width: formatData.width,
                height: formatData.height,
            }).toFormat(formatData.type, {
                quality: 100,
                chromaSubsampling: '4:4:4'
            }).toBuffer()

            const parallelUpload = new Upload({
                client: getS3Client(),
                params: {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: key,
                    Body: convertedFile,
                    ContentType: `image/${formatData.type}`
                },
                partSize: 1024 ** 3
            })
            
            const res: any = await parallelUpload.done()
            return serviceResponse(res.Key, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

    async delete(key: string) {
        try {
            const command = new DeleteObjectCommand({
                Key: key,
                Bucket: process.env.S3_BUCKET_NAME
            })

            const res = await getS3Client().send(command)
            return serviceResponse(res, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    }
}