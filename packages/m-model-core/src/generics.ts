export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> &
	Partial<{ [key in K]: T[K] }>;
export type OptionalKeysOtherThan<T extends {}, K extends keyof T> = Partial<
	Omit<T, K>
> &
	{ [key in K]: T[K] };

export interface IAnyObj {
	[key: string]: any;
	[key: number]: any;
}

export type GetKeysOfType<T extends {}, Type> = NonNullable<
	{
		[k in keyof T]: T[k] extends Type ? k : never;
	}[keyof T]
>;
