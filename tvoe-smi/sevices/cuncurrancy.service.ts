import axios from "axios"
import { serviceResponse } from "../utils/serviceResponse"

export const CuncurrancyService = {
    async getCuncurancy() {
        try {
            const [{ data }, {data: BTC}] = await Promise.all([axios.get('https://www.cbr-xml-daily.ru/daily_json.js'), axios.get('https://api.coinlore.net/api/ticker/?id=90')])

            const res = [data.Valute['USD'], data.Valute['EUR'], BTC[0]]
            return serviceResponse(res, null)
        } catch (error) {
            return serviceResponse(null, error)
        }

    }
}