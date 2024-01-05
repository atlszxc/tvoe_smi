import axios from 'axios'
import {serviceResponse} from '../utils/serviceResponse'
import {UserService} from './user.service'
import {AuthLogService} from './authLog.service'
import {authModel} from '../models/auth.entity'
import {generateToken} from '../utils/generateToken'
import {ResponseStatuses} from '../consts/ResponseStatuses'

export enum AuthServiceType {
    AUTH = "auth",
    CHANGEPHONE = "phone"
}

/**
 * Класс-сервис для авторизации через смс
 */
export class Auth {
    constructor(id: number, phone: string, type: string) {
        this.id = id
        this.phone = phone
        this.type = type
    }

    id: number
    type: string
    phone: string
    code = Math.floor(Math.random() * (9999 - 1000) + 1000)
    retryMax = 3
    retryCount = 0

    /**
     * Метод для получения кода подтверждения
     * @returns Возвращает данные с смс-центра и код для подтверждения
     */
    async sendSMS(imgcode: string | undefined, ip: string) {
        try {
            this.retryCount++

            if (this.checkRetries() && !imgcode) {
                return serviceResponse(null, {...ResponseStatuses.get('Reject'), retry: this.checkRetries()})
            }

            this.code = Math.floor(Math.random() * (9999 - 1000) + 1000)

            const url = imgcode ?
                `https://smsc.ru/sys/send.php?login=${process.env.SMSC_LOGIN}&psw=${process.env.SMSC_PASSWORD}&phones=${this.phone}&mes=${this.code}&imgcode=${imgcode}&userip=${ip}&op=1&fmt=3`
                :
                `https://smsc.ru/sys/send.php?login=${process.env.SMSC_LOGIN}&psw=${process.env.SMSC_PASSWORD}&phones=${this.phone}&mes=${this.code}&op=1&fmt=3`

            const {data} = await axios.get(url)

            if (data.error_code === 10) {
                return serviceResponse(null, {...ResponseStatuses.get('Reject'), retry: this.checkRetries()})
            } else if (this.checkRetries() && (!data.error_code || data.error_code == 6) && imgcode) {
                this.retryCount = 0
            }

            return serviceResponse({data, code: this.code}, null)
        } catch (error) {
            return serviceResponse(null, error)
        }
    }

    async verifyPhone(code: number, id: string) {
        if (code !== this.code) {
            this.retryCount++
            return serviceResponse(null, {...ResponseStatuses.get('Reject'), retry: this.checkRetries()})
        }

        const {response, err} = await UserService.changeNumber(id, this.phone)

        if (err) {
            return serviceResponse(null, err)
        }

        return serviceResponse(response, null)
    }

    checkRetries() {
        return this.retryCount >= this.retryMax
    }

    /**
     *
     * @param code - код введеный пользователем для подтверждения
     * @returns При успешном подтверждении возвращает фоормирует пару токенов для пользователя или обновляет их
     */
    async login(code: number) {
        if (code !== this.code) {
            this.retryCount++
            return serviceResponse(null, {msg: 'Неверный код подтверждения'})
        }

        try {
            const {response, err} = await UserService.createUser({phone: this.phone})

            if (err) {
                return serviceResponse(null, err)
            }

            if (response?.user._id) {
                const authUserData = await authModel.findOne({userId: response?.user._id})

                const [token, refreshToken] = generateToken(response?.user._id.toString())

                if (authUserData) {
                    authUserData.token = token
                    authUserData.refreshToken = refreshToken
                    await authUserData.save()
                } else {
                    await authModel.create({
                        userId: response.user._id,
                        token,
                        refreshToken,
                    })
                }

                const {err} = await AuthLogService.createLog({
                    user: response.user._id.toString(),
                    type: response.logType
                })
                if (err) {
                    console.log('Не удалось создать запись о аутентификации пользователя', err)
                }
                return serviceResponse({token, user: response}, null)
            }

            return serviceResponse(null, ResponseStatuses.get('Reject'))

        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get('BrokenServer'))
        }
    }
}