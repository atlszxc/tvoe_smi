import { Router } from "express";
import { CuncurrancyController } from "../controllers/cuncurrancy.contriller";

export const cuncurrancyRoute = Router()

cuncurrancyRoute.get('/', CuncurrancyController.getCuncurrancy)