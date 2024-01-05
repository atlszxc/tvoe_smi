import dotenv from 'dotenv'
import express, { json, urlencoded } from 'express'
import path from 'path'
import cors from 'cors'
import { authRouter } from './routes/auth.router'
import { categoryRouter } from './routes/category.router'
import { tagRouter } from './routes/tag.router'
import { postRouter } from './routes/post.router'
import {statisticRouter} from "./routes/statistic.router";
import {employeeRouter} from "./routes/employee.router";
import {userRouter} from "./routes/user.router";
import {TaskService} from "./services/app/task.service";
import {getConfigureBuildProject} from "./utils/app/getTypeBuildProject";
import {commentRouter} from "./routes/comment.router";


dotenv.config({
    path: path.resolve(process.cwd(), `${process.env.NODE_ENV}.env`)
})

const { accessUrls } = getConfigureBuildProject()
console.log(accessUrls)

const app = express()

app.use(json())
app.use(urlencoded({ extended: true }))
app.use(cors({
    origin: accessUrls,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}))

app.use('/auth', authRouter)
app.use('/category', categoryRouter)
app.use('/tag', tagRouter)
app.use('/post', postRouter)
app.use('/statistic', statisticRouter)
app.use('/employee', employeeRouter)
app.use('/user', userRouter)
app.use('/comment', commentRouter)

const startServer = () => {
    try {
        app.listen(process.env.APP_PORT, () => {
            console.log(`Server has been started on port: ${process.env.APP_PORT}`)
        })

        // TaskService.startAllTasks()
    } catch (error) {
        throw Error('Broken start server')
    }
}

startServer()
