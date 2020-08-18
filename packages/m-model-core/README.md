# m-model-core
m-model-core brings back-end like model in front-end. It manages global state in OOP style.. You can use it with state containers such as [Redux](https://github.com/reduxjs/redux) without writing any single action or reducer.

It is inspired by [mongoose](https://github.com/Automattic/mongoose) and is intended to be used in front-end applications for synchronously manipulating the data. It is written in typescript.

## When to use
m-model-core is designed to handle data instances that can be represented as objects and have unique identifier, just like in most of the databases. Most of the time, it can be perfectly used for managing mongodb documents or mysql rows. 

## Creating first model
```ts
// models/user.ts
import { createModel, createCRUDActionTypes } from "m-model-core";
import { store } from "../store"; // you will see this file later

// declaring type of data that will be managed by our model
interface IUser {
	id: number;
	firstname: string;
	lastname: string;
}

// creating base class
const UserBaseModel = createModel<"id", IUser>({
	keyOfId: "id", // unique indentifier key for our documents
	dockeys: ["id", "firstname", "lastname"], // list of all properties that our raw document will have
	actionTypes: createCRUDActionTypes("USER"), // easily create action types by passing word which will be used in the middle of the action type names
	getInstances: (() => store.getState().users) as any, // Tell our model how to get instances. `as any` is required here to avoid circular dependence on typescript.
	dispatch: (action => store.dispatch(action)) as any, // Provide dispatch function to our model
	subscribe: (listener => store.subscribe(listener)) as any, // Provide subscribe function. Most likely, store will not be created yet, so we need to wrap it inside another function
});

export class User extends UserBaseModel {
    //custom instance method
	getFullname() {
		return this.firstname + "" + this.lastname;
	}

    // custom static method
	static findNameless() {
		return this.findManySync({ firstname: "" });
	}
}
```

In this example, we will use redux as our state container. To create store, we can cimply write
```ts
// store.ts
import { combineReducers } from "redux";
import { User } from "./models/user";

const appRootReducer = combineReducers({
	//... other reducers
	users: User.reducer,
	//... other reducers
});
export const store = createStore(appRootReducer);
```
As you see, our model ships with its own reducer. We are easily creating action types by calling `createCRUDActionTypes` function. 

## Using model

All the synchronous methods are provided for you. You will notice that mosth of the methods are ended with "Sync" suffix. This is intended, as unlike models in back-end, our model behaves synchronously and does not affect real database, just our store.

### Searching
You can search documents by id
```ts
const user1 = User.findByIdSync(12);
```
or query
```ts
const user2 = User.findOneSync({ firstname: "Tom", lastname: "Holland" });
if (user2) {
    // Note that search result will have all the instance methods that we have defined above
    console.log("Hello", user2.getFullname(), "!");
}
```
You can also search multiple documents the same way
```ts
const users = User.findManyByIdsSync([ 13, 183, 20 ]);
const tomUsers = User.findManySync({ firstname: "Tom" });
```

For geting all documents:
```ts
const allUsers = User.getAllSync();
```

### Updating
This will set firstname to Thomas for the first user that has firstname "Tom"
```ts
User.updateOneSync({ firstname: "Tom" }, { firstname: "Thomas" });
```
For updating multiple documents, simply use updateManySync
```ts
User.updateManySync({ firstname: "Tom" }, { firstname: "Thomas" });
```

On the other hand, you can direclty manipulate instance of User class;
```ts
const tom = User.findOneSync({ firstname: "Tom" });
if (tom) {
    tom.firstname = "Thomas";
    tom.saveSync(); // call saveSync to update document in store
}
```

### Deleting
You can delete by id or query
```ts
User.deleteByIdSync(13);
User.deleteOneSync({ firstname: "Thomas" }); // Sorry tom :'(
```
For deleting multiple documents, simply use the following methods:
```ts
User.deleteManyByIdsSync([ 13, 183, 20 ]);
User.deleteManySync({ lastname: "***" }); // don't want to offend any surname
```

For deleting all the documents:
```ts
User.clearAllSync();
```

### Creating
As opposed to most back-end models, we are not creating document directly in database. Most of the time, we are sending requests to get documents from server and then loading into our store using our model. That's why we use "load" instead of "create" when naming.
```ts
User.loadOneSync({
	id: 234,
	firstname: "Zendaya",
    lastname: "Coleman",
});
```
For multiple documents:
```ts
const users = await loadUsers(); // load users array from somewhere
User.loadManySync(users);
```

Alternatively, you can directly create instance of our model and call `saveSync` on it:
```ts
const boss = new User({
    id: 255,
    firstname: "Samuel",
    lastname: "Jackson"
});
boss.saveSync();
```

## Advanced
### Our helpful packages for models
- For easily make your store in sync with respect to other tabs, saving documents in localStorage and easily solving other problems in front-end, please check [m-model-common](https://www.npmjs.com/package/m-model-common) package. 
- For using optimized **react hooks** for searching documents in model and being reactive, check [m-model-react](https://www.npmjs.com/package/m-model-react)
- If you use [joi](https://www.npmjs.com/package/joi), see [m-model-joi](https://www.npmjs.com/package/m-model-joi) package as it ships with helper functions for validating documents

### Subscriptions
You can subscribe data modification in several ways.
- subscribeChange
- subscribeChangeById
- subscribeOneDocChangeByQuery
- subscribeManyDocsChangeByIds
- subscribeManyDocsChangeByQuery

They all return function, which will unsubscribe upon calling it.

### Additional configurations

You can easily add indexes to you model by providing `indices` during creating base model
```ts
const UserBaseModel = createModel<"id", IUser>({
	// ... other parameters
	indices: [
		{ fields: ["lastname"] },
		{ fields: ["firstname", "lastname"], unique: true },
	],
	// ... other parameters
})
```

You can easily add timestamps:
```ts
const UserBaseModel = createModel<"id", IUser>({
	// ... other parameters
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, // provide the keys which will be used as timestamps. Their type must be `Date` in document interface
	// ... other parameters
})
```
### loading many documents 
When you fetch all the documents from server, usually what you want to do is to replace all the documents with new ones.
```ts
User.loadManySync(docs);
```
However, if we had loaded some documents previously and they have been deleted by now, such documents will still exist in our store. That's why we need to clear our store first by using `clearAllSync`.
Alternatively, you can use write:
```ts
User.loadManySync(docs, "replaceAll");
```
and it will clear old documents and load new ones in one action.
Instead of "replaceAll", you can pass query too. For instance, you loaded all users with firstname "Tom", what you want is to delete all the local documents with "Tom" and load the fresh documents. In one action, you can:
```ts
User.loadManySync(docs, { firstname: "Tom" });
```

### Raw documents
If you have instance of the model, you can call `.toObject()` method to convert it into plain javascript objects:
```ts
const user = User.findByIdSync(34);
if (user) {
    console.log(user.toObject());
}
```

As we have seen, all the search and loading methods return model instances. If you want to get raw objects and avoid creating class instances, view the following codes:

```ts
const rawUser = User.findByIdSync(34, "raw");
const rawUsesr = User.findManyByIdsSync([34], "raw");
```
Same for `updateOneSync`, `updateManySync`, `getAllSync`, `loadOneSync` and `loadManySync` methods;
