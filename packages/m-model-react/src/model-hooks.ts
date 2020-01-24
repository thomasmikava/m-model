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
	id: ModelIdType<ModelType> | null
): InstanceType<ModelType> | null {
	const mountingInfo = useMountingInfo();
	const [resource, setResource] = useState<InstanceType<ModelType> | null>(
		id && mountingInfo.isFirstMounting
			? Model.findByIdSync(id) || null
			: null
	);
	const resourceRef = useRef(resource);
	resourceRef.current = resource;
	useEffect(() => {
		let isCancelled = false;
		if (!id) {
			if (resourceRef.current !== null) {
				setResource(null);
			}
			return;
		}
		if (mountingInfo.hasFinishedFirstMountingCycle) {
			const doc = Model.findByIdSync(id) || null;
			if (resourceRef.current !== doc) {
				setResource(doc);
			}
		}
		const cancelSubscription = Model.subscribeChangeById(id, doc => {
			if (isCancelled) return;
			if (resourceRef.current !== (doc || null)) {
				setResource(doc || null);
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
): InstanceType<ModelType> | null | undefined {
	const mountingInfo = useMountingInfo();
	const [resource, setResource] = useState<InstanceType<ModelType> | null>(
		query && mountingInfo.isFirstMounting
			? Model.findOneSync(query) || null
			: null
	);
	const resourceRef = useRef(resource);
	resourceRef.current = resource;
	useEffect(() => {
		let isCancelled = false;
		if (!query) {
			if (resourceRef.current !== undefined) {
				setResource(null);
			}
			return;
		}
		if (mountingInfo.hasFinishedFirstMountingCycle) {
			const doc = Model.findOneSync(query, queryOptions) || null;
			if (resourceRef.current !== doc) {
				setResource(doc);
			}
		}
		const cancelSubscription = Model.subscribeOneDocChangeByQuery(
			query,
			queryOptions,
			doc => {
				if (isCancelled) return;
				if (resourceRef.current !== (doc || null)) {
					setResource(doc || null);
				}
			}
		);
		return () => {
			isCancelled = true;
			cancelSubscription();
		};
	}, [Model, mountingInfo, query, queryOptions]);
	return !query ? undefined : resource;
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
			? Model.findManySync(query, queryOptions) || null
			: null
	);
	const resourceRef = useRef(resources);
	resourceRef.current = resources;
	useEffect(() => {
		let isCancelled = false;
		if (!query) {
			if (resourceRef.current !== undefined) {
				setResources(null);
			}
			return;
		}
		if (mountingInfo.hasFinishedFirstMountingCycle) {
			const docs = Model.findManySync(query, queryOptions);
			setResources(docs);
		}
		const cancelSubscription = Model.subscribeManyDocsChangeByQuery(
			query,
			queryOptions || {},
			docs => {
				if (isCancelled) return;
				setResources(docs);
			}
		);
		return () => {
			isCancelled = true;
			cancelSubscription();
		};
	}, [Model, mountingInfo, query, queryOptions]);
	return !query ? null : resources;
}

export function useModelDocsByIds<ModelType extends IModel>(
	Model: ModelType,
	ids: ModelIdType<ModelType>[] | null,
	raw?: boolean
): InstanceType<ModelType>[] | null {
	const mountingInfo = useMountingInfo();
	const [resources, setResources] = useState<
		InstanceType<ModelType>[] | null
	>(
		ids && mountingInfo.isFirstMounting
			? Model.findManyByIdsSync(ids, raw as false) || null
			: null
	);
	const resourceRef = useRef(resources);
	resourceRef.current = resources;
	useEffect(() => {
		let isCancelled = false;
		if (!ids) {
			if (resourceRef.current !== undefined) {
				setResources(null);
			}
			return;
		}
		if (mountingInfo.hasFinishedFirstMountingCycle) {
			const docs = Model.findManyByIdsSync(ids, raw as false);
			setResources(docs);
		}
		const cancelSubscription = Model.subscribeManyDocsChangeByIds(
			ids,
			raw as false,
			docs => {
				if (isCancelled) return;
				setResources(docs);
			}
		);
		return () => {
			isCancelled = true;
			cancelSubscription();
		};
	}, [Model, ids, mountingInfo, raw]);
	return !ids ? null : resources;
}

const emptyArr: any[] = [];

export function useModelDocs<ModelType extends IModel>(
	Model: ModelType,
	raw?: boolean
): InstanceType<ModelType>[] {
	const mountingInfo = useMountingInfo();
	const [resources, setResources] = useState<InstanceType<ModelType>[]>(
		mountingInfo.isFirstMounting ? Model.getAllSync(raw as false) : emptyArr
	);
	const isMountedRef = useRef(false);
	useEffect(() => {
		let isCancelled = false;
		if (isMountedRef.current) {
			setResources(Model.getAllSync(raw as false));
		}
		isMountedRef.current = true;
		const cancelSubscription = Model.subscribeChange(() => {
			if (isCancelled) return;
			setResources(Model.getAllSync(raw as false));
		});
		return () => {
			isCancelled = true;
			cancelSubscription();
		};
	}, [Model, raw]);
	return resources;
}
