import { IStoreInstances } from "./main-types";

export const rawInstancesToArray = <DOC>(
	instances: IStoreInstances<DOC>
): DOC[] => {
	const arr: DOC[] = [];
	for (const key in instances) {
		arr.push(instances[key]!.info);
	}
	return arr;
};

export const defaultSpecialActionKeyOfOtherTabsActions = "randomKey";
export const defaultSpecialItemNameOfOtherTabsActions = "lastAction";
