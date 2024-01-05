import {TASKS} from "../../consts/tasks";
import cron, {JobCallback} from 'node-schedule'

export const TaskService = {
    startTask(key: string, method: JobCallback) {
        const taskData = TASKS.get(key)
        if(taskData) {
            cron.scheduleJob(taskData.period, method)
        }
    },

    startAllTasks() {
        TASKS.forEach(task => cron.scheduleJob(task.period, task.task))
    }
}