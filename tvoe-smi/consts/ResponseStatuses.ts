export interface IResponseStatus {
    code: number,
    desc: string,
    alert: boolean,
}

/**
 * Мапа для возможных вариантов ответа
 */
export const ResponseStatuses = new Map<string, IResponseStatus>([
    ['Success', {
        code: 2000,
        desc: 'Успешное выполнение операции',
        alert: true
    }],
    ['Warning', {
        code: 3000,
        desc: 'Возможно что-то пошло не так',
        alert: false
    }],
    ['Reject', {
        code: 4000,
        desc: 'Неуспешное выполнение операции',
        alert: true
    }],
    ['BrokenServer', {
        code: 5000,
        desc: 'Возникли проблемы с сервером',
        alert: false
    }]
])