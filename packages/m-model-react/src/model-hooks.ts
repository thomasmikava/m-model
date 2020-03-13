import { useState, useEffect, useRef } from "react";
import { useMountingInfo } from "./helper-hooks";
import {
	IModel,
	QueryOptions,
	Query,
	ModelIdType,
	ModelDocType,
} from "m-model-core";

export function useModelDocById<ModelType extends IModel>(
	Model: ModelType,
	id: ModelIdType<ModelType> | null,
	raw?: null
): InstanceType<ModelType> | null;
export function useModelDocById<ModelType extends IModel>(
	Model: ModelType,
	id: ModelIdType<ModelType> | null,
	raw: "raw"
): ModelDocType<ModelType> | null;
export function useModelDocById<ModelType extends IModel>(
	Model: ModelType,
	id: ModelIdType<ModelType> | null,
	raw?: null | "raw"
): InstanceType<ModelType> | ModelDocType<ModelType> | null {
	const mountingInfo = useMountingInfo();
	const [resource, setResource] = useState<InstanceType<ModelType> | null>(
		id && mountingInfo.isFirstMounting
			? Model.findByIdSync(id, raw as null)
			: null
	);
	const resourceRef = useRef(resource);
	resourceRef.current = resource;
	useEffect(() => {
		let isCancelled = false;
		if (!id) {
			if (resourceRef.current) {
				setResource(null);
			}
			return;
		}
		if (mountingInfo.hasFinishedFirstMountingCycle) {
			const doc = Model.findByIdSync(id, raw as null);
			if (resourceRef.current !== doc) {
				setResource(doc);
			}
		}
		const cancelSubscription = Model.subscribeChangeById(id, doc => {
			if (isCancelled) return;
			if (resourceRef.current !== doc) {
				if (doc && raw === "raw") {
					setResource(doc.toJSON());
				} else {
					setResource(doc);
				}
			}
		});
		return () => {
			isCancelled = true;
			cancelSubscription();
		};
	}, [Model, id, mountingInfo]);
	return !id ? null : resource;
}

export function useModelDocByQuery<ModelType extends IModel>(
	Model: ModelType,
	query: Query<ModelDocType<ModelType>> | null,
	queryOptions?: QueryOptions<ModelDocType<ModelType>>
): InstanceType<ModelType> | null {
	const mountingInfo = useMountingInfo();
	const [resource, setResource] = useState<InstanceType<ModelType> | null>(
		query && mountingInfo.isFirstMounting ? Model.findOneSync(query) : null
	);
	const resourceRef = useRef(resource);
	resourceRef.current = resource;
	useEffect(() => {
		let isCancelled = false;
		if (!query) {
			if (resourceRef.current) {
				setResource(null);
			}
			return;
		}
		if (mountingInfo.hasFinishedFirstMountingCycle) {
			const doc = Model.findOneSync(query, queryOptions);
			if (resourceRef.current !== doc) {
				setResource(doc);
			}
		}
		const cancelSubscription = Model.subscribeOneDocChangeByQuery(
			query,
			queryOptions,
			doc => {
				if (isCancelled) return;
				if (resourceRef.current !== doc) {
					setResource(doc);
				}
			}
		);
		return () => {
			isCancelled = true;
			cancelSubscription();
		};
	}, [
		Model,
		mountingInfo,
		JSON.stringify(query),
		JSON.stringify(queryOptions),
	]);
	return !query ? null : resource;
}

export function useModelDocsByQuery<ModelType extends IModel>(
	Model: ModelType,
	query: Query<ModelDocType<ModelType>> | null,
	queryOptions?: QueryOptions<ModelDocType<ModelType>>
): InstanceType<ModelType>[] | null {
	const mountingInfo = useMountingInfo();
	const [resources, setResources] = useState<
		InstanceType<ModelType>[] | null
	>(
		query && mountingInfo.isFirstMounting
			? Model.findManySync(query, queryOptions)
			: null
	);
	const resourceRef = useRef(resources);
	resourceRef.current = resources;
	useEffect(() => {
		let isCancelled = false;
		if (!query) {
			if (resourceRef.current) {
				setResources(null);
			}
			return;
		}
		if (mountingInfo.hasFinishedFirstMountingCycle) {
			const docs = Model.findManySync(query, queryOptions);
			setResources(onlyIfDifferent(docs));
		}
		const cancelSubscription = Model.subscribeManyDocsChangeByQuery(
			query,
			queryOptions || {},
			docs => {
				if (isCancelled) return;
				setResources(onlyIfDifferent(docs));
			}
		);
		return () => {
			isCancelled = true;
			cancelSubscription();
		};
	}, [
		Model,
		mountingInfo,
		JSON.stringify(query),
		JSON.stringify(queryOptions),
	]);
	return !query ? null : resources;
}
export function useModelDocsByIds<ModelType extends IModel>(
	Model: ModelType,
	ids: ModelIdType<ModelType>[] | null,
	raw?: null | "raw"
): InstanceType<ModelType>[] | null;
export function useModelDocsByIds<ModelType extends IModel>(
	Model: ModelType,
	ids: ModelIdType<ModelType>[] | null,
	raw: "raw"
): ModelDocType<ModelType>[] | null;
export function useModelDocsByIds<ModelType extends IModel>(
	Model: ModelType,
	ids: ModelIdType<ModelType>[] | null,
	raw?: null | "raw"
): InstanceType<ModelType>[] | ModelDocType<ModelType>[] | null {
	const mountingInfo = useMountingInfo();
	const [resources, setResources] = useState<
		InstanceType<ModelType>[] | null
	>(
		ids && mountingInfo.isFirstMounting
			? Model.findManyByIdsSync(ids, raw as null)
			: null
	);
	const resourceRef = useRef(resources);
	resourceRef.current = resources;
	useEffect(() => {
		let isCancelled = false;
		if (!ids) {
			if (resourceRef.current) {
				setResources(null);
			}
			return;
		}
		if (mountingInfo.hasFinishedFirstMountingCycle) {
			const docs = Model.findManyByIdsSync(ids, raw as null);
			setResources(onlyIfDifferent(docs));
		}
		const cancelSubscription = Model.subscribeManyDocsChangeByIds(
			ids,
			raw as null,
			docs => {
				if (isCancelled) return;
				setResources(onlyIfDifferent(docs));
			}
		);
		return () => {
			isCancelled = true;
			cancelSubscription();
		};
	}, [Model, ids, mountingInfo, raw]);
	return !ids ? null : resources;
}

export function useModelDocs<ModelType extends IModel>(
	Model: ModelType,
	raw?: null
): InstanceType<ModelType>[];
export function useModelDocs<ModelType extends IModel>(
	Model: ModelType,
	raw: "raw"
): ModelDocType<ModelType>[];
export function useModelDocs<ModelType extends IModel>(
	Model: ModelType,
	raw?: null | "raw"
): InstanceType<ModelType>[] | ModelDocType<ModelType>[] {
	const mountingInfo = useMountingInfo();
	const [resources, setResources] = useState<InstanceType<ModelType>[]>(() => 
		Model.getAllSync(raw as null)
	);
	useEffect(() => {
		let isCancelled = false;
		if (mountingInfo.hasFinishedFirstMountingCycle) {
			setResources(onlyIfDifferent(Model.getAllSync(raw as null)));
		}
		const cancelSubscription = Model.subscribeChange(() => {
			if (isCancelled) return;
			setResources(onlyIfDifferent(Model.getAllSync(raw as null)));
		});
		return () => {
			isCancelled = true;
			cancelSubscription();
		};
	}, [Model, raw]);
	return resources;
}

const onlyIfDifferent = <T extends any>(newArr: T[]) => (
	oldArr: T[] | null | undefined
): T[] => {
	if (!oldArr || oldArr.length !== newArr.length) return newArr;
	for (let i = 0; i < newArr.length; i++) {
		if (newArr[i] !== oldArr[i]) return newArr;
	}
	return oldArr;
};
