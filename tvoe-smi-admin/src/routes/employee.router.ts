import {Router} from "express";
import {EmployeesController} from "../controllers/employees.controller";
import {verifyToken} from "../middlewares/verifyToken";

export const employeeRouter = Router()

employeeRouter.get('/', EmployeesController.getEmployees)
employeeRouter.get('/profile', verifyToken, EmployeesController.getEmployee)
employeeRouter.patch('/profile/update', verifyToken, EmployeesController.updateEmployee)