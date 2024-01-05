import {JobCallback} from "node-schedule";
import {publicationDateBook} from "../tasks/publicationDateBook";

export enum TaskNames {
    PUBLICATION_DATE_BOOK = "publicationDateBook"
}

export interface ITask {
    period: string,
    name: string,
    task: JobCallback
}

export const TASKS = new Map<string, ITask>([
    [TaskNames.PUBLICATION_DATE_BOOK, {
        name: TaskNames.PUBLICATION_DATE_BOOK,
        period: '*/30 * * * *',
        task: publicationDateBook
    }]
])