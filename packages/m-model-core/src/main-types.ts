import { IDocument, ICRUDActionTypes } from "./crud-actions";
import { GetKeysOfType } from "./generics";

export type IStoreDocInstance<T, O extends {} = {}> = {
	info: T;
	loadTime?: Date;
} & O;
export interface IStoreInstances<T, O extends {} = {}> {
	[instanceId: string]: IStoreDocInstance<T, O> | undefined;
}
export interface Unsubscribe {
	(): void;
}

export interface Action<T = any> {
	type: T;
}
export interface AnyAction<T = any> extends Action<T> {
	[extraProps: string]: any;
}
export interface Dispatch<A extends Action = AnyAction> {
	<T extends A>(action: T): T;
}

export type RawInstances<
	IdKey extends string,
	IdType extends string | number,
	DOC extends IDocument<IdKey, IdType>
> = Record<any, IStoreDocInstance<DOC> | undefined>;

export interface IModelConfig<
	IdKey extends string,
	IdType extends string | number,
	DOC extends IDocument<IdKey, IdType>,
	CRUDActions extends ICRUDActionTypes
> {
	keyOfId: IdKey;
	getInstances: () => RawInstances<IdKey, IdType, DOC> | undefined;
	dispatch: Dispatch<AnyAction>;
	subscribe: (listener: () => void) => Unsubscribe;
	loadInstancesFromStorage: () => {
		data: IStoreInstances<DOC>;
		loadedAll: boolean;
	};
	syncronousCRUDActionTypes: CRUDActions;
	dockeys: (keyof DOC)[];
	indices?: readonly {
		fields: (keyof DOC)[];
		unique?: boolean;
	}[];
	storageSettings: {
		spreadActionsToOtherTabs?: boolean;
		specialActionKeyOfOtherTabsActions?: string;
	};
	timestamps?: {
		createdAt?: GetKeysOfType<DOC, Date>;
		updatedAt?: GetKeysOfType<DOC, Date>;
	};
}

const initialDoc = Symbol("initial");
const isDeleted = Symbol("isDeleted");
const IdKey = Symbol("IdKey");
const IdType = Symbol("IdType");
const DocType = Symbol("DocType");

export const modelSymbols = {
	initialDoc,
	isDeleted,
	IdKey,
	IdType,
	DocType,
} as const;
