import 'dotenv/config'
import { Upload } from '@aws-sdk/lib-storage'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getS3Client } from '../utils/getS3Client'
import { serviceResponse } from '../utils/serviceResponse'
import sharp, { FitEnum, FormatEnum } from 'sharp'
import mongoose from 'mongoose'
import { ResponseStatuses } from '../consts/ResponseStatuses'

export interface BucketName {
    POST_IMG: 'postImage',
    AVATAR: 'userAvatars',
    ADVERTISING: 'advertising'
}

export const ImageService = {
    async upload(file: Express.Multer.File, width: number, height: number, type: keyof FormatEnum = 'jpg', fit: keyof FitEnum = 'cover', directory: keyof BucketName = 'POST_IMG') {
        try {
            const convertedFile = await sharp(file.buffer).resize({
                fit,
                width,
                height
            }).toFormat(type).toBuffer()

            const parallelUpload = new Upload({
                client: getS3Client(),
                params: {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: `${directory}/${new mongoose.Types.ObjectId}.${type}`,
                    Body: convertedFile,
                    ContentType: `image/${type}`
                },
                partSize: 1024 ** 3
            })

            const res: any = await parallelUpload.done()
            return serviceResponse(res.Key, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    async update(file: Express.Multer.File, width: number, height: number, key: string, type: keyof FormatEnum = 'jpg', fit: keyof FitEnum = 'cover') {
        try {
            const convertedFile = await sharp(file.buffer).resize({
                fit,
                width,
                height
            }).toFormat(type).toBuffer()

            const parallelUpload = new Upload({
                client: getS3Client(),
                params: {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: key,
                    Body: convertedFile,
                    ContentType: `image/${type}`
                },
                partSize: 1024 ** 3
            })
            
            const res: any = await parallelUpload.done()
            return serviceResponse(res.Key, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
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
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    }
}