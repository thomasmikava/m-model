import Joi from "@hapi/joi";
import validateSchema from "./validate";
import { IStoreInstances } from "m-model-core";

export function getStorageSchema(
	pattern: "number" | "ObjectId" | RegExp,
	schema: any
) {
	const patt =
		pattern === "number"
			? /^\d+$/
			: pattern === "ObjectId"
			? /[\da-f]$/
			: pattern;
	return Joi.object().pattern(
		patt,
		Joi.object({
			info: schema.required(),
			loadTime: Joi.date(),
		})
	);
}

export const validateStorage = (
	pattern: "number" | "ObjectId" | RegExp,
	schema: any
) => {
	const itemSchema = getStorageSchema(pattern, schema);
	return (items: IStoreInstances<any>): IStoreInstances<any> =>
		validateSchema(items, itemSchema as any, {
			stripUnknown: true,
		}) as any;
};
