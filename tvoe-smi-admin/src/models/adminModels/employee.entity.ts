import { Schema } from "mongoose";
import { adminDB } from "../../consts/dbClients";

export enum EmployeeRole {
    ADMIN,
    JOURNALIST,
    DEVELOPER,
}

export interface IEmployee {
    _id?: string
    firstname: string,
    lastname: string,
    phone: string,
    email?: string,
    role?: EmployeeRole,
    password: string,
    login: string,
}

const employeeSchema = new Schema<IEmployee>({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    role: {
        type: Number,
        enum: EmployeeRole,
        required: true,
        default: EmployeeRole.JOURNALIST
    },
    login: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
})

export const employeeModel = adminDB.model('employee', employeeSchema)