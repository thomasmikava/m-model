import { IModel, ModelClass } from "../model-types";
import { IDocument } from "../crud-actions";

export function performOp<model extends IModel>(model: model) {
	return model.getAllSync();
}

export function performOpGen<
	IdKey extends string,
	IdType extends string | number,
	DOC extends IDocument<IdKey, IdType>,
	model extends ModelClass<IdKey, IdType, DOC, any>
>(model: model) {
	return model.getAllSync();
}

export function performOpGen2<model extends IModel>(
	model: model
): InstanceType<model>[] {
	return model.getAllSync();
}
