import { bookmarkModel, IBookmark } from '../models/bookmark.entity'
import { IUser, userModel } from '../models/user.entity'
import { userCategoryModel } from '../models/userCategory.entity'
import { serviceResponse } from '../utils/serviceResponse'
import { CategoryService } from './category.service'
import { UserCategoryService } from './userCategory.service'
import { ICategory } from '../models/category.entity'
import { AuthType } from '../models/authLog.entity'
import { ImageService } from './image.service'
import { postModel } from '../models/post.entity'
import { ResponseStatuses } from '../consts/ResponseStatuses'

interface CreateUserDto {
    phone: string
}

interface UpdateUserDto {
    userData: IUser,
    categories: ICategory[]
}

export const UserService = {
    /**
     * Получение данных пользователя
     * 
     * @param id - id пользователя
     * @returns возвращает данные пользователя или ошибку
     */
    async getUser(id: string) {
        try {
            const [user, { response, err }] = await Promise.all([userModel.findById(id).lean(), UserCategoryService.getUserCategories(id)])

            if(err) {
                return serviceResponse({ user }, err)
            }
            return serviceResponse({ user, categories: response }, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    /**
     * Метод для удаления аккаунта
     * 
     * @param id  - id пользователя
     * @returns Возвращает статус выполнения операции
     */
    async deleteAccount(id: string) {
        try {
            await userModel.findByIdAndUpdate(id, {
                $set: {
                    isDeleted: true
                }
            }, { new: true })

            return serviceResponse(ResponseStatuses.get('Success'), null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    /**
     * Метод для создания пользователя
     * 
     * @param data - Данные для создания пользователя
     * @returns Возвращает данные полученного или созданного пользователя
     */
    async createUser(data: CreateUserDto) {
        try {
            const condidate = await userModel.findOne({ phone: data.phone })

            if(condidate) {
                const { response, err } = await UserCategoryService.getUserCategories(condidate._id.toString())
                if(err) {
                    return serviceResponse(null, ResponseStatuses.get('Reject'))
                }

                return serviceResponse({ user: condidate, categories: response, logType: AuthType.SIGNIN }, null)
            }
            const user = await userModel.create(data)
            const { response, err } = await CategoryService.getCategoriesId()
            if(err) {
                return serviceResponse(null, ResponseStatuses.get('Reject'))
            }

            const categories = await userCategoryModel.create({ user: user._id, categories: response })

            return serviceResponse({ user, categories, logType: AuthType.SIGNUP }, null)
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    /**
     * 
     * @param id - id пользователя
     * @param data - новые данные
     * @param file - новая аватарка пользователя
     * @returns Возвращает обнавленные данные пользователя или ошибку
     */
    async updateUser(id: string, data: UpdateUserDto, file: Express.Multer.File | null = null) {
        const errors = []

        try {
            const user = await userModel.findByIdAndUpdate(id, {
                ...data.userData
            }, { new: true })

            if(!user) {
                return serviceResponse(null, { msg: 'user not found' })
            }

            if(file) {
                if(user?.avatar) {
                    const { err } = await ImageService.update(file, 320, 480, user.avatar)
                    if(err) {
                        errors.push(err)
                    }
                } else {
                    const { response } = await ImageService.upload(file, 320, 320, 'jpg', 'cover', 'AVATAR')
                    user.avatar = response
                    await user.save()
                }
            }

            if(data.categories) {
                const categories = await userCategoryModel.findOne({ user: id })
                if(categories) {
                    categories.categories = data.categories
                    await categories.save()

                    return serviceResponse({ user, categories: categories?.categories }, errors.length > 0 ? errors : null)
                }
            }

            return serviceResponse({ user }, errors.length > 0 ? errors : null)
            
        } catch (error) {
            console.log(error)
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    /**
     * 
     * @param data - данные для добавление в заметки пользователя
     * @returns 
     */
    async addBookmark(data: IBookmark) {
        try {
            const isAddedBookmark = await bookmarkModel.findOne({ user: data.user, post: data.post, isDeleted: false })
            if(isAddedBookmark) {
                return serviceResponse({ msg: 'Пост уже добавлен' }, null)
            }

            const deletedBookmark = await bookmarkModel.findOne({ user: data.user, post: data.post, isDeleted: true })
            if(deletedBookmark) {
                deletedBookmark.isDeleted = false
                const bookmark = deletedBookmark.save()
                const updateInBookmarkPromise = postModel.findByIdAndUpdate(data.post, {
                    $inc: {
                        inBookmark: 1
                    }
                })

                await Promise.all([bookmark, updateInBookmarkPromise])

                return serviceResponse(deletedBookmark, null)
            }

            const userBookmarkPromise = bookmarkModel.create(data)
            const updateInBookmarkPromise = postModel.findByIdAndUpdate(data.post, {
                $inc: {
                    inBookmark: 1
                }
            })
            
            const [ userBookmark, ..._ ] = await Promise.all([userBookmarkPromise, updateInBookmarkPromise])

            return serviceResponse(userBookmark, null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    async getIsBookmarkPosts(id: string) {
        try {
            const userBookmarks = await bookmarkModel.find({ user: id, isDeleted: false, inArchive: false })
                .populate({ path: 'post', populate: { path: 'tag category', select: ['title', 'title'] } })
            return serviceResponse(userBookmarks, null)
        } catch (error) {
            console.log()
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },

    async changeNumber(id: string, phone: string) {
        try {
            await userModel.findByIdAndUpdate(id, {
                $set: {
                    phone
                }
            })
            return serviceResponse(ResponseStatuses.get('Success'), null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    },


    async deleteBookmark(userId: string, postId: string) {
        try {
            const bookmark = await bookmarkModel.findOneAndUpdate({ user: userId, post: postId, isDeleted: false }, {
                $set: {
                    isDeleted: true
                }
            })

            if(!bookmark) {
                return serviceResponse(null, ResponseStatuses.get('Warning'))
            }

            if(!bookmark?.isDeleted) {
                await postModel.findByIdAndUpdate(bookmark?.post, {
                    $inc: {
                        inBookmark: -1
                    }
                })
            }

            return serviceResponse(ResponseStatuses.get('Success'), null)
        } catch (error) {
            return serviceResponse(null, ResponseStatuses.get('Reject'))
        }
    }
}