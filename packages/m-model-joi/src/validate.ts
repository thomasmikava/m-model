import { AnySchema, ValidationOptions } from "joi";

export default function validateSchema(
	obj: any,
	schema: AnySchema,
	options: ValidationOptions = {
		stripUnknown: true,
	}
): any {
	const validatorResult = schema.validate(obj, options);
	if (validatorResult.error || validatorResult.value === undefined) {
		throw validatorResult.error;
	}
	const { value } = validatorResult;
	if (value === undefined) {
		throw new Error(JSON.stringify(validatorResult.error));
	}
	return validatorResult.value! as any;
}
