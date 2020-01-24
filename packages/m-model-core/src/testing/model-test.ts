import { createModel } from "../model";
import { performOp, performOpGen, performOpGen2 } from "./aa";
import { IModel } from "../model-types";

type DOC = { id: string; age: number; teachers: string[] };

const ModelBase = createModel<"id", string, DOC>({
	keyOfId: "id",
	getInstances: () => {
		return {
			bb: {
				info: { id: "bb", age: 6, teachers: ["aa"] },
				loadTime: new Date(),
			},
		};
	},
	dispatch: 5 as any,
	subscribe: 5 as any,
	loadInstancesFromStorage: 5 as any,
	syncronousCRUDActionTypes: 5 as any,
	dockeys: ["id", "age", "teachers"],
	storageSettings: {
		spreadActionsToOtherTabs: true,
	},
});

export class Books extends ModelBase {
	additionalInstanceMethod = () => {
		return 6;
	};
	additionalInstanceFunction(num: number) {
		return this.age + num;
	}

	static AddStatic(hey: string) {
		return 20;
	}
}

console.log(Books.AddStatic("a"));
const g = new Books({ id: "aa", age: 6, teachers: ["aa"] } as DOC);
const h = Books.findByIdSync("id");
if (h) {
	h.additionalInstanceFunction(8);
}
/* const books = Books.AddStatic("sa");
const book1 = books[0];
book1.additionalInstanceFunction(70); */
console.log(g.additionalInstanceFunction(10));

type a = typeof Books extends IModel ? number : string;

/* const sadsa = performOp<typeof Books>(Books);
sadsa[0].
const ggg = performOpGen(Books);
ggg[0].
const h2 = performOpGen2(Books);
h2[0]. */
