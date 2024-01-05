import 'dotenv/config'
import { S3Client } from '@aws-sdk/client-s3'

export const getS3Client = () => new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY as string,
        secretAccessKey: process.env.S3_SECRET_KEY as string
    }
})