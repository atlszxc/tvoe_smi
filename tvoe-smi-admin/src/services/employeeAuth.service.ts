import { ResponseStatusKeys, ResponseStatuses } from '../consts/ResponsesStatuses'
import { employeeAuthModel } from '../models/adminModels/employeeAuth'
import { serviceResponse } from '../utils/serviceResponse'

interface CreateEmployeeAuthDataDTO {
    employee: string,
    token: string,
    refreshToken: string
}

/*
* Сервис для взаимодействия с данными аутентификации сотрудников
* */
export const EmployeeAuthService = {
    async createEmployeeAuthData(data: CreateEmployeeAuthDataDTO) {
        try {
            await employeeAuthModel?.create(data)
            return serviceResponse(ResponseStatuses.get(ResponseStatusKeys.SUCCESS), null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

    async getEmployeeAuthData(id: string) {
        try {
            const authData = await employeeAuthModel?.findOne({ employee: id })
            if(!authData) {
                return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
            }

            return serviceResponse(authData, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    }
}