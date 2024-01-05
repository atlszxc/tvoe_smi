import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

export const authRouter = Router()

authRouter.post('/create', AuthController.createEmployee)
authRouter.post('/sendsms', AuthController.sendSMS)
authRouter.get('/login', AuthController.login)
