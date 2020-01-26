import { IDocument, ICRUDActionTypes, ICRUDSyncActions } from "./crud-actions";
import {
	IStoreDocInstance,
	IStoreInstances,
	AnyAction,
	IModelConfig,
	RawInstances,
	modelSymbols,
} from "./main-types";
import { OptionalKeys, IAnyObj } from "./generics";

export type ModelInstance<DOC extends {}> = ModelInstanceWithoutDoc<DOC> & DOC;

type empty = null;

export type ModelInstanceWithoutDoc<DOC extends {}> = {
	[modelSymbols.initialDoc]: Partial<DOC>;
	[modelSymbols.isDeleted]: boolean;
	saveSync(): void;
	toObject(): DOC;
	getLoadTime(): Date | undefined;
	getFullDoc(): IStoreDocInstance<DOC> | empty;
};

interface ModelClassGeneral<
	IdKey extends string,
	DOC extends IDocument<IdKey>,
	CRUDActions extends ICRUDActionTypes = ICRUDActionTypes
> {
	[modelSymbols.IdKey]: IdKey;
	[modelSymbols.IdType]: DOC[IdKey];
	[modelSymbols.DocType]: DOC;

	initialize(): {
		data: IStoreInstances<DOC, {}>;
		loadedAll: boolean;
	};

	/* protected  */ dispatch: IModelConfig<
		IdKey,
		DOC,
		CRUDActions
	>["dispatch"];
	/* protected  */ subscribeStoreChange: IModelConfig<
		IdKey,
		DOC,
		CRUDActions
	>["subscribe"];
	/* protected  */ syncronousCrudActions: ICRUDSyncActions<
		IdKey,
		DOC,
		CRUDActions
	>;
	/* protected  */ dockeys: (keyof DOC)[];

	findByIdSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		id: DOC[IdKey],
		raw?: null
	): T | empty;
	findByIdSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		id: DOC[IdKey],
		raw: "raw"
	): DOC | empty;

	findManyByIdsSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		ids: DOC[IdKey][],
		raw?: null
	): T[];
	findManyByIdsSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		ids: DOC[IdKey][],
		raw: "raw"
	): DOC[];

	findOneSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		query: Query<DOC>,
		options?: QueryOptions<DOC>
	): T | empty;

	deleteOneSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		query: Query<DOC>
	);

	findManySync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		query: Query<DOC>,
		options?: QueryOptions<DOC>
	): T[];

	updateManySync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		query: Query<DOC>,
		newDoc: Partial<DOC>,
		raw?: null
	): T[];
	updateManySync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		query: Query<DOC>,
		newDoc: Partial<DOC>,
		raw: "raw"
	): DOC[];

	updateOneSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		query: Query<DOC>,
		newDoc: Partial<DOC>,
		raw?: null
	): T | null;
	updateOneSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		query: Query<DOC>,
		newDoc: Partial<DOC>,
		raw: "raw"
	): DOC | null;

	deleteManyByIdsSync<T extends ModelInstance<DOC>>(
		ids: DOC[IdKey][],
		dispatchAction?: boolean
	);

	deleteManySync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		query: Query<DOC>,
		options?: QueryOptions<DOC>
	);

	getStoreRawInstancesObj<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>
	): RawInstances<IdKey, DOC>;

	getRawInstancesObj<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>
	): Record<DOC[IdKey], DOC | undefined>;

	getAllSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		raw?: null
	): T[];
	getAllSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		raw: "raw"
	): DOC[];

	subscribeChangeById<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		id: DOC[IdKey],
		cb: (currentDoc: T | empty) => void
	);

	subscribeOneDocChangeByQuery<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		query: Query<DOC>,
		options: QueryOptions<DOC> | undefined | null,
		cb: (currentDoc: T | empty) => void
	): () => void;

	subscribeManyDocsChangeByQuery<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		query: Query<DOC>,
		options: QueryOptions<DOC> | undefined | null,
		cb: (currentDoc: T[]) => void
	): () => void;

	subscribeManyDocsChangeByIds<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		ids: DOC[IdKey][],
		raw: null | undefined,
		cb: (currentDoc: T[]) => void
	): () => void;
	subscribeManyDocsChangeByIds<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		ids: DOC[IdKey][],
		raw: "raw",
		cb: (currentDoc: DOC[]) => void
	): () => void;

	subscribeChange(cb: () => void): () => void;

	clearAllSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		dispatchAction?: boolean
	);

	deleteByIdSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		id: DOC[IdKey],
		dispatchAction?: boolean,
		instances?: RawInstances<IdKey, DOC>
	);

	loadOneSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		doc: DOC,
		loadTime?: Date,
		extra?: IAnyObj,
		raw?: null,
		dispatchAction?: boolean,
		instances?: RawInstances<IdKey, DOC>
	): T;
	loadOneSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		doc: DOC,
		loadTime: Date | undefined,
		extra: IAnyObj | undefined,
		raw: "raw",
		dispatchAction?: boolean,
		instances?: RawInstances<IdKey, DOC>
	): DOC;

	loadManySync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		docs: DOC[],
		clearOthers?: null | "replaceAll" | Query<DOC> | DOC[IdKey][],
		loadTime?: Date,
		extras?: IAnyObj[],
		raw?: null,
		dispatchAction?: boolean,
		instances?: RawInstances<IdKey, DOC>
	): T[];
	loadManySync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		docs: DOC[],
		clearOthers:
			| null
			| "replaceAll"
			| Query<DOC>
			| DOC[IdKey][]
			| undefined,
		loadTime: Date | undefined,
		extras: IAnyObj[] | undefined,
		raw: "raw",
		dispatchAction?: boolean,
		instances?: RawInstances<IdKey, DOC>
	): DOC[];

	loadManyFromStorageSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		obj: IStoreInstances<DOC>
	): void;

	reducer<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, DOC, CRUDActions, T>,
		state: IStoreInstances<DOC> | undefined,
		action: AnyAction,
		isExternalAction?: boolean
	): IStoreInstances<DOC>;
}

export interface ModelClass<
	IdKey extends string,
	DOC extends IDocument<IdKey>,
	CRUDActions extends ICRUDActionTypes = ICRUDActionTypes
> extends ModelClassGeneral<IdKey, DOC, CRUDActions> {
	new (doc: OptionalKeys<DOC, IdKey>): ModelInstance<DOC>;
}

export interface ModelClassWithoutDoc<
	IdKey extends string,
	DOC extends IDocument<IdKey>,
	CRUDActions extends ICRUDActionTypes = ICRUDActionTypes
> extends ModelClassGeneral<IdKey, DOC, CRUDActions> {
	new (doc: OptionalKeys<DOC, IdKey>): ModelInstanceWithoutDoc<DOC>;
}

export type IModel = ModelClass<any, any, any>;

export type ModelIdType<
	ModelType extends IModel
> = ModelType[typeof modelSymbols["IdType"]];
export type ModelIdKey<
	ModelType extends IModel
> = ModelType[typeof modelSymbols["IdKey"]];
export type ModelDocType<
	ModelType extends IModel
> = ModelType[typeof modelSymbols["DocType"]];

export interface QueryOptions<DOC extends {}> {
	$hint?: any;
	sort?: { [key in keyof DOC]: 1 | -1 };
	raw?: boolean;
}
export type Query<DOC extends {}> = Partial<DOC>;

export type ConstructorOf<
	IdKey extends string,
	DOC extends IDocument<IdKey>,
	CRUDActions extends ICRUDActionTypes,
	T extends ModelInstance<DOC>
> = ModelClassGeneral<IdKey, DOC, CRUDActions> & {
	new (doc: OptionalKeys<DOC, IdKey>): T;
};
