import {ResponseStatuses, ResponseStatusKeys} from "../consts/ResponsesStatuses";
import {employeeModel, IEmployee} from "../models/adminModels/employee.entity";
import {serviceResponse} from "../utils/serviceResponse";


/*
* Сервис для взаимодействия с сотрудниками
* */
export const EmployeeService = {
    async createEmployee(data: IEmployee) {
        try {
            const condidate = await employeeModel?.findOne({ login: data.login, password: data.password }, { _id: true }).lean()
            if(condidate) {
               return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
            }

            const employee = await employeeModel?.create(data)
            if(!employee) {
                return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
            }

            return serviceResponse(employee, null)

        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

    async getEmployee(id: string) {
        try {
            const employee = await employeeModel.findById(id, {
                firstname: true,
                lastname: true,
                phone: true,
                email: true,
                role: true,
            })

            return serviceResponse(employee, null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

    async updateEmployee(id: string, data: IEmployee) {
        try {
            await employeeModel.findByIdAndUpdate(id, {
                ...data
            })

            return  serviceResponse(ResponseStatuses.get(ResponseStatusKeys.SUCCESS), null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

    async getUserByPhone(phone: string) {
        try {
            const employee = await employeeModel.findOne({ phone })
            return serviceResponse({ employee }, null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

    async getEmployeeByLoginAndPassword(login: string, password: string) {
        try {
            const employee = await employeeModel?.findOne({ login, password }).lean()
            if(!employee) {
                return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
            }

            return serviceResponse(employee, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

    async getEmployees(page: number, role: number) {
        const skip = page * 8
        const limit = 8
        const employeesCount = await employeeModel.find().countDocuments()
        const pages = Math.ceil(employeesCount / limit)

        try {
            const employees = await employeeModel
                .find(
                    { role },
                    { _id: true, firstname: true, lastname: true, phone: true, email: true }
                )
                .skip(skip)
                .limit(limit)
                .lean()
            return serviceResponse({
                employees,
                pages,
                currentPage: page
            }, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    }
}