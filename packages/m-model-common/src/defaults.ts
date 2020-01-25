import { IModel, RawInstances } from "m-model-core";
import { combineReducers } from "./combine-reducers";
import { IStorage, IStorageSettings } from "./storage";

export const getDefaultStorageSettings = (
	itemName: string,
	metaInformationName: string | null,
	storage: IStorage = localStorage
): IStorageSettings => ({
	itemName,
	metaInformationName,
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
	return combineReducers<IState, IActions>({
		storageSettings,
		reducers: [
			(state = {} as IState, action) => {
				try {
					const Model = getModel();
					return Model.reducer(state as any, action) as IState;
				} catch (e) {
					return state;
				}
			},
		],
	});
};
