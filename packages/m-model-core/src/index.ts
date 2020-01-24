import { createModel } from "./model";
import createCRUDActions, {
	ICRUDActionTypes,
	ICRUDActionObjs,
	ICRUDSyncActions,
	IDocument,
} from "./crud-actions";
import createCRUDReducer from "./crud-reducer";
import {
	IStoreDocInstance,
	RawInstances,
	IModelConfig,
	modelSymbols,
	IStoreInstances,
} from "./main-types";
import {
	ModelInstance,
	ModelClass,
	QueryOptions,
	IModel,
	Query,
	ModelIdType,
	ModelIdKey,
	ModelDocType,
} from "./model-types";
import {
	rawInstancesToArray,
	defaultSpecialActionKeyOfOtherTabsActions,
	defaultSpecialItemNameOfOtherTabsActions,
} from "./storage";

export {
	createModel,
	ICRUDActionTypes,
	ICRUDActionObjs,
	createCRUDActions,
	ICRUDSyncActions,
	createCRUDReducer,
	IStoreDocInstance,
	RawInstances,
	IModelConfig,
	modelSymbols,
	ModelInstance,
	ModelClass,
	IDocument,
	Query,
	ModelIdType,
	ModelIdKey,
	ModelDocType,
	QueryOptions,
	rawInstancesToArray,
	IStoreInstances,
	IModel,
	defaultSpecialActionKeyOfOtherTabsActions,
	defaultSpecialItemNameOfOtherTabsActions,
};
