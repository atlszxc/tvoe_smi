import 'dotenv/config'
export const getConfigureBuildProject = () => {
    const accessURLsString = process.env.ACCESS_URLS

    const accessUrls = accessURLsString?.split(' ')
    const domain = process.env.DOMAIN

    return {
        accessUrls,
        domain
    }
}