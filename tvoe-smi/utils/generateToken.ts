import 'dotenv/config'
import jwt from 'jsonwebtoken'

/**
 * 
 * @param id - id пользователя
 * @returns возвращает пару токена и токена для обновления
 */
export const generateToken = (id: string) => {
    const token = jwt.sign({ id }, process.env.AUTH_SECRET_KEY as string, { expiresIn: '24h' })
    const refreshToken =  jwt.sign({ id }, process.env.AUTH_REFRESH_SECRET_KEY as string, { expiresIn: '30d' })

    return [token, refreshToken]
}