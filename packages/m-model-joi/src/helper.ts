export function getJoiObjectKeys<T extends {}>(schema: any): (keyof T)[] {
	if (
		typeof schema.$_terms === "object" &&
		typeof schema.$_terms.keys === "object"
	) {
		return schema.$_terms.keys.map(e => e.key); // for Joi >= 16
	}
	return (schema as any)._inner.children.map(e => e.key); // For Joi <= 15
}
