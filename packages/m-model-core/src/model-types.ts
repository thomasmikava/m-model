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

export type ModelInstanceWithoutDoc<DOC extends {}> = {
	[modelSymbols.initialDoc]: Partial<DOC>;
	[modelSymbols.isDeleted]: boolean;
	saveSync(): void;
	toJSON(): DOC;
	getLoadTime(): Date | undefined;
	getFullDoc(): IStoreDocInstance<DOC> | undefined;
};

interface ModelClassGeneral<
	IdKey extends string,
	IdType extends string | number,
	DOC extends IDocument<IdKey, IdType>,
	CRUDActions extends ICRUDActionTypes = ICRUDActionTypes
> {
	[modelSymbols.IdKey]: IdKey;
	[modelSymbols.IdType]: IdType;
	[modelSymbols.DocType]: DOC;

	initialize(): {
		data: IStoreInstances<DOC, {}>;
		loadedAll: boolean;
	};

	/* protected  */ dispatch: IModelConfig<
		IdKey,
		IdType,
		DOC,
		CRUDActions
	>["dispatch"];
	/* protected  */ subscribeStoreChange: IModelConfig<
		IdKey,
		IdType,
		DOC,
		CRUDActions
	>["subscribe"];
	/* protected  */ syncronousCrudActions: ICRUDSyncActions<
		IdKey,
		IdType,
		DOC,
		CRUDActions
	>;
	/* protected  */ dockeys: (keyof DOC)[];

	findByIdSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		id: IdType,
		raw?: false
	): T | undefined;
	findByIdSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		id: IdType,
		raw: true
	): DOC | undefined;

	findManyByIdsSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		ids: IdType[],
		raw?: false
	): T[];
	findManyByIdsSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		ids: IdType[],
		raw: true
	): DOC[];

	findOneSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		query: Query<DOC>,
		options?: QueryOptions<DOC>
	): T | undefined;

	deleteOneSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		query: Query<DOC>
	);

	findManySync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		query: Query<DOC>,
		options?: QueryOptions<DOC>
	): T[];

	updateManySync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		query: Query<DOC>,
		newDoc: Partial<DOC>
	);

	updateOneSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		query: Query<DOC>,
		newDoc: Partial<DOC>,
		getRaw?: boolean
	);

	deleteManyByIdsSync<T extends ModelInstance<DOC>>(
		ids: IdType[],
		dispatchAction?: boolean
	);

	deleteManySync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		query: Query<DOC>,
		options?: QueryOptions<DOC>
	);

	getStoreRawInstancesObj<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>
	): RawInstances<IdKey, IdType, DOC>;

	getRawInstancesObj<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>
	): Record<IdType, DOC | undefined>;

	getAllSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		raw?: false
	): T[];
	getAllSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		raw: true
	): DOC[];

	subscribeChangeById<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		id: IdType,
		cb: (currentDoc: T | undefined) => void
	);

	subscribeOneDocChangeByQuery<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		query: Query<DOC>,
		options: QueryOptions<DOC> | undefined | null,
		cb: (currentDoc: T | undefined) => void
	): () => void;

	subscribeManyDocsChangeByQuery<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		query: Query<DOC>,
		options: QueryOptions<DOC> | undefined | null,
		cb: (currentDoc: T[]) => void
	): () => void;

	subscribeManyDocsChangeByIds<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		ids: IdType[],
		raw: false,
		cb: (currentDoc: T[]) => void
	): () => void;
	subscribeManyDocsChangeByIds<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		ids: IdType[],
		raw: true,
		cb: (currentDoc: DOC[]) => void
	): () => void;

	subscribeChange(cb: () => void): () => void;

	clearAllSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		dispatchAction?: boolean
	);

	deleteByIdSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		id: IdType,
		dispatchAction?: boolean,
		instances?: RawInstances<IdKey, IdType, DOC>
	);

	loadOneSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		doc: DOC,
		loadTime?: Date,
		extra?: IAnyObj,
		raw?: false,
		dispatchAction?: boolean,
		instances?: RawInstances<IdKey, IdType, DOC>
	): T;
	loadOneSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		doc: DOC,
		loadTime: Date | undefined,
		extra: IAnyObj | undefined,
		raw: true,
		dispatchAction?: boolean,
		instances?: RawInstances<IdKey, IdType, DOC>
	): DOC;

	loadManySync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		docs: DOC[],
		clearOthers?: boolean,
		loadTime?: Date,
		extras?: IAnyObj[],
		raw?: false,
		dispatchAction?: boolean,
		instances?: RawInstances<IdKey, IdType, DOC>
	): T[];
	loadManySync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		docs: DOC[],
		clearOthers: boolean | undefined,
		loadTime: Date | undefined,
		extras: IAnyObj[] | undefined,
		raw: true,
		dispatchAction?: boolean,
		instances?: RawInstances<IdKey, IdType, DOC>
	): DOC[];

	loadManyFromStorageSync<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		obj: IStoreInstances<DOC>
	): void;

	reducer<T extends ModelInstance<DOC>>(
		this: ConstructorOf<IdKey, IdType, DOC, CRUDActions, T>,
		state: IStoreInstances<DOC> | undefined,
		action: AnyAction
	): IStoreInstances<DOC>;
}

export interface ModelClass<
	IdKey extends string,
	IdType extends string | number,
	DOC extends IDocument<IdKey, IdType>,
	CRUDActions extends ICRUDActionTypes = ICRUDActionTypes
> extends ModelClassGeneral<IdKey, IdType, DOC, CRUDActions> {
	new (doc: OptionalKeys<DOC, IdKey>): ModelInstance<DOC>;
}

export interface ModelClassWithoutDoc<
	IdKey extends string,
	IdType extends string | number,
	DOC extends IDocument<IdKey, IdType>,
	CRUDActions extends ICRUDActionTypes = ICRUDActionTypes
> extends ModelClassGeneral<IdKey, IdType, DOC, CRUDActions> {
	new (doc: OptionalKeys<DOC, IdKey>): ModelInstanceWithoutDoc<DOC>;
}

export type IModel = ModelClass<any, any, any, any>;

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
	IdType extends string | number,
	DOC extends IDocument<IdKey, IdType>,
	CRUDActions extends ICRUDActionTypes,
	T extends ModelInstance<DOC>
> = ModelClassGeneral<IdKey, IdType, DOC, CRUDActions> & {
	new (doc: OptionalKeys<DOC, IdKey>): T;
};
