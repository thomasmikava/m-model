import { Dispatch } from "m-model-core";
import {
	defaultSpecialItemNameOfOtherTabsActions,
	jsonDateParser,
} from "./storage";

export const handleActionOfOtherTab = (e: StorageEvent, dispatch: Dispatch) => {
	if (e.key !== defaultSpecialItemNameOfOtherTabsActions) return;
	if (!localStorage[defaultSpecialItemNameOfOtherTabsActions]) return;
	try {
		const lastAction = JSON.parse(
			localStorage[defaultSpecialItemNameOfOtherTabsActions],
			jsonDateParser
		);
		dispatch(lastAction);
	} catch (e) {
		return;
	}
};
