import { useState, useEffect, useRef, useMemo } from "react";
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
	const [count, setCount] = useState(0);
	useEffect(() => {
		if (!id) {
			return;
		}
		return Model.subscribeChangeById(
			id,
			() => {
				setCount(x => x + 1);
			}
		);
	}, [Model, id, raw]);
	
	return useMemo(() => {
		if (!id) return null;
		return Model.findByIdSync(id, raw as null);
	}, [Model, id, raw, count]);
}

export function useModelDocByQuery<ModelType extends IModel>(
	Model: ModelType,
	query: Query<ModelDocType<ModelType>> | null,
	queryOptions?: QueryOptions<ModelDocType<ModelType>>
): InstanceType<ModelType> | null {
	const [count, setCount] = useState(0);
	const stringifiedQuery = JSON.stringify(query);
	const stringifiedQueryOptions = JSON.stringify(queryOptions);
	useEffect(() => {
		if (!query) {
			return;
		}
		return Model.subscribeOneDocChangeByQuery(
			query,
			queryOptions || {},
			() => {
				setCount(x => x + 1);
			}
		);
	}, [Model, stringifiedQuery, stringifiedQueryOptions]);
	
	return useMemo(() => {
		if (!query) return null;
		return Model.findOneSync(query, queryOptions);
	}, [Model, stringifiedQuery, stringifiedQueryOptions, count]);
}

export function useModelDocsByQuery<ModelType extends IModel>(
	Model: ModelType,
	query: Query<ModelDocType<ModelType>> | null,
	queryOptions?: QueryOptions<ModelDocType<ModelType>>
): InstanceType<ModelType>[] | null {
	const [count, setCount] = useState(0);
	const stringifiedQuery = JSON.stringify(query);
	const stringifiedQueryOptions = JSON.stringify(queryOptions);
	useEffect(() => {
		if (!query) {
			return;
		}
		return Model.subscribeManyDocsChangeByQuery(
			query,
			queryOptions || {},
			() => {
				setCount(x => x + 1);
			}
		);
	}, [Model, stringifiedQuery, stringifiedQueryOptions]);
	
	return useMemo(() => {
		if (!query) return null;
		return Model.findManySync(query, queryOptions);
	}, [Model, stringifiedQuery, stringifiedQueryOptions, count]);
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
	const [count, setCount] = useState(0);
	const stringifiedIds = JSON.stringify(ids);
	useEffect(() => {
		if (!ids) {
			return;
		}
		return Model.subscribeManyDocsChangeByIds(
			ids,
			raw as null,
			() => {
				setCount(x => x + 1);
			}
		);
	}, [Model, stringifiedIds, raw]);
	
	return useMemo(() => {
		if (!ids) return null;
		return Model.findManyByIdsSync(ids, raw as null);
	}, [Model, stringifiedIds, raw, count]);
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
	const [count, setCount] = useState(0);
	useEffect(() => {
		return Model.subscribeChange(() => {
			setCount(x => x + 1);
		});
	}, [Model, raw]);
	
	return useMemo(() => {
		Model.getAllSync(raw as null);
	}, [Model, raw, count]);
}
