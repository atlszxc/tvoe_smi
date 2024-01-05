import { Router } from "express";
import { ProfileController } from "../controllers/profile.controller";
import multer from "multer";
import { verifyToken } from "../middlewares/verifyToken";

export const profileRoute = Router()

const storage = multer.memoryStorage()
const uploadStorage = multer({ storage })

profileRoute.get('/', verifyToken, ProfileController.getUser)
profileRoute.post('/bookmark', verifyToken, ProfileController.addBookmark)
profileRoute.delete('/delete', verifyToken, ProfileController.deleteAccount)
profileRoute.get('/bookmark/:id', verifyToken, ProfileController.getBookmarks)
profileRoute.delete('/bookmark/:id', verifyToken, ProfileController.deleteBookmark)
profileRoute.patch('/:id', verifyToken, uploadStorage.single('avatar'), ProfileController.updateUser)