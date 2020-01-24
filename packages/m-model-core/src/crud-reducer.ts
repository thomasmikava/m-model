import {
	ICRUDActionObjs,
	ICRUDActionTypes,
	IDeleteOneAction,
	IDocument,
	ILoadManyAction,
	ILoadOneAction,
	IUpdateOneAction,
	IDeleteManyAction,
	IUpdateManyAction,
} from "./crud-actions";

function createCRUDReducer<
	IdKey extends string,
	IdType extends string | number,
	DOC extends IDocument<IdKey, IdType>,
	IState extends Record<
		string | number,
		{ info: DOC; loadTime?: Date } | undefined
	>
>(actionTypes: ICRUDActionTypes, keyOfId: IdKey) {
	return function getNewState(
		state: IState = {} as any,
		origianalAction: ICRUDActionObjs<IdKey, IdType, DOC>
	) {
		if (origianalAction.type === actionTypes.updateOne) {
			const action = origianalAction as IUpdateOneAction<
				IdKey,
				IdType,
				DOC,
				string
			>;
			if (state[action.info[keyOfId as any]]) {
				return {
					...state,
					[action.info[keyOfId as any]]: {
						...state[action.info[keyOfId as any]]!,
						...action.extra,
						info: {
							...state[action.info[keyOfId as any]]!.info,
							...action.info,
						},
					},
				};
			}
		} else if (origianalAction.type === actionTypes.updateMany) {
			const action = origianalAction as IUpdateManyAction<
				IdKey,
				IdType,
				DOC,
				string
			>;
			const newState1 = {
				...state,
			};
			action.infos.forEach((c, i) => {
				if (!newState1[c[keyOfId as any]]) return;
				newState1[c[keyOfId as any]] = {
					...newState1[c[keyOfId as any]]!,
					...(action.extras && action.extras[i]),
					info: { ...newState1[c[keyOfId as any]]!.info, ...c },
				};
			});
			return newState1;
		} else if (origianalAction.type === actionTypes.loadOne) {
			const action = origianalAction as ILoadOneAction<
				IdKey,
				IdType,
				DOC,
				string
			>;
			return {
				...state,
				[action.info[keyOfId as any]]: {
					...state[action.info[keyOfId as any]],
					loadTime: action.loadTime,
					...action.extra,
					info: action.info,
				},
			};
		} else if (origianalAction.type === actionTypes.loadMany) {
			const action = origianalAction as ILoadManyAction<
				IdKey,
				IdType,
				DOC,
				string
			>;
			const newState1 = action.clearOthers
				? {}
				: {
						...state,
				  };
			action.infos.forEach((c, i) => {
				newState1[c[keyOfId as any]] = {
					loadTime: action.loadTime,
					...(action.extras && action.extras[i]),
					info: c,
				};
			});
			return newState1;
		} else if (origianalAction.type === actionTypes.deleteOne) {
			const action = origianalAction as IDeleteOneAction<
				IdKey,
				IdType,
				string
			>;
			const newState = { ...state };
			delete newState[action[keyOfId as any]];
			return newState;
		} else if (origianalAction.type === actionTypes.deleteMany) {
			const action = origianalAction as IDeleteManyAction<IdType, string>;
			const newState = { ...state };
			for (const id of action.ids) {
				delete newState[id];
			}
			return newState;
		} else if (origianalAction.type === actionTypes.clearAll) {
			return {};
		}
		return state;
	};
}

export default createCRUDReducer;
