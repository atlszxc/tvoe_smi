import dotenv from 'dotenv'
import express, { json, urlencoded } from 'express'
import cors from 'cors'
import path from 'path'
import mongoose from 'mongoose'
import { categoryRouter } from './routes/category.route'
import { tagRouter } from './routes/tag.route'
import { postRouter } from './routes/post.route'
import YAML from 'yamljs'
import swaggerUi from 'swagger-ui-express'
import { authRouter } from './routes/auth.route'
import { commentRoute } from './routes/comment.route'
import { profileRoute } from './routes/profile.route'
import { mainRouter } from './routes/main.route'
import cookerParser from 'cookie-parser'
import { advertisingRoute } from './routes/advertising.route'
import { cuncurrancyRoute } from './routes/cuncurrancy.route'
import userAgent from 'express-useragent'
import {getConfigureBuildProject} from "./utils/app/generateBuildProject";

dotenv.config({
    path: path.resolve(__dirname, `${process.env.NODE_ENV}.env`)
})

const swaggerDoc = YAML.load('./swagger/doc.yaml')

const app = express()

app.set('trust proxy', true)

const { accessUrls } = getConfigureBuildProject()
console.log(accessUrls)

app.use(json())
app.use(urlencoded({ extended: true }))
app.use(cors({
    origin: accessUrls,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}))

app.use(userAgent.express())
app.use(cookerParser())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
app.use('/category', categoryRouter)
app.use('/tag', tagRouter)
app.use('/post', postRouter)
app.use('/auth', authRouter)
app.use('/comment', commentRoute)
app.use('/profile', profileRoute)
app.use('/main', mainRouter)
app.use('/advertising', advertisingRoute)
app.use('/cuncurrancy', cuncurrancyRoute)

const startServer = async () => {
    try {
        await mongoose.connect(process.env.DB_URI as string).then(() => console.log('Database connected'))
        app.listen(process.env.APP_PORT)
    } catch (error) {
        console.log(error)
    }
}

startServer().then(() => console.log(`Server has been started on port: ${process.env.APP_PORT}`)).catch(err => console.log(err))