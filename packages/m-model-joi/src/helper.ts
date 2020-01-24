export function getJoiObjectKeys<T extends {}>(schema: any): (keyof T)[] {
	return Object.keys(schema.describe().children) as any[];
}
