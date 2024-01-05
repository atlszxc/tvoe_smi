import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { rateLimit } from 'express-rate-limit'
import { verifyToken } from "../middlewares/verifyToken";

export const authRouter = Router()

const authRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: 'Слишком много попыток получить смс, попробуйте, через 1 час',
    standardHeaders: 'draft-7',
    legacyHeaders: false,
})

authRouter.post('/sendsms', authRateLimiter, AuthController.sendSMS)
authRouter.get('/login', AuthController.login)
authRouter.get('/logout', AuthController.logout)
authRouter.get('/verify', verifyToken, AuthController.verifyPhone)