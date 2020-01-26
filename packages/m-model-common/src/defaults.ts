import { IModel, RawInstances } from "m-model-core";
import { mergeReducersWithStorage } from "./merge-reducers";
import { IStorage, IStorageSettings } from "./storage";

export const getDefaultStorageSettings = (
	itemName: string,
	storage: IStorage = localStorage
): IStorageSettings => ({
	itemName,
	storage,
	updateStorageAfterChange: true,
	spreadActionsToOtherTabs: true,
});

export const getDefaultReducer = <
	ModelType extends IModel,
	IState extends RawInstances<any, any> = RawInstances<any, any>,
	IActions extends { type: string } = { type: string }
>(
	storageSettings: IStorageSettings,
	getModel: () => ModelType
) => {
	return mergeReducersWithStorage<IState, IActions>({
		storageSettings,
		reducers: [
			(state = {} as IState, action: IActions) => {
				try {
					const Model = getModel();
					let isExternalAction = false;
					if (
						storageSettings.specialActionKeyOfOtherTabsActions &&
						action[
							storageSettings.specialActionKeyOfOtherTabsActions
						]
					) {
						isExternalAction = true;
					}
					return Model.reducer(
						state as any,
						action,
						isExternalAction
					) as IState;
				} catch (e) {
					return state;
				}
			},
		],
	});
};
