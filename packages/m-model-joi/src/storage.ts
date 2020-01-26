import Joi from "@hapi/joi";
import validateSchema from "./validate";
import { IStoreInstances } from "m-model-core";

type patternType = "number" | "ObjectId" | "string" | RegExp;

const patterns = {
	number: /^\d+$/,
	string: /.+/,
	ObjectId: /[\da-f]{24}$/,
};

export function getStorageSchema(pattern: patternType, schema: any) {
	const patt =
		typeof pattern === "string" ? patterns[pattern] || pattern : pattern;
	return Joi.object().pattern(
		patt,
		Joi.object({
			info: schema.required(),
			loadTime: Joi.date(),
		}).unknown(true)
	);
}

export const validateStorage = (pattern: patternType, schema: any) => {
	const itemSchema = getStorageSchema(pattern, schema);
	return (items: IStoreInstances<any>): IStoreInstances<any> =>
		validateSchema(items, itemSchema as any, {
			stripUnknown: true,
		}) as any;
};
