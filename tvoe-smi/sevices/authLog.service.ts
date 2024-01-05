import { ResponseStatuses } from "../consts/ResponseStatuses"
import { authLogModel, AuthType } from "../models/authLog.entity"
import { serviceResponse } from "../utils/serviceResponse"

interface AuthLogCreateDto {
    user: string,
    type: AuthType
}

export const AuthLogService = {
    async createLog(data: AuthLogCreateDto) {
        try {
            const log = await authLogModel.create(data)
            return serviceResponse(log, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    }
}