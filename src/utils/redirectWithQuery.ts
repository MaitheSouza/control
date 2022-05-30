export const redirectWithQuery = (body: Record<string, any>) => {
	const query: string[] = [];
	Object.entries(body).forEach(([key, value]) => {
		query.push(key + '=' + encodeURI(value));
	});
	return query.join('&');
};
