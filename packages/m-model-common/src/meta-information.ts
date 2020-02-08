import { IStorage } from "./storage";

export interface IMetaInfo<DOC extends {}> {
	setItem<K extends keyof DOC>(key: K, value: DOC[K]);
	clearStorage(): void;
	clearStorage(): void;
	initialize(): DOC | null;
}

export class MetaInformation<DOC extends {}> implements IMetaInfo<DOC> {
	public readonly data: Readonly<DOC>;
	private readonly storage: IStorage;
	private readonly storageKey: string;
	private readonly validate?: (doc: Record<any, any>) => DOC;
	private callbacks: { uniqueId: number; cb: any }[] = [];

	constructor(
		initialData: DOC,
		storage: IStorage,
		storageKey: string,
		validate?: (doc: Record<any, any>) => DOC
	) {
		this.data = initialData;
		this.storage = storage;
		this.storageKey = storageKey;
		this.validate = validate;
	}

	setItem<K extends keyof DOC>(key: K, value: DOC[K]) {
		(this.data[key] as any) = value;
		this.storage.setItem(this.storageKey, JSON.stringify(this.data));
		this.callAll(this.data);
	}

	clearStorage() {
		this.storage.removeItem(this.storageKey);
	}

	initialize(): DOC | null {
		const store = this.storage.getItem(this.storageKey);
		if (!store) return null;
		try {
			return this.replaceData(JSON.parse(store) as DOC);
		} catch (e) {
			return null;
		}
	}

	replaceData(data: DOC) {
		const validatedValue = this.validate ? this.validate(data) : data;
		this.storage.setItem(this.storageKey, JSON.stringify(validatedValue));
		(this.data as any) = validatedValue;
		this.callAll(validatedValue);
		return validatedValue;
	}

	subscribeDataChange(cb: (data: Readonly<DOC>) => void): () => void {
		const uniqueId = Math.random();
		this.callbacks.push({ uniqueId, cb });
		return () => {
			this.callbacks = this.callbacks.filter(
				e => e.cb === cb && e.uniqueId === uniqueId
			);
		};
	}

	private callAll(data: Readonly<DOC>) {
		const callbacks = this.callbacks;
		for (let i = 0; i < callbacks.length; i++) {
			callbacks[i].cb(data);
		}
	}
}

export const listenToLocalStorageChange = (
	storage: IStorage,
	metaInformationName: string | null | undefined,
	metaInformation: { initialize(): any }
) => {
	if (!metaInformationName) return;
	if (storage !== localStorage) return;
	let info = storage.getItem(metaInformationName);
	const onStorageChange = () => {
		const newInfo = storage.getItem(metaInformationName);
		if (newInfo === info) return;
		info = newInfo;
		metaInformation.initialize();
	};
	window.addEventListener("storage", onStorageChange);
	return () => {
		window.removeEventListener("storage", onStorageChange);
	};
};
