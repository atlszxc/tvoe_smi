import dotenv from 'dotenv'
import mongoose from "mongoose";
import path from 'path'

dotenv.config({
    path: path.resolve(process.cwd(), `${process.env.NODE_ENV}.env`)
})

export const adminDB =  mongoose.createConnection(process.env.ADMIN_DB_URI as string).on('connected', () => console.log('Admin DB connected'))
export const clientDB = mongoose.createConnection(process.env.CLIENT_DB_URI as string).on('connected', () => console.log('Client DB connected'))