import { MetaInformation, IStorage } from "m-model-common";
import validateSchema from "./validate";

export class JoiMetaInfo<DOC extends {}> extends MetaInformation<DOC> {
	constructor(
		initialData: DOC,
		storage: IStorage,
		storageKey: string,
		schema: any
	) {
		const validate = (data: any) => {
			return validateSchema(data, schema, {
				stripUnknown: true,
			});
		};
		super(initialData, storage, storageKey, validate);
	}
}
