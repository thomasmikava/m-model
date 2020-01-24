export type Diff<T, U> = T extends U ? never : T;
export type NotUndefined<T> = Diff<Diff<T, undefined>, null>;

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

export type WithKnownKeyType<
	T extends {},
	key extends keyof T,
	newType extends T[key]
> = { [k in keyof T]: k extends key ? newType : T[k] };

export type GetKeysOfType<T extends {}, Type> = NonNullable<
	{
		[k in keyof T]: T[k] extends Type ? k : never;
	}[keyof T]
>;

export type GetKeysOfLooseType<T extends {}, Type> = NonNullable<
	{
		[k in keyof T]: NonNullable<T[k]> extends Type ? k : never;
	}[keyof T]
>;
