import type {BuildObject, BuildTuple, NonRecursiveType, ObjectValue} from './internal/index.d.ts';
import type {IsNever} from './is-never.d.ts';
import type {Paths} from './paths.d.ts';
import type {Simplify} from './simplify.d.ts';
import type {Merge} from './merge.d.ts';
import type {GreaterThan} from './greater-than.d.ts';
import type {KeysOfUnion} from './keys-of-union.d.ts';
import type {Get} from './get.d.ts';
import type {UnionToIntersection} from './union-to-intersection.d.ts';
import type {UnknownArray} from './unknown-array.d.ts';

/**
Pick properties from a deeply-nested object.

It supports recursing into arrays.

Use-case: Distill complex objects down to the components you need to target.

@example
```
import type {PickDeep, PartialDeep} from 'type-fest';

type Configuration = {
	userConfig: {
		name: string;
		age: number;
		address: [
			{
				city1: string;
				street1: string;
			},
			{
				city2: string;
				street2: string;
			}
		]
	};
	otherConfig: any;
};

type NameConfig = PickDeep<Configuration, 'userConfig.name'>;
// type NameConfig = {
// 	userConfig: {
// 		name: string;
// 	}
// };

// Supports optional properties
type User = PickDeep<PartialDeep<Configuration>, 'userConfig.name' | 'userConfig.age'>;
// type User = {
// 	userConfig?: {
// 		name?: string;
// 		age?: number;
// 	};
// };

// Supports array
type AddressConfig = PickDeep<Configuration, 'userConfig.address.0'>;
// type AddressConfig = {
// 	userConfig: {
// 		address: [{
// 			city1: string;
// 			street1: string;
// 		}];
// 	};
// }

// Supports recurse into array
type Street = PickDeep<Configuration, 'userConfig.address.1.street2'>;
// type Street = {
// 	userConfig: {
// 		address: [
// 			unknown,
// 			{street2: string}
// 		];
// 	};
// }
```

@category Object
@category Array
*/
export type PickDeep<T, PathUnion extends Paths<T>> =
	T extends NonRecursiveType
		? never
		: T extends UnknownArray
                  ? {[P in PathUnion]: InternalPickDeep<T, P>}[PathUnion]
			// ? UnionToIntersection<{
			// 	[P in PathUnion]: InternalPickDeep<T, P>;
			// }[PathUnion]
			// >
			: T extends object
                            ? Simplify<PickDeepObject<T, PathUnion>>
				// ? Simplify<UnionToIntersection<{
				// 	[P in PathUnion]: InternalPickDeep<T, P>;
				// }[PathUnion]>>
				: never;

/**
Pick an object/array from the given object/array by one path.
*/
type InternalPickDeep<T, Path extends string | number, ContPath extends string = ''> =
	T extends NonRecursiveType
		? T
		: T extends UnknownArray ? PickDeepArray<T, Path>
			: T extends object ? Simplify<PickDeepObject<T, Path, ContPath>>
				: T;

/**
Pick an object from the given object by one path.
*/

type _PickDeepObject<RecordType extends object, P extends string | number, ContPath extends string = ''> = ObjectValue<RecordType, P> extends infer ObjectV
			? IsNever<ObjectV> extends false
				? BuildObject<P, ObjectV, RecordType>
				: never
			: never;

type _NextPickDeep<a, k> = (a extends any ? k extends keyof a ? Pick<a, k> : a : never)
 
type PickDeepObject<RecordType extends object, P extends string | number, ContPath extends string = ''> =
    P extends `${infer RecordKeyInPath}.${infer SubPath}`
      ? SubPath extends `${infer _MainSubPath}.${infer _NextSubPath}`
		? ObjectValue<RecordType, RecordKeyInPath> extends infer ObjectV
			? IsNever<ObjectV> extends false
				? BuildObject<RecordKeyInPath, InternalPickDeep<ObjectV, SubPath>, ObjectV extends object ? ObjectV : {}>

				: 'never0'
			: 'never1'
       : ObjectValue<RecordType, RecordKeyInPath> extends infer ObjectV
			? IsNever<ObjectV> extends false
				? Simplify<BuildObject<RecordKeyInPath, Simplify<_NextPickDeep<ObjectV, SubPath>>, RecordType>>
				: 'never2'
			: 'never3'
    : Simplify<_PickDeepObject<RecordType, P, ContPath>>

// -- merge tuple
// This is used for an inner function of merge object shrinkly.
type _MergeTuple<A, B> = 
  A extends [infer HeadA, ...infer RestA]
    ? B extends [infer HeadB, ...infer RestB]
      ? [HeadA, HeadB] extends infer M extends [unknown[], unknown[]]
        ? [MergeTuple<M[0], M[1]>, ..._MergeTuple<RestA, RestB>]
      : [HeadA & HeadB, ..._MergeTuple<RestA, RestB>]
    : [HeadA, ...RestA]
  : []

type MergeTuple<A extends unknown[], B extends unknown[]> = A['length'] extends 0 ? B : B['length'] extends 0 ? A : true extends GreaterThan<A['length'], B['length']> ? _MergeTuple<A, B> : _MergeTuple<B, A>

type jakd = MergeTuple<[unknown, 1, 2], [0, 1, 2]> // [0,1,2]
type feajke = MergeTuple<[0, 1, 2], [unknown, 1, 2]> // [0,1,2]
type eiejf = MergeTuple<[0, unknown, 2], [unknown, unknown, 2]> // [0,unknown,2]
type eiejff = MergeTuple<[0, unknown, 2, [0, unknown]], [unknown, unknown, 2, [unknown, 1]]> // [0, unknown, 2, [0, 1]]

type _MergeNarrowObject<A extends object, B extends object, KU extends (keyof A | keyof B), R extends object = {}> =
  LastOfUnion<KU> extends infer K
    ? K extends (keyof A) & (keyof B)
      ? _MergeNarrowObject<A, B, Exclude<KU, K>, Simplify<BuildObject<K, A[K] & B[K], A & B>>>
    : K extends keyof A
      ? _MergeNarrowObject<A, B, Exclude<KU, K>, Simplify<B & BuildObject<K, A[K], A>>>
    : K extends keyof B
      ? _MergeNarrowObject<A, B, Exclude<KU, K>, Simplify<A & BuildObject<K, B[K], B>>>
    : R
  : never

type MergeNarrowObject<A extends object, B extends object> = _MergeNarrowObject<A, B, (KeysOfUnion<A> | KeysOfUnion<B>) extends infer K extends (keyof A | keyof B) ? K : never>

type kjakd = MergeNarrowObject<{readonly a: 1, c: 'a'}, {b?: 2, c: 'a'}>
type kjakd0 = MergeNarrowObject<{readonly a: 1, c: 'b'}, {b?: 2, c: 'a'}>

// -- merege only tuple
type LastOfUnion<T> =
UnionToIntersection<T extends any ? () => T : never> extends () => (infer R)
	? R
	: never;

export type MergeOnlyTuple<T, R extends unknown[] = [], M extends object = {}> =
LastOfUnion<T> extends infer L ? 
IsNever<T> extends false
	? L extends unknown[] // todo this type
          ? MergeOnlyTuple<Exclude<T, L>, MergeTuple<R, L>, M>
//        : L extends object
        :  L | MergeOnlyTuple<Exclude<T, L>, R, M>
  : [] extends R ? never : R : never

type jkadjkej = MergeOnlyTuple<string | 1> // (string | 1)
type jkadjkej0 = MergeOnlyTuple<string | 1 | [0]> // (string | 1 | [[0]])
type jkadjkej1 = MergeOnlyTuple<string | 1 | ['x', unknown] | [unknown, 1]> // (string | 1 | ['x', 1])


type MergeNarrow<A, B> =
  [A, B] extends infer M extends [unknown[], unknown[]]
    ? MergeOnlyTuple<M[0], M[1]>
  : [A, B] extends infer M extends [object, object]
    ? MergeNarrowObject<M[0], M[1]>
  : (A & B)

type adjk = MergeNarrow<{a: 1}, {b?: 2}>


/**
Pick an array from the given array by one path.
*/
type PickDeepArray<ArrayType extends UnknownArray, P extends string | number> =
	// Handle paths that are `${number}.${string}`
	P extends `${infer ArrayIndex extends number}.${infer SubPath}`
		// When `ArrayIndex` is equal to `number`
		? number extends ArrayIndex
			? ArrayType extends unknown[]
				? Array<InternalPickDeep<NonNullable<ArrayType[number]>, SubPath>>
				: ArrayType extends readonly unknown[]
					? ReadonlyArray<InternalPickDeep<NonNullable<ArrayType[number]>, SubPath>>
					: never
			// When `ArrayIndex` is a number literal
			: ArrayType extends unknown[]
				? [...BuildTuple<ArrayIndex>, InternalPickDeep<NonNullable<ArrayType[ArrayIndex]>, SubPath>]
				: ArrayType extends readonly unknown[]
					? readonly [...BuildTuple<ArrayIndex>, InternalPickDeep<NonNullable<ArrayType[ArrayIndex]>, SubPath>]
					: never
		// When the path is equal to `number`
		: P extends `${infer ArrayIndex extends number}`
			// When `ArrayIndex` is `number`
			? number extends ArrayIndex
				? ArrayType
				// When `ArrayIndex` is a number literal
				: ArrayType extends unknown[]
					? [...BuildTuple<ArrayIndex>, ArrayType[ArrayIndex]]
					: ArrayType extends readonly unknown[]
						? readonly [...BuildTuple<ArrayIndex>, ArrayType[ArrayIndex]]
						: never
			: never;
