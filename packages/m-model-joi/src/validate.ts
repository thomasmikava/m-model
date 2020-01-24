import Joi from "@hapi/joi";

export default function validateSchema<T, K extends Joi.Schema>(
	obj,
	schema,
	options
): any {
	const validatorResult = Joi.validate(obj, schema, options);
	if (validatorResult.error !== null || validatorResult.value === undefined) {
		throw validatorResult.error;
	}
	const { value } = validatorResult;
	if (value === undefined) {
		throw new Error(JSON.stringify(validatorResult.error));
	}
	return validatorResult.value! as any;
}
