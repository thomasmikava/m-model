import { IStoreInstances } from "./main-types";

export const rawInstancesToArray = <DOC>(
	instances: IStoreInstances<DOC>
): DOC[] => {
	const arr: DOC[] = [];
	const keys = Object.keys(instances);
	for (const key of keys) {
		if (instances[key]!.info) {
			arr.push(instances[key]!.info);
		}
	}
	return arr;
};
