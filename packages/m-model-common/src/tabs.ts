import { Dispatch } from "m-model-core";
import {
	defaultSpecialItemNameOfOtherTabsActions,
	jsonDateParser,
} from "./storage";

export const handleActionOfOtherTab = (e: StorageEvent, dispatch: Dispatch) => {
	if (e.key !== defaultSpecialItemNameOfOtherTabsActions) return;
	const lastAction = JSON.parse(
		localStorage[defaultSpecialItemNameOfOtherTabsActions],
		jsonDateParser
	);
	dispatch(lastAction);
};
