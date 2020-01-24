import {
	defaultSpecialActionKeyOfOtherTabsActions,
	defaultSpecialItemNameOfOtherTabsActions,
} from "m-model-core";
import { IStorageSettings } from "./storage";

interface IReducersConfig<
	IState extends Record<string | number, {} | undefined>,
	IActions extends { type: string }
> {
	reducers: ((state: IState | undefined, action: IActions) => IState)[];
	cb?: (
		oldState: IState | undefined,
		newState: IState,
		action: IActions
	) => void;
	storageSettings: IStorageSettings | null;
	specialKeysForErasing?: string[];
}

export function combineReducers<
	IState extends Record<any, {} | undefined>,
	IActions extends { type: string }
>(config: IReducersConfig<IState, IActions>) {
	return function(state: IState = {} as IState, action: IActions): IState {
		let newState = state;
		if (
			config.specialKeysForErasing &&
			config.specialKeysForErasing.indexOf(action.type) > -1 &&
			Object.keys(state).length > 0
		) {
			newState = {} as IState;
		}
		for (const reducer of config.reducers) {
			newState = reducer(newState, action);
		}
		if (
			config.storageSettings &&
			(config.storageSettings.updateStorageAfterChange ||
				config.storageSettings.spreadActionsToOtherTabs)
		) {
			const specialItemNameOfOtherTabsActions =
				config.storageSettings.specialItemNameOfOtherTabsActions ||
				defaultSpecialItemNameOfOtherTabsActions;
			const specialActionKeyOfOtherTabsActions =
				config.storageSettings.specialActionKeyOfOtherTabsActions ||
				defaultSpecialActionKeyOfOtherTabsActions;
			if (
				newState !== state &&
				typeof (action as any)[specialActionKeyOfOtherTabsActions] ===
					"undefined"
			) {
				const { storage } = config.storageSettings;
				if (config.storageSettings.updateStorageAfterChange) {
					storage.setItem(
						config.storageSettings.itemName,
						JSON.stringify(newState)
					);
				}
				if (config.storageSettings.spreadActionsToOtherTabs) {
					storage.setItem(
						specialItemNameOfOtherTabsActions,
						JSON.stringify({
							...action,
							[specialActionKeyOfOtherTabsActions]: Math.random(),
						})
					);
				}
			}
		}
		if (config.cb) {
			config.cb(state, newState, action);
		}
		return newState;
	};
}
