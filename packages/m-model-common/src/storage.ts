import { IStoreInstances } from "m-model-core";

export const defaultSpecialActionKeyOfOtherTabsActions = "$$randomKey$$";
export const defaultSpecialItemNameOfOtherTabsActions = "$$lastAction$$";

export interface IStorage {
	getItem(key: string): null | string;
	setItem(key: string, value: string): void;
	removeItem(key: string): void;
}

export interface IStorageSettings {
	storage: IStorage;
	itemName: string;
	updateStorageAfterChange: boolean;
	spreadActionsToOtherTabs: boolean;
	specialActionKeyOfOtherTabsActions?: string;
	specialItemNameOfOtherTabsActions?: string;
}

export class FakeStorage implements IStorage {
	data: Record<any, any> = {};
	getItem = (key: string) => {
		if (this.data[key] !== undefined) {
			return JSON.stringify(this.data[key]);
		}
		return null;
	};
	removeItem = (key: string) => {
		delete this.data[key];
	};
	setItem = (key: string, value: string) => {
		this.data[key] = value;
	};
}

export function loadFromStorage<DOC extends {}>({
	storage,
	key,
	validateWholeData,
	filter,
}: {
	storage: IStorage;
	key: string;
	validateWholeData?: (items: IStoreInstances<DOC>) => IStoreInstances<DOC>;
	filter?: (data: NonNullable<IStoreInstances<DOC>[string]>) => boolean;
}): { data: IStoreInstances<DOC>; loadedAll: boolean } {
	const value = storage.getItem(key);
	if (value) {
		try {
			const items: IStoreInstances<DOC> = JSON.parse(value);
			const originalItemsNum = Object.keys(items).length;
			const validatedItems = (validateWholeData
				? validateWholeData(items)
				: items) as IStoreInstances<DOC>;
			const filteredItems: IStoreInstances<DOC> = filter
				? {}
				: validatedItems;
			if (filter) {
				const keys = Object.keys(validatedItems);
				for (const key of keys) {
					const instance = validatedItems[key]!;
					if (filter(instance)) {
						filteredItems[key] = instance;
					}
				}
			}
			storage.setItem(key, JSON.stringify(filteredItems));
			return {
				data: filteredItems,
				loadedAll:
					originalItemsNum === Object.keys(filteredItems).length,
			};
		} catch (e) {
			storage.removeItem(key);
			return { data: {}, loadedAll: false };
		}
	}
	return { data: {}, loadedAll: false };
}

export const filterByLoadTime = (
	maxTimeToPass: number,
	minLoadTime: -1 | number | Date = -1,
	leaveUnknownLoadTimes = false
) => {
	if (minLoadTime >= 0 && typeof minLoadTime !== "number") {
		minLoadTime = new Date(minLoadTime).getTime();
	}
	return (data: NonNullable<IStoreInstances<any>[string]>) => {
		if (!data.loadTime) return leaveUnknownLoadTimes;
		const loadTime = new Date(data.loadTime);
		if (minLoadTime !== -1) {
			if (minLoadTime > loadTime.getTime()) {
				return false;
			}
		}
		return Date.now() - loadTime.getTime() <= maxTimeToPass;
	};
};

const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
export function jsonDateParser(key: any, value: any) {
	if (typeof value === "string") {
		const a = reISO.exec(value);
		if (a) return new Date(value);
	}
	return value;
}
