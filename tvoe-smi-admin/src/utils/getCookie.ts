export const getCookie = (name: string, cookie: string | undefined) => {
	const matches = cookie?.match(
		new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')
	)
	return matches ? decodeURIComponent(matches[1]) : undefined
}