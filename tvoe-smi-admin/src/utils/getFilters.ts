import {SortOrder} from "mongoose";

interface ICustomObject {
    [key: string] : SortOrder
}

export const getDateFilter = (start: string, finish: string) => ({ updatedAt: { $gt: start, $lte: finish} })
export const getCategoryFilter = (categories: string[]) => ({ category: { $in: categories } })

export const getSortFilter = (field: string, sort: SortOrder) => {
    const res: ICustomObject = {}
    res[`${field}`] = sort
    return res
}
