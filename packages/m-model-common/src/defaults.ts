import { ICRUDActionTypes, IModel, RawInstances } from "m-model-core";
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

export const getDefaultCRUDActionTypes = (
	singularName: string,
	pluralName?: string
): ICRUDActionTypes => {
	if (!pluralName) {
		pluralName = singularName + "S";
	}
	return {
		updateOne: `UPDATE_${singularName}`,
		updateMany: `UPDATE_MANY_${pluralName}`,
		loadOne: `LOAD_${singularName}`,
		loadMany: `LOAD_MANY_${pluralName}`,
		deleteOne: `DELETE_${singularName}`,
		deleteMany: `DELETE_MANY_${pluralName}`,
		clearAll: `CLEAR_${pluralName}`,
	};
};

export const getDefaultReducer = <
	ModelType extends IModel,
	IState extends RawInstances<any, any, any> = RawInstances<any, any, any>,
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
