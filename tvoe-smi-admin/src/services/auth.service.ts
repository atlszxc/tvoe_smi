import 'dotenv/config'
import {ResponseStatuses, ResponseStatusKeys} from '../consts/ResponsesStatuses'
import {IEmployee} from '../models/adminModels/employee.entity'
import {generateToken} from '../utils/generateToken'
import {serviceResponse} from '../utils/serviceResponse'
import {EmployeeService} from './employee.service'
import {EmployeeAuthService} from './employeeAuth.service'
import axios from "axios";
import {employeeAuthModel} from "../models/adminModels/employeeAuth";

export class Auth {
    constructor(id: number, phone: string) {
        this.id = id
        this.phone = phone
    }

    id: number
    phone: string
    code = Math.floor(Math.random() * (9999 - 1000) + 1000)
    retryMax = 3
    retryCount = 0

    async sendSMS(imgcode: string | undefined, ip: string) {
        try {
            this.retryCount++

            if (this.checkRetries() && !imgcode) {
                return serviceResponse(null, {...ResponseStatuses.get(ResponseStatusKeys.REJECT), retry: this.checkRetries()})
            }

            this.code = Math.floor(Math.random() * (9999 - 1000) + 1000)

            const url = imgcode ?
                `https://smsc.ru/sys/send.php?login=${process.env.SMSC_LOGIN}&psw=${process.env.SMSC_PASSWORD}&phones=${this.phone}&mes=${this.code}&imgcode=${imgcode}&userip=${ip}&op=1&fmt=3`
                :
                `https://smsc.ru/sys/send.php?login=${process.env.SMSC_LOGIN}&psw=${process.env.SMSC_PASSWORD}&phones=${this.phone}&mes=${this.code}&op=1&fmt=3`

            const {data} = await axios.get(url)

            if (data.error_code === 10) {
                return serviceResponse(null, {...ResponseStatuses.get(ResponseStatusKeys.REJECT), retry: this.checkRetries()})
            } else if (this.checkRetries() && (!data.error_code || data.error_code == 6) && imgcode) {
                this.retryCount = 0
            }

            return serviceResponse({data, code: this.code}, null)
        } catch (error) {
            return serviceResponse(null, error)
        }
    }

    checkRetries() {
        return this.retryCount >= this.retryMax
    }

    async login(code: number) {
        if (code !== this.code) {
            this.retryCount++
            return serviceResponse(null, {msg: 'Неверный код подтверждения'})
        }

        try {
            const {response, err} = await EmployeeService.getUserByPhone(this.phone)

            if (err) {
                return serviceResponse(null, err)
            }

            if (response?.employee?._id) {
                const { response: authDataResponse, err: authDataErr } = await EmployeeAuthService.getEmployeeAuthData(response.employee._id.toString())

                const [token, refreshToken] = generateToken(response?.employee._id.toString())

                if (authDataResponse) {
                    authDataResponse.token = token
                    authDataResponse.refreshToken = refreshToken
                    await authDataResponse.save()
                } else {
                    await employeeAuthModel.create({
                        userId: response.employee._id,
                        token,
                        refreshToken,
                    })
                }

                if (err) {
                    console.log('Не удалось создать запись о аутентификации пользователя', err)
                }

                return serviceResponse({token, user: response}, null)
            }

            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))

        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.BROKEN_SERVER))
        }
    }
}

/*
* Сервис для авторизации и создания сотрудника
* */
export const AuthService = {
    async createEmployee(data: IEmployee) {
        try {
            const { response, err } = await EmployeeService.createEmployee(data)
            if(err) {
                return serviceResponse(null, err)
            }

            if(response?._id) {
                const [ token, refreshToken ] = generateToken(response._id.toString())
                const { err: createEmployeeAuthError } = await EmployeeAuthService.createEmployeeAuthData({
                    employee: response._id.toString(),
                    refreshToken,
                    token,
                })

                if(createEmployeeAuthError) {
                    return serviceResponse(null, createEmployeeAuthError)
                }

                return serviceResponse({ employee: response }, null)
            }

            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    },

    async loginEmployee(login: string, password: string) {
        try {
            const { response: employeeData, err } = await EmployeeService.getEmployeeByLoginAndPassword(login, password)
            if(err) {
                return serviceResponse(null, err)
            }

            if(!employeeData?._id) {
                return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
            }

            const { response: employeeAuthData, err: EmployeeAuthDataError } = await EmployeeAuthService.getEmployeeAuthData(employeeData._id.toString())
            if(EmployeeAuthDataError) {
                return serviceResponse(null, err)
            }

            const [ token, refreshToken ] = generateToken(employeeData._id.toString())
            if(employeeAuthData) {
                employeeAuthData.token = token
                employeeAuthData.refreshToken = refreshToken
                await employeeAuthData.save()
            } else {
                const { err } = await EmployeeAuthService.createEmployeeAuthData({
                    employee: employeeData._id.toString(),
                    token,
                    refreshToken
                })

                if(err) {
                    return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
                }
            }

            return serviceResponse({ employee: employeeData, token }, null)
            
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get(ResponseStatusKeys.REJECT))
        }
    }
}