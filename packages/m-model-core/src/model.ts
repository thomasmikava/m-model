import createCRUDActions, {
	ICRUDActionTypes,
	IDeleteManyAction,
	IDeleteOneAction,
	IDocument,
	ILoadManyAction,
	ILoadOneAction,
	IUpdateManyAction,
	IUpdateOneAction,
} from "./crud-actions";
import createCRUDReducer from "./crud-reducer";
import {
	AnyAction,
	IStoreDocInstance,
	IStoreInstances,
	IModelConfig,
	modelSymbols,
	RawInstances,
} from "./main-types";
import {
	IAnyObj,
	NotUndefined,
	OptionalKeys,
	OptionalKeysOtherThan,
} from "./generics";
import {
	ConstructorOf,
	ModelClass,
	ModelClassWithoutDoc,
	ModelInstance,
	ModelInstanceWithoutDoc,
	QueryOptions,
	Query,
} from "./model-types";
import { defaultSpecialActionKeyOfOtherTabsActions } from "./storage";

function createModel<
	IdKey extends string,
	IdType extends string | number,
	DOC extends IDocument<IdKey, IdType>,
	CRUDActions extends ICRUDActionTypes = ICRUDActionTypes
>(
	config: IModelConfig<IdKey, IdType, DOC, CRUDActions>
): ModelClass<IdKey, IdType, DOC> {
	const HowMany = Symbol();
	const actions = createCRUDActions<IdKey, IdType, DOC, CRUDActions>(
		config.syncronousCRUDActionTypes,
		config.keyOfId
	);

	const crudReducer = createCRUDReducer<
		IdKey,
		IdType,
		DOC,
		IStoreInstances<DOC>
	>(config.syncronousCRUDActionTypes, config.keyOfId);

	type ConstructorType<T extends ModelInstance<DOC>> = ConstructorOf<
		IdKey,
		IdType,
		DOC,
		CRUDActions,
		T
	>;

	type IModel = ModelClass<IdKey, IdType, DOC, CRUDActions>;
	type ModelWithoutDoc = ModelClassWithoutDoc<
		IdKey,
		IdType,
		DOC,
		CRUDActions
	>;

	const ModelClass: ModelWithoutDoc = class Model
		implements ModelInstanceWithoutDoc<DOC> {
		[modelSymbols.initialDoc]: Partial<DOC>;
		[modelSymbols.isDeleted] = false;

		constructor(args: OptionalKeys<DOC, IdKey>) {
			this[modelSymbols.initialDoc] = {} as Partial<DOC>;
			for (const key of config.dockeys) {
				this[modelSymbols.initialDoc][key] = args[key as any];
				this[key as any] = args[key as any];
			}
		}

		saveSync() {
			if (this[config.keyOfId as any] === undefined) {
				throw new Error(
					`document must have ${config.keyOfId} in order to be saved`
				);
			}
			const instances = config.getInstances();
			if (instances) {
				const instance = instances[this[config.keyOfId as any]];
				if (instance) {
					(this.constructor as typeof Model).updateByDocSync(
						this.toJSON()
					);
					return;
				}
			}
			(this.constructor as IModel).loadOneSync(this.toJSON());
		}

		toJSON(): DOC {
			const obj = {} as DOC;
			for (const key of config.dockeys) {
				obj[key] = this[key as any];
			}
			return obj;
		}

		getLoadTime(): Date | undefined {
			const instances = config.getInstances();
			if (instances) {
				const instance = instances[this[config.keyOfId as any]];
				if (instance) {
					return typeof instance.loadTime === "string"
						? new Date(instance.loadTime)
						: instance.loadTime;
				}
			}
			return undefined;
		}

		getFullDoc(): IStoreDocInstance<DOC> | undefined {
			const instances = config.getInstances();
			if (instances) {
				const instance = instances[this[config.keyOfId as any]];
				return instance;
			}
			return undefined;
		}

		static [modelSymbols.IdKey]: IdKey;
		static [modelSymbols.IdType]: IdType;
		static [modelSymbols.DocType]: DOC;

		/* protected */ static dispatch = config.dispatch;
		/* protected */ static subscribeStoreChange = config.subscribe;
		/* protected */ static syncronousCrudActions = actions;
		/* protected */ static dockeys = config.dockeys;
		protected static indicesTable = !config.indices
			? []
			: config.indices.map(() => ({} as IAnyObj));

		static initialize() {
			const info = config.loadInstancesFromStorage();
			if (info.data) {
				((this as any) as IModel).loadManyFromStorageSync(info.data);
			}
			return info;
		}

		/* protected */ static addTimestampsToDoc(doc: DOC): DOC {
			if (
				!config.timestamps ||
				(!config.timestamps.createdAt && !config.timestamps.updatedAt)
			) {
				return doc;
			}
			if (
				!config.timestamps.updatedAt &&
				doc[config.timestamps.createdAt!]
			) {
				return doc;
			}
			const newDoc = { ...doc };
			if (
				config.timestamps.createdAt &&
				!newDoc[config.timestamps.createdAt]
			) {
				newDoc[config.timestamps.createdAt] = new Date() as any;
			}
			if (config.timestamps.updatedAt) {
				newDoc[config.timestamps.updatedAt] = new Date() as any;
			}
			return newDoc;
		}

		static findByIdSync<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			id: IdType,
			raw?: false
		): T | undefined;
		static findByIdSync<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			id: IdType,
			raw: true
		): DOC | undefined;
		static findByIdSync<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			id: IdType,
			raw = false
		): T | DOC | undefined {
			const instances = config.getInstances();
			if (!instances) return undefined;
			const instance = instances[id];
			if (!instance) {
				return undefined;
			}
			if (raw) {
				return instance.info;
			}
			return new this(instance.info);
		}

		static findManyByIdsSync<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			ids: IdType[],
			raw?: false
		): T[];
		static findManyByIdsSync<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			ids: IdType[],
			raw: true
		): DOC[];
		static findManyByIdsSync<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			ids: IdType[],
			raw = false
		): T[] | DOC[] {
			const instances = config.getInstances();
			if (!instances) return [];
			const objs: (T | DOC)[] = [];
			const notFoundIds: IdType[] = [];
			for (let i = 0; i < ids.length; ++i) {
				const id = ids[i];
				if (instances[id]) {
					objs.push(
						raw
							? instances[id]!.info
							: new this(instances[id]!.info)
					);
				} else {
					notFoundIds.push(id);
				}
			}
			return objs as T[] | DOC[];
		}

		static findOneSync<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			query: Query<DOC>,
			options?: QueryOptions<DOC>
		): T | undefined {
			const searchResult = (this as any).findManySync(query, options);
			if (searchResult.length === 0) {
				return undefined;
			}
			return searchResult[0];
		}

		static deleteOneSync<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			query: Query<DOC>
		) {
			const doc = (this as any).findOneSync(query) as DOC | undefined;
			if (!doc) return;
			(this as any).deleteByIdSync(doc[config.keyOfId]);
		}

		static findManySync<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			query: Query<DOC>,
			options?: QueryOptions<DOC>
		): T[] {
			const instances = config.getInstances();
			if (!instances) {
				return [];
			}
			let idsOfInstances: (string | number)[] = Object.keys(instances);
			if (!instances || idsOfInstances.length === 0) {
				return [];
			}
			if (query[config.keyOfId] !== undefined) {
				idsOfInstances = [query[config.keyOfId]!];
			} else if (config.indices) {
				let bestIndex = options && options.$hint;
				if (!bestIndex) {
					const best = {
						searchCount: Infinity,
						index: undefined as
							| undefined
							| NotUndefined<typeof config["indices"]>[number],
						indexIndex: -1,
					};
					let i = -1;
					for (const index of config.indices) {
						++i;
						let indexHolder = ((this as any) as typeof Model)
							.indicesTable[i];
						let howManyToSearch = Infinity;
						let j = 0;
						for (; j < index.fields.length; ++j) {
							const indexKey = index.fields[j];
							if (indexHolder[HowMany as any] !== undefined) {
								howManyToSearch = indexHolder[HowMany as any];
							} else if (
								index.unique &&
								j === index.fields.length - 1
							) {
								howManyToSearch = 1;
							}
							if (query[indexKey] === undefined) {
								break;
							}
							if (
								indexHolder[query[indexKey] as any] ===
								undefined
							) {
								return [];
							}
							indexHolder = indexHolder[query[indexKey] as any];
						}
						if (howManyToSearch < best.searchCount) {
							best.searchCount = howManyToSearch;
							best.index = index;
							best.indexIndex = i;
						}
					}
					if (best.searchCount < Infinity && best.index) {
						bestIndex = best.index;
					}
				}
				if (bestIndex) {
					const { fields } = bestIndex;
					const indexIndex = config.indices!.indexOf(bestIndex);
					if (indexIndex > -1) {
						// console.log(best.index);
						let indexHolder = ((this as any) as typeof Model)
							.indicesTable[indexIndex];
						// console.log(indexHolder);
						let j = 0;
						for (; j < fields.length; ++j) {
							const indexKey = fields[j];
							if (query[indexKey] === undefined) {
								break;
							}
							indexHolder = indexHolder[query[indexKey] as any];
							// console.log(indexHolder);
						}
						if (j === fields.length) {
							idsOfInstances = bestIndex.unique
								? ([indexHolder] as any[])
								: Object.keys(indexHolder);
						} else {
							idsOfInstances = [];
							const hei: IAnyObj = [indexHolder];
							let lastIndex = 0;
							for (; j < fields.length; ++j) {
								const n = hei.length;
								for (; lastIndex < n; ++lastIndex) {
									const obj = hei[lastIndex];
									for (const key in obj) {
										hei.push(obj[key]);
									}
								}
							}
							for (; lastIndex < hei.length; ++lastIndex) {
								if (bestIndex.unique) {
									idsOfInstances.push(hei[lastIndex]);
								} else {
									for (const k in hei[lastIndex]) {
										idsOfInstances.push(k);
									}
								}
							}
						}
					}
				}
			}
			if (idsOfInstances.length === 0) return [];
			const objs: (T | DOC)[] = [];
			const fixedIds: { [id: string]: true | undefined } = {};
			for (const id of idsOfInstances) {
				if (fixedIds[id]) {
					// console.trace(`duplicate detected for id ${id}`);
					continue;
				}
				const obj = instances[id];
				if (!obj) continue;
				let areEqual = true;
				for (const q in query) {
					if (obj.info[q] !== query[q]) {
						areEqual = false;
						break;
					}
				}
				if (!areEqual) continue;
				fixedIds[id] = true;
				const instance = new this(obj.info);
				objs.push(instance);
			}
			return objs as T[];
		}

		protected static updateManyByDocsSync(
			docs: OptionalKeysOtherThan<DOC, IdKey>[],
			extras?: IAnyObj[],
			dispatchAction = true,
			instances?: RawInstances<IdKey, IdType, DOC>
		) {
			if (!instances) instances = config.getInstances();
			if (!instances) return;
			const documents: OptionalKeysOtherThan<DOC, IdKey>[] = [];
			for (const doc of docs) {
				let oldInstance: DOC | undefined;
				const document =
					config.timestamps && config.timestamps.updatedAt
						? { ...doc, [config.timestamps.updatedAt]: new Date() }
						: doc;
				if (instances && instances[doc[config.keyOfId]]) {
					oldInstance = instances[document[config.keyOfId]]!.info;
					(this as any).updateIndices(oldInstance, false);
				}
				if (oldInstance) {
					(this as any).updateIndices(
						{ ...oldInstance, ...document },
						true
					);
				}
				documents.push(document);
			}
			if (dispatchAction) {
				this.dispatch(
					this.syncronousCrudActions.updateMany(documents, extras)
				);
			}
		}

		static updateManySync<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			query: Query<DOC>,
			newDoc: Partial<DOC>
		) {
			const documents = (this as any).findManySync(query);

			const docs: OptionalKeysOtherThan<DOC, IdKey>[] = [];
			for (const doc of documents) {
				docs.push({
					[config.keyOfId]: doc[config.keyOfId],
					...newDoc,
				} as OptionalKeysOtherThan<DOC, IdKey>);
			}
			(this as any).updateManyByDocsSync(docs);
		}

		static updateOneSync<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			query: Query<DOC>,
			newDoc: Partial<DOC>,
			getRaw?: boolean
		) {
			const document = (this as any).findOneSync(
				query,
				undefined,
				true
			) as T | undefined;
			if (!document) {
				return;
			}
			for (const key in newDoc) {
				document[key as any] = newDoc[key];
			}
			document.saveSync();
			if (getRaw) {
				return document.toJSON();
			}
			return document;
		}

		static deleteManyByIdsSync<T extends ModelInstance<DOC>>(
			ids: IdType[],
			dispatchAction = true
		) {
			const documents = (this as any).findManyByIdsSync(ids) as DOC[];
			for (const doc of documents) {
				(this as any).updateIndices(doc, false);
			}
			if (dispatchAction) {
				this.dispatch(
					this.syncronousCrudActions.deleteMany(
						documents.map(e => e[config.keyOfId])
					)
				);
			}
		}

		static deleteManySync<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			query: Query<DOC>,
			options?: QueryOptions<DOC>
		) {
			const docs = (this as any).findManySync(query, options) as DOC[];
			if (!docs.length) return;
			(this as any).deleteManyByIdsSync(docs.map(e => e[config.keyOfId]));
		}

		static getStoreRawInstancesObj<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>
		): RawInstances<IdKey, IdType, DOC> {
			const instances = config.getInstances();
			return instances!;
		}

		static getRawInstancesObj<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>
		): Record<IdType, DOC | undefined> {
			const instances = config.getInstances();
			const rawInstances: Record<IdType, DOC | undefined> = {} as any;
			for (const instanceId in instances) {
				rawInstances[instanceId as any] = instances[instanceId]!.info;
			}
			return rawInstances;
		}

		static getAllSync<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			raw?: false
		): T[];
		static getAllSync<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			raw: true
		): DOC[];
		static getAllSync<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			raw = false
		): T[] | DOC[] {
			const instances = config.getInstances();
			if (!instances) return [];
			const objs: (T | DOC)[] = [];
			for (const instanceId in instances) {
				const instance = raw
					? instances[instanceId]!.info
					: new this(instances[instanceId]!.info);
				objs.push(instance);
			}
			return objs as T[] | DOC[];
		}

		public static subscribeChangeById<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			id: IdType,
			cb: (currentDoc: T | undefined) => void
		): () => void {
			let lastInstances = config.getInstances();
			let lastInstance =
				lastInstances && lastInstances[id] && lastInstances[id]!.info;
			return ((this as any) as typeof Model).subscribeStoreChange(() => {
				const currentInstances = config.getInstances();
				if (currentInstances === lastInstances) return;
				const currentInstance =
					currentInstances &&
					currentInstances[id] &&
					currentInstances[id]!.info;
				if (lastInstance !== currentInstance) {
					lastInstance = currentInstance;
					lastInstances = currentInstances;
					cb(currentInstance ? new this(currentInstance) : undefined);
				}
			});
		}

		public static subscribeOneDocChangeByQuery<
			T extends ModelInstance<DOC>
		>(
			this: ConstructorType<T>,
			query: Query<DOC>,
			options: QueryOptions<DOC> | undefined | null,
			cb: (currentDoc: T | undefined) => void
		): () => void {
			const that = (this as any) as IModel;
			let lastInstances = config.getInstances();
			const getRaw = !!options && !!options.raw;
			const newOptions = { ...(options || {}), raw: true };
			let lastInstance = (that.findOneSync(
				query,
				newOptions
			) as any) as DOC;
			return that.subscribeStoreChange(() => {
				const currentInstances = config.getInstances();
				if (currentInstances === lastInstances) return;
				if (!currentInstances) {
					if (lastInstance !== undefined) {
						cb(undefined);
					}
					return;
				}
				const currentInstance = (that.findOneSync(
					query,
					newOptions
				) as any) as DOC;
				if (lastInstance !== currentInstance) {
					lastInstance = currentInstance;
					lastInstances = currentInstances;
					cb(
						currentInstance
							? getRaw
								? ((currentInstance as any) as T)
								: ((new this(currentInstance) as any) as T)
							: undefined
					);
				}
			});
		}

		public static subscribeManyDocsChangeByQuery<
			T extends ModelInstance<DOC>
		>(
			this: ConstructorType<T>,
			query: Query<DOC>,
			options: QueryOptions<DOC> | undefined | null,
			cb: (currentDoc: T[]) => void
		): () => void {
			const that = (this as any) as IModel;
			const getRaw = !!options && !!options.raw;
			const newOptions = { ...(options || {}), raw: true };
			let lastInstances = config.getInstances();
			let lastFoundInstances = (that.findManySync(
				query,
				newOptions
			) as any) as DOC[];
			return ((this as any) as typeof Model).subscribeStoreChange(() => {
				const currentInstances = config.getInstances();
				if (currentInstances === lastInstances) return;
				const currentFoundInstances = (that.findManySync(
					query,
					newOptions
				) as any) as DOC[];
				let areSame =
					lastFoundInstances.length === currentFoundInstances.length;
				if (areSame) {
					for (let i = 0; i < lastFoundInstances.length; i++) {
						if (
							lastFoundInstances[i] !== currentFoundInstances[i]
						) {
							areSame = false;
							break;
						}
					}
				}
				if (!areSame) {
					lastFoundInstances = currentFoundInstances;
					lastInstances = currentInstances;
					cb(
						getRaw
							? ((currentFoundInstances as any) as T[])
							: currentFoundInstances.map(e => new this(e) as T)
					);
				}
			});
		}

		public static subscribeManyDocsChangeByIds<
			T extends ModelInstance<DOC>
		>(
			this: ConstructorType<T>,
			ids: IdType[],
			raw: false,
			cb: (currentDoc: T[]) => void
		): () => void;
		public static subscribeManyDocsChangeByIds<
			T extends ModelInstance<DOC>
		>(
			this: ConstructorType<T>,
			ids: IdType[],
			raw: true,
			cb: (currentDoc: DOC[]) => void
		): () => void;
		public static subscribeManyDocsChangeByIds<
			T extends ModelInstance<DOC>
		>(
			this: ConstructorType<T>,
			ids: IdType[],
			raw: boolean,
			cb: (currentDoc: T[] | DOC[]) => void
		): () => void {
			const that = (this as any) as IModel;
			let lastInstances = config.getInstances();
			let lastFoundInstances = that.findManyByIdsSync(
				ids,
				raw as true
			) as DOC[];
			return ((this as any) as typeof Model).subscribeStoreChange(() => {
				const currentInstances = config.getInstances();
				if (currentInstances === lastInstances) return;
				const currentFoundInstances = that.findManyByIdsSync(
					ids,
					raw as true
				) as DOC[];
				let areSame =
					lastFoundInstances.length === currentFoundInstances.length;
				if (areSame) {
					for (let i = 0; i < lastFoundInstances.length; i++) {
						if (
							lastFoundInstances[i] !== currentFoundInstances[i]
						) {
							areSame = false;
							break;
						}
					}
				}
				if (!areSame) {
					lastFoundInstances = currentFoundInstances;
					lastInstances = currentInstances;
					cb(
						raw
							? currentFoundInstances
							: currentFoundInstances.map(e => new this(e) as T)
					);
				}
			});
		}

		public static subscribeChange(cb: () => void): () => void {
			const lastInstances = config.getInstances();
			return ((this as any) as typeof Model).subscribeStoreChange(() => {
				const currentInstances = config.getInstances();
				if (currentInstances === lastInstances) return;
				cb();
			});
		}

		protected static updateByDocSync(
			doc: OptionalKeysOtherThan<DOC, IdKey>,
			extra?: IAnyObj,
			dispatchAction = true,
			instances?: RawInstances<IdKey, IdType, DOC>
		) {
			if (!instances) instances = config.getInstances();
			const document =
				config.timestamps && config.timestamps.updatedAt
					? { ...doc, [config.timestamps.updatedAt]: new Date() }
					: doc;
			let oldInstance: DOC | undefined;
			if (instances && instances[document[config.keyOfId]]) {
				oldInstance = instances[document[config.keyOfId]]!.info;
				this.updateIndices(oldInstance, false);
			}
			if (oldInstance) {
				this.updateIndices({ ...oldInstance, ...document }, true);
			}
			if (dispatchAction) {
				this.dispatch(
					this.syncronousCrudActions.updateOne(document, extra)
				);
			}
		}

		static clearAllSync<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			dispatchAction = true
		) {
			((this as any) as typeof Model).clearIndices();
			if (dispatchAction) {
				this.dispatch(this.syncronousCrudActions.clearAll());
			}
		}

		static deleteByIdSync<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			id: IdType,
			dispatchAction = true,
			instances?: RawInstances<IdKey, IdType, DOC>
		) {
			if (!instances) instances = config.getInstances();
			if (instances && instances[id]) {
				(this as any).updateIndices(instances[id]!.info, false);
			}
			if (dispatchAction) {
				this.dispatch(this.syncronousCrudActions.deleteOne(id));
			}
		}

		static loadOneSync<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			doc: DOC,
			loadTime?: Date,
			extra?: IAnyObj,
			raw?: false,
			dispatchAction?: boolean,
			instances?: RawInstances<IdKey, IdType, DOC>
		): T;
		static loadOneSync<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			doc: DOC,
			loadTime: Date | undefined,
			extra: IAnyObj | undefined,
			raw: true,
			dispatchAction?: boolean,
			instances?: RawInstances<IdKey, IdType, DOC>
		): DOC;
		static loadOneSync<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			doc: DOC,
			loadTime?: Date,
			extra?: IAnyObj,
			raw = false,
			dispatchAction = true,
			instances?: RawInstances<IdKey, IdType, DOC>
		): T | DOC {
			if (!instances) instances = config.getInstances();
			let exists = false;
			if (instances && instances[doc[config.keyOfId]]) {
				exists = true;
			}
			const document = (this as any).addTimestampsToDoc(doc) as DOC;
			if (exists) {
				((this as any) as typeof Model).updateByDocSync(
					document,
					extra,
					false,
					instances
				);
			} else {
				((this as any) as typeof Model).updateIndices(document, true);
			}
			if (dispatchAction) {
				this.dispatch(
					this.syncronousCrudActions.loadOne(
						document,
						loadTime,
						extra
					)
				);
			}
			if (raw) return document;
			return new this(document);
		}

		static loadManySync<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			docs: DOC[],
			clearOthers?: boolean,
			loadTime?: Date,
			extras?: IAnyObj[],
			raw?: false,
			dispatchAction?: boolean,
			instances?: RawInstances<IdKey, IdType, DOC>
		): T[];
		static loadManySync<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			docs: DOC[],
			clearOthers: boolean | undefined,
			loadTime: Date | undefined,
			extras: IAnyObj[] | undefined,
			raw: true,
			dispatchAction?: boolean,
			instances?: RawInstances<IdKey, IdType, DOC>
		): DOC[];
		static loadManySync<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			docs: DOC[],
			clearOthers?: boolean,
			loadTime?: Date,
			extras?: IAnyObj[],
			raw?: boolean,
			dispatchAction = true,
			instances?: RawInstances<IdKey, IdType, DOC>
		): T[] | DOC[] {
			if (clearOthers) {
				(this as any).clearAllSync(false);
			}
			const docsuments: T[] | DOC[] = [];
			for (let i = 0; i < docs.length; ++i) {
				const doc = (this as any).loadOneSync(
					docs[i],
					loadTime,
					extras ? extras[i] : undefined,
					raw as true,
					false,
					instances
				);
				(docsuments as DOC[]).push(doc as DOC);
			}
			if (dispatchAction) {
				this.dispatch(
					this.syncronousCrudActions.loadMany(
						docs,
						clearOthers,
						loadTime,
						extras
					)
				);
			}
			return docsuments;
		}

		static loadManyFromStorageSync<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			obj: IStoreInstances<DOC>
		): void {
			if (!obj) return;
			const docs: DOC[] = [];
			const extras: IAnyObj[] = [];
			for (const key in obj) {
				const { info, ...rest } = obj[key]!;
				docs.push(info);
				extras.push(rest);
				(this as any).updateIndices(info, true);
			}
			this.dispatch(
				this.syncronousCrudActions.loadMany(
					docs,
					false,
					undefined,
					extras
				)
			);
			return;
		}

		static reducer<T extends ModelInstance<DOC>>(
			this: ConstructorType<T>,
			state: IStoreInstances<DOC> | undefined,
			action: AnyAction
		): IStoreInstances<DOC> {
			const newState = crudReducer(state, action as any);
			if (!config.storageSettings.spreadActionsToOtherTabs) {
				return newState;
			}
			const isActionOfAnotherTab =
				(action as any)[
					config.storageSettings.specialActionKeyOfOtherTabsActions ||
						defaultSpecialActionKeyOfOtherTabsActions
				] !== undefined;
			if (isActionOfAnotherTab) {
				const actionType = action.type as any;
				if (actionType === config.syncronousCRUDActionTypes.loadOne) {
					const loadOneAction = action as ILoadOneAction<
						IdKey,
						IdType,
						DOC,
						CRUDActions["loadOne"]
					>;
					((this as any) as IModel).loadOneSync(
						loadOneAction.info,
						loadOneAction.loadTime,
						loadOneAction.extra,
						false,
						false,
						state || {}
					);
				} else if (
					actionType === config.syncronousCRUDActionTypes.loadMany
				) {
					const loadManyAction = action as ILoadManyAction<
						IdKey,
						IdType,
						DOC,
						CRUDActions["loadMany"]
					>;
					((this as any) as IModel).loadManySync(
						loadManyAction.infos,
						loadManyAction.clearOthers,
						loadManyAction.loadTime,
						loadManyAction.extras,
						true,
						false,
						state || {}
					);
				} else if (
					actionType === config.syncronousCRUDActionTypes.deleteOne
				) {
					const deleteAction = action as IDeleteOneAction<
						IdKey,
						IdType,
						CRUDActions["deleteOne"]
					>;
					((this as any) as IModel).deleteByIdSync(
						deleteAction[config.keyOfId],
						false,
						state || {}
					);
				} else if (
					actionType === config.syncronousCRUDActionTypes.deleteMany
				) {
					const deleteAction = action as IDeleteManyAction<
						IdType,
						CRUDActions["deleteMany"]
					>;
					((this as any) as IModel).deleteManyByIdsSync(
						deleteAction.ids,
						false
					);
				} else if (
					actionType === config.syncronousCRUDActionTypes.clearAll
				) {
					(this as any).clearAllSync(false);
				} else if (
					actionType === config.syncronousCRUDActionTypes.updateOne
				) {
					const updateAction = action as IUpdateOneAction<
						IdKey,
						IdType,
						DOC,
						CRUDActions["updateOne"]
					>;
					((this as any) as typeof Model).updateByDocSync(
						updateAction.info,
						updateAction.extra,
						false,
						state || {}
					);
				} else if (
					actionType === config.syncronousCRUDActionTypes.updateMany
				) {
					const updateAction = action as IUpdateManyAction<
						IdKey,
						IdType,
						DOC,
						CRUDActions["updateMany"]
					>;
					((this as any) as typeof Model).updateManyByDocsSync(
						updateAction.infos,
						updateAction.extras,
						false,
						state || {}
					);
				}
			}
			return newState;
		}

		protected static clearIndices() {
			for (let i = 0; i < this.indicesTable.length; ++i) {
				this.indicesTable[i] = {};
			}
		}

		protected static updateIndices(
			doc: DOC,
			isLoaded: boolean // else deleted
		) {
			if (!config.indices) return;
			let i = -1;
			for (const index of config.indices) {
				++i;
				let indexHolder = this.indicesTable[i];

				let HowManyIncrement = 0;
				for (let j = 0; j < index.fields.length; ++j) {
					const indexKey = index.fields[j];
					if (doc[indexKey] === undefined) return;
					let newIndexHolder = indexHolder[doc[indexKey]];
					if (!isLoaded) {
						if (newIndexHolder === undefined) return;
					} else {
						if (
							!indexHolder[doc[indexKey]] &&
							(!index.unique || j < index.fields.length - 1)
						) {
							indexHolder[doc[indexKey]] = {};
						}
						newIndexHolder = indexHolder[doc[indexKey]];
					}
					if (j < index.fields.length - 1) {
						indexHolder = newIndexHolder;
					} else {
						if (isLoaded) {
							if (index.unique) {
								if (!indexHolder[doc[indexKey]]) {
									HowManyIncrement++;
								}
								indexHolder[doc[indexKey]] =
									doc[config.keyOfId];
							} else {
								if (
									!indexHolder[doc[indexKey]][
										doc[config.keyOfId]
									]
								) {
									HowManyIncrement++;
								}
								indexHolder[doc[indexKey]][
									doc[config.keyOfId]
								] = true;
							}
						} else {
							if (index.unique) {
								if (indexHolder[doc[indexKey]]) {
									HowManyIncrement--;
									delete indexHolder[doc[indexKey]];
								}
							} else {
								if (
									indexHolder[doc[indexKey]][
										doc[config.keyOfId]
									]
								) {
									HowManyIncrement--;
									delete indexHolder[doc[indexKey]][
										doc[config.keyOfId]
									];
								}
							}
						}
					}
				}

				indexHolder = ((this as any) as typeof Model).indicesTable[i];
				let j = 0;
				for (; j < index.fields.length; ++j) {
					const indexKey = index.fields[j];
					if (!index.unique || j !== index.fields.length) {
						indexHolder[HowMany as any] =
							(indexHolder[HowMany as any] || 0) +
							HowManyIncrement;
					}
					const oldCount =
						index.unique && j === index.fields.length - 1
							? indexHolder[doc[indexKey]]
								? 1
								: 0
							: indexHolder[doc[indexKey]][HowMany as any] || 0;
					if (!isLoaded && oldCount + HowManyIncrement === 0) {
						delete indexHolder[doc[indexKey]];
						break;
					}
					indexHolder = indexHolder[doc[indexKey]];
				}
				if (!index.unique && indexHolder && j === index.fields.length) {
					indexHolder[HowMany as any] =
						(indexHolder[HowMany as any] || 0) + HowManyIncrement;
				}
			}
		}
	};
	return ModelClass as IModel;
}

export { createModel };
