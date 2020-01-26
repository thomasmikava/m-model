import { OptionalKeysOtherThan, IAnyObj } from "./generics";

export type IDocument<IdKey extends string> = Record<IdKey, any>;
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
	DOC extends IDocument<IdKey>,
	Type extends string
> {
	type: Type;
	info: OptionalKeysOtherThan<DOC, IdKey>;
	extra?: IAnyObj;
}

export interface IUpdateManyAction<
	IdKey extends string,
	DOC extends IDocument<IdKey>,
	Type extends string
> {
	type: Type;
	infos: OptionalKeysOtherThan<DOC, IdKey>[];
	extras?: IAnyObj[];
}

export interface ILoadOneAction<
	IdKey extends string,
	DOC extends IDocument<IdKey>,
	Type extends string
> {
	type: Type;
	info: DOC;
	loadTime: Date;
	extra?: IAnyObj;
}

export interface ILoadManyAction<
	IdKey extends string,
	DOC extends IDocument<IdKey>,
	Type extends string
> {
	type: Type;
	infos: DOC[];
	loadTime: Date;
	extras?: IAnyObj[];
	clearOthers?: null | "replaceAll" | DOC[IdKey][];
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
	DOC extends IDocument<IdKey>,
	TYPES extends ICRUDActionTypes = ICRUDActionTypes
> =
	| IUpdateOneAction<IdKey, DOC, TYPES["updateOne"]>
	| ILoadManyAction<IdKey, DOC, TYPES["updateMany"]>
	| ILoadOneAction<IdKey, DOC, TYPES["loadOne"]>
	| ILoadManyAction<IdKey, DOC, TYPES["loadMany"]>
	| IDeleteOneAction<IdKey, DOC[IdKey], TYPES["deleteOne"]>
	| IDeleteManyAction<DOC[IdKey], TYPES["deleteMany"]>
	| IClearAllAction<TYPES["clearAll"]>;

export function createCRUDActions<
	IdKey extends string,
	DOC extends IDocument<IdKey>,
	Types extends ICRUDActionTypes
>(actionTypes: Types, keyOfId: IdKey): ICRUDSyncActions<IdKey, DOC, Types> {
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
			clearOthers?: null | "replaceAll" | DOC[IdKey][],
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
			} as IDeleteOneAction<IdKey, DOC[IdKey], Types["deleteOne"]>),
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
	DOC extends IDocument<IdKey>,
	Types extends ICRUDActionTypes
> {
	updateOne: (
		info: IUpdateOneAction<IdKey, DOC, Types["updateOne"]>["info"],
		extra?: IAnyObj
	) => IUpdateOneAction<IdKey, DOC, Types["updateOne"]>;
	updateMany: (
		docs: IUpdateManyAction<IdKey, DOC, Types["updateMany"]>["infos"],
		extras?: IAnyObj[]
	) => IUpdateManyAction<IdKey, DOC, Types["updateMany"]>;
	loadOne: (
		info: DOC,
		loadTime?: Date,
		extra?: IAnyObj
	) => ILoadOneAction<IdKey, DOC, Types["loadOne"]>;
	loadMany: (
		infos: DOC[],
		clearOthers?: null | "replaceAll" | DOC[IdKey][],
		loadTime?: Date,
		extras?: IAnyObj[]
	) => ILoadManyAction<IdKey, DOC, Types["loadMany"]>;
	deleteOne: (
		id: DOC[IdKey]
	) => IDeleteOneAction<IdKey, DOC[IdKey], Types["deleteOne"]>;
	deleteMany: (
		ids: DOC[IdKey][]
	) => IDeleteManyAction<DOC[IdKey], Types["deleteMany"]>;
	clearAll: () => IClearAllAction<Types["clearAll"]>;
}

export default createCRUDActions;

export const createCRUDActionTypes = (
	singularName: string,
	pluralName?: string
): ICRUDActionTypes => {
	singularName = singularName.toUpperCase();
	if (!pluralName) {
		pluralName = getPluralName(singularName);
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

const getPluralName = (singular: string) => {
	if (singular.length === 0) return "S";
	if (singular[singular.length - 1] === "Y") {
		if (singular.length >= 2 && isVowel(singular[singular.length - 2])) {
			return singular + "S";
		}
		return singular.substr(0, singular.length - 1) + "IES";
	}
	const lastLetter = singular[singular.length - 1];
	const last2Letters = singular.substr(singular.length - 2);
	if (
		lastLetter === "S" ||
		lastLetter === "Z" ||
		lastLetter === "X" ||
		last2Letters === "SS" ||
		last2Letters === "SH" ||
		last2Letters === "CH"
	) {
		return singular + "ES";
	}
	return singular + "S";
};

const isVowel = (letter: string) => {
	return (
		letter === "A" ||
		letter === "E" ||
		letter === "I" ||
		letter === "O" ||
		letter === "U"
	);
};
