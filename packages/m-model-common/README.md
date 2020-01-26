# m-model-common
m-model-common is designed to be used with [m-model-core](https://www.npmjs.com/package/m-model-core) in browsers.
It supports synchronous storages, like localStorage and sessionStorage.
You can easily make your storage in sync with our model and even spread data into other tabs too.

**Please**, check [m-model-core](https://www.npmjs.com/package/m-model-core) first

## Creating model
```ts
// models/book.ts
import { createModel, createCRUDActionTypes } from "m-model-core";
import {
	getDefaultStorageSettings,
	getDefaultReducer,
	loadFromStorage,
	filterByLoadTime,
} from "m-model-common";
import { store } from "../store"; // you will see this file later

interface IBook {
	uuid: string;
	title: string;
	description: string;
}

const storageSettings = getDefaultStorageSettings("books", localStorage); // we will save documents in localStorage with item key `books`
const isLoadedRecentlyEnough = filterByLoadTime(2 * 60 * 1000); // only load documents that have been loaded 2 hours ago

const BookBaseModel = createModel<"uuid", IBook>({
	keyOfId: "uuid",
	dockeys: ["uuid", "title", "description"],
	actionTypes: createCRUDActionTypes("BOOK"),
	getInstances: (() => store.getState().books) as any,
	dispatch: (action => store.dispatch(action)) as any,
	subscribe: (listener => store.subscribe(listener)) as any,
	loadInstancesFromStorage: () =>
		loadFromStorage({
			storage: storageSettings.storage,
			key: storageSettings.itemName,
			filter: isLoadedRecentlyEnough,
		}),
});

export class Book extends BookBaseModel {
	static getRanking(book: Book) {
		const docs = this.getAllSync();
		let rating = 1;
		for (const doc of docs) {
			if (doc.rating > book.rating) {
				rating++;
			}
		}
		return rating;
	}
}

export const booksReducer = getDefaultReducer(storageSettings, () => Book); // use booksReducer instead of Book.reducer if you want to save data in (local)storage and support data synch accross tabs
```

In this example, we will use redux as our state container. To create store, we can cimply write
```ts
// store.ts
import { combineReducers } from "redux";
import { booksReducer } from "./models/book";

const appRootReducer = combineReducers({
	//... other reducers
	books: booksReducer,
	//... other reducers
});
export const store = createStore(appRootReducer);
```

And after creation of store, you can simply call `initialize` method to load documents from storage
```ts
Book.initialize();
```

Voilà! Updating/saving any data instance in one tab will be perceived by other models in other tabs. Refreshing the browser will load the previously loaded documents in model after `initialize` method is invoked.


## Extra
Documentation for `MetaInformation` class and usage of it will be added soon!
