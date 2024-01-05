import { Router } from "express";
import multer from "multer";
import { AdvertisingController } from "../controllers/advertising.contoller";

const storage = multer.memoryStorage()
const uploadStorage = multer({ storage })

export const advertisingRoute = Router()

advertisingRoute.get('/', AdvertisingController.getAdvertising)
advertisingRoute.post('/create', uploadStorage.single('img'), AdvertisingController.createAdvertising)