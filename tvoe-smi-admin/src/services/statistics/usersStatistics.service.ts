import {employeeModel, EmployeeRole} from "../../models/adminModels/employee.entity";
import {serviceResponse} from "../../utils/serviceResponse";
import {ResponseStatuses, ResponseStatusKeys} from "../../consts/ResponsesStatuses";
import {clientUserModel} from "../../models/clientModels/user.entity";
import {getDateFilter} from "../../utils/getFilters";

/*
* Сервис для получения статистических данных по пользователям и сотрудникам
* */
export const UserStatisticsService = {
    /*
    * Метод для получения кол-ва пользователей и сотрудников
    * */
    async getUsersCountStatistics(start: string | null, finish: string | null) {
        const dateFilter = start && finish && getDateFilter(start, finish)

        try {
            const journalistCountPromise = employeeModel.find({ role: EmployeeRole.JOURNALIST, ...dateFilter }).countDocuments()
            const adminCountPromise = employeeModel.find({ role: EmployeeRole.ADMIN, ...dateFilter }).countDocuments()
            const userCountPromise = clientUserModel.find({ ...dateFilter }).countDocuments()

            const [ journalistCount, adminCount, userCount ] = await  Promise.all([journalistCountPromise, adminCountPromise, userCountPromise])

            return serviceResponse({
                journalistCount,
                adminCount,
                userCount,
                totalCount: journalistCount + adminCount + userCount
            }, null)
        } catch (error) {
            return  serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

    /*
    * Метод для получения кол-ва регистраций за неделю
    * */
    async getNewUsersByLastWeek() {
        try {
            const users = await clientUserModel.find({
                createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) }
            }, {
                _id: false,
                createdAt: true,
            })

            return serviceResponse(users, null)
        } catch (error) {
            return  serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    }
}