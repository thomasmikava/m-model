import { OptionalKeysOtherThan, IAnyObj } from "./generics";

export interface ICRUDActionTypes {
	updateOne: string;
	updateMany: string;
	loadOne: string;
	loadMany: string;
	deleteOne: string;
	deleteMany: string;
	clearAll: string;
}

export interface IUpdateOneAction<
	IdKey extends string,
	IdType extends string | number,
	T extends IDocument<IdKey, IdType>,
	Type extends string
> {
	type: Type;
	info: OptionalKeysOtherThan<T, IdKey>;
	extra?: IAnyObj;
}

export interface IUpdateManyAction<
	IdKey extends string,
	IdType extends string | number,
	T extends IDocument<IdKey, IdType>,
	Type extends string
> {
	type: Type;
	infos: OptionalKeysOtherThan<T, IdKey>[];
	extras?: IAnyObj[];
}

export interface ILoadOneAction<
	IdKey extends string,
	IdType extends string | number,
	T extends IDocument<IdKey, IdType>,
	Type extends string
> {
	type: Type;
	info: T;
	loadTime: Date;
	extra?: IAnyObj;
}

export interface ILoadManyAction<
	IdKey extends string,
	IdType extends string | number,
	T extends IDocument<IdKey, IdType>,
	Type extends string
> {
	type: Type;
	infos: T[];
	loadTime: Date;
	extras?: IAnyObj[];
	clearOthers?: boolean;
}

export type IDeleteOneAction<
	IdKey extends string,
	IdType extends string | number,
	Type extends string
> = {
	type: Type;
} & Record<IdKey, IdType>;

export interface IDeleteManyAction<
	IdType extends string | number,
	Type extends string
> {
	type: Type;
	ids: IdType[];
}

export interface IClearAllAction<Type extends string> {
	type: Type;
}

export type ICRUDActionObjs<
	IdKey extends string,
	IdType extends string | number,
	T extends IDocument<IdKey, IdType>,
	TYPES extends ICRUDActionTypes = ICRUDActionTypes
> =
	| IUpdateOneAction<IdKey, IdType, T, TYPES["updateOne"]>
	| ILoadManyAction<IdKey, IdType, T, TYPES["updateMany"]>
	| ILoadOneAction<IdKey, IdType, T, TYPES["loadOne"]>
	| ILoadManyAction<IdKey, IdType, T, TYPES["loadMany"]>
	| IDeleteOneAction<IdKey, IdType, TYPES["deleteOne"]>
	| IDeleteManyAction<IdType, TYPES["deleteMany"]>
	| IClearAllAction<TYPES["clearAll"]>;

export type IDocument<
	IdKey extends string,
	IdType extends string | number
> = Record<IdKey, IdType>;

export function createCRUDActions<
	IdKey extends string,
	IdType extends string | number,
	DOC extends IDocument<IdKey, IdType>,
	Types extends ICRUDActionTypes
>(
	actionTypes: Types,
	keyOfId: IdKey
): ICRUDSyncActions<IdKey, IdType, DOC, Types> {
	return {
		updateOne: (info, extra?: IAnyObj) => ({
			type: actionTypes.updateOne,
			info,
			extra,
		}),
		updateMany: (
			docs,
			extras?: IUpdateManyAction<
				IdKey,
				IdType,
				DOC,
				Types["updateMany"]
			>["extras"]
		) => ({
			type: actionTypes.updateOne,
			infos: docs,
			extras,
		}),
		loadOne: (info, loadTime: Date = new Date(), extra?: IAnyObj) => ({
			type: actionTypes.loadOne,
			info,
			loadTime,
			extra,
		}),
		loadMany: (
			infos,
			clearOthers?: boolean,
			loadTime: Date = new Date(),
			extras?: IAnyObj[]
		) => ({
			type: actionTypes.loadMany,
			infos,
			clearOthers,
			loadTime,
			extras,
		}),
		deleteOne: id =>
			({
				type: actionTypes.deleteOne,
				[keyOfId]: id,
			} as IDeleteOneAction<IdKey, IdType, Types["deleteOne"]>),
		deleteMany: ids => ({
			type: actionTypes.deleteMany,
			ids,
		}),
		clearAll: () => ({
			type: actionTypes.clearAll,
		}),
	};
}

export interface ICRUDSyncActions<
	IdKey extends string,
	IdType extends string | number,
	DOC extends IDocument<IdKey, IdType>,
	Types extends ICRUDActionTypes
> {
	updateOne: (
		info: IUpdateOneAction<IdKey, IdType, DOC, Types["updateOne"]>["info"],
		extra?: IAnyObj
	) => IUpdateOneAction<IdKey, IdType, DOC, Types["updateOne"]>;
	updateMany: (
		docs: IUpdateManyAction<
			IdKey,
			IdType,
			DOC,
			Types["updateMany"]
		>["infos"],
		extras?: IAnyObj[]
	) => IUpdateManyAction<IdKey, IdType, DOC, Types["updateMany"]>;
	loadOne: (
		info: DOC,
		loadTime?: Date,
		extra?: IAnyObj
	) => ILoadOneAction<IdKey, IdType, DOC, Types["loadOne"]>;
	loadMany: (
		infos: DOC[],
		clearOthers?: boolean,
		loadTime?: Date,
		extras?: IAnyObj[]
	) => ILoadManyAction<IdKey, IdType, DOC, Types["loadMany"]>;
	deleteOne: (
		id: IdType
	) => IDeleteOneAction<IdKey, IdType, Types["deleteOne"]>;
	deleteMany: (
		ids: IdType[]
	) => IDeleteManyAction<IdType, Types["deleteMany"]>;
	clearAll: () => IClearAllAction<Types["clearAll"]>;
}

export default createCRUDActions;
