import { mergeReducersWithStorage } from "./merge-reducers";
import { getDefaultStorageSettings, getDefaultReducer } from "./defaults";
import {
	MetaInformation,
	listenToLocalStorageChange,
	IMetaInfo,
} from "./meta-information";
import {
	IStorageSettings,
	IStorage,
	FakeStorage,
	loadFromStorage,
	filterByLoadTime,
	defaultSpecialActionKeyOfOtherTabsActions,
	defaultSpecialItemNameOfOtherTabsActions,
	jsonDateParser,
} from "./storage";
import { handleActionOfOtherTab } from "./tabs";

export {
	mergeReducersWithStorage,
	getDefaultStorageSettings,
	getDefaultReducer,
	MetaInformation,
	listenToLocalStorageChange,
	IStorage,
	IStorageSettings,
	FakeStorage,
	loadFromStorage,
	filterByLoadTime,
	IMetaInfo,
	defaultSpecialActionKeyOfOtherTabsActions,
	defaultSpecialItemNameOfOtherTabsActions,
	handleActionOfOtherTab,
	jsonDateParser,
};
