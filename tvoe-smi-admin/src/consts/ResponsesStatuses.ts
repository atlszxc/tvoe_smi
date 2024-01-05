export enum ResponseStatusKeys {
    SUCCESS = 'Success',
    WARNING = 'Warning',
    REJECT = 'Reject',
    BROKEN_SERVER = 'BrokenServer',
}

export interface IResponseStatus {
    code: number,
    desc: string,
    alert: boolean,
}

/**
 * Мапа для возможных вариантов ответа
 */
export const ResponseStatuses = new Map<ResponseStatusKeys, IResponseStatus>([
    [ResponseStatusKeys.SUCCESS, {
        code: 2000,
        desc: 'Успешное выполнение операции',
        alert: true
    }],
    [ResponseStatusKeys.WARNING, {
        code: 3000,
        desc: 'Возможно что-то пошло не так',
        alert: false
    }],
    [ResponseStatusKeys.REJECT, {
        code: 4000,
        desc: 'Неуспешное выполнение операции',
        alert: true
    }],
    [ResponseStatusKeys.BROKEN_SERVER, {
        code: 5000,
        desc: 'Возникли проблемы с сервером',
        alert: false
    }]
])