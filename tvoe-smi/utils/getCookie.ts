/**
 * Метод для получения токена из куки
 * 
 * @param name - ключ по которому лежит токен
 * @param cookie - куки запроса
 * @returns - возвращает токен
 */
export const getCookie = (name: string, cookie: string | undefined) => {
	const matches = cookie?.match(
		new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')
	)
	return matches ? decodeURIComponent(matches[1]) : undefined
}