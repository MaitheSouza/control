export const formToObject = <T>(form: any): T => {
	const body: any = {};
	const fields: HTMLInputElement[] = form.querySelectorAll(
		'input, select, textarea'
	);
	fields.forEach((field) => {
		body[field.name] = field.value;
	});
	return body;
};
