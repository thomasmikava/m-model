import { IDocument, IModelConfig } from ".";

export const getDefaultTimeStamps = <
	IdKey extends string,
	DOC extends IDocument<IdKey>
>(
	timestamps: IModelConfig<IdKey, DOC>["timestamps"],
	dockeys: readonly (keyof DOC)[]
): NonNullable<IModelConfig<IdKey, DOC>["timestamps"]> | null => {
	if (timestamps === null) {
		return null;
	}
	const newTimeStamps = { ...timestamps! };
	if (!newTimeStamps.createdAt) {
		if (dockeys.indexOf("createdAt" as any)) {
			newTimeStamps.createdAt = "createdAt" as any;
		} else if (dockeys.indexOf("created_at" as any)) {
			newTimeStamps.createdAt = "created_at" as any;
		}
	}
	if (!newTimeStamps.updatedAt) {
		if (dockeys.indexOf("updatedAt" as any)) {
			newTimeStamps.updatedAt = "updatedAt" as any;
		} else if (dockeys.indexOf("updated_at" as any)) {
			newTimeStamps.updatedAt = "updated_at" as any;
		}
	}
	return newTimeStamps;
};

export const getDefaultSort = <DOC>(
	sortOptions: { [key in keyof DOC]?: 1 | -1 }
): ((doc1: DOC, doc2: DOC) => number) => {
	const keys = Object.keys(sortOptions);
	return (doc1: DOC, doc2: DOC): number => {
		for (const key of keys) {
			const asc = sortOptions[key];
			if (!asc) continue;
			const val1 = doc1[key];
			const val2 = doc2[key];
			if (val1 < val2) return -asc;
			if (val1 > val2) return asc;
		}
		return 0;
	};
};
