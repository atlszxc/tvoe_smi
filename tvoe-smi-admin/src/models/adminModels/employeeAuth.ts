import { Schema, model } from "mongoose";
import { IEmployee } from "./employee.entity";
import { adminDB } from "../../consts/dbClients";

export interface IEmployeeAuth {
    employee: IEmployee,
    token: string,
    refreshToken: string
}

const employeeAuthSchema = new Schema<IEmployeeAuth>({
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'employee',
        required: true,
    },
    token: {
        type: String,
        required: true,
        unique: true,
    },
    refreshToken: {
        type: String,
        required: true,
        unique: true,
    }
}, {
    timestamps: true
})

export const employeeAuthModel = adminDB.model('employeeAuth', employeeAuthSchema)