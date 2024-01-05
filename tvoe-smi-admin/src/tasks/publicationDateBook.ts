import {adminPostModel, PostStatuses} from "../models/adminModels/post.entity";
import {PostService} from "../services/post.service";

export const publicationDateBook = async () => {
    const start = new Date()
    const finish = new Date(start.getMilliseconds() - 1000 * 60 * 30)

    try {
        const posts = await adminPostModel.find(
            {
                publicationDateBook: { $gte: finish, $lte: start },
                status: PostStatuses.PUBLICATION_DATE_BOOK,
            },
            { _id: true }
        ).lean()

        for (const post of posts) {
            const { err } = await PostService.changeStatusToPublished(post._id.toString())
            if (err) {
                console.log(err)
            }
        }
    } catch (error) {
        console.log(error)
    }
}