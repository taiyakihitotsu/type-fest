import type {BuildObject, BuildTuple, NonRecursiveType, ObjectValue} from './internal/index.d.ts';
import type {IsNever} from './is-never.d.ts';
import type {Paths} from './paths.d.ts';
import type {Simplify} from './simplify.d.ts';
import type {Merge} from './merge.d.ts';
import type {GreaterThan} from './greater-than.d.ts';
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
		? never
		: T extends UnknownArray ? PickDeepArray<T, Path>
			: T extends object ? Simplify<PickDeepObject<T, Path, ContPath>>
				: never;

/**
Pick an object from the given object by one path.
*/

type _PickDeepObject<RecordType extends object, P extends string | number, ContPath extends string = ''> = ObjectValue<RecordType, P> extends infer ObjectV
			? IsNever<ObjectV> extends false
				? BuildObject<P, ObjectV, RecordType>
				: never
			: never;

type _NextPickDeep<a, k> = (a extends any ? k extends keyof a ? a[k] extends string ? 0 : {[K in k]: a[k]} : a : never)
 
type PickDeepObject<RecordType extends object, P extends string | number, ContPath extends string = ''> =
    P extends `${infer RecordKeyInPath}.${infer SubPath}`
      ? SubPath extends `${MainSubPath}.${NextSubPath}`
		? ObjectValue<RecordType, RecordKeyInPath> extends infer ObjectV
			? IsNever<ObjectV> extends false
				? Simplify<BuildObject<RecordKeyInPath, InternalPickDeep<NonNullable<RecordType>, `.${SubPath}`, RecordKeyInPath>, RecordType>>
				: 'never0'
			: 'never1'
       : ObjectValue<RecordType, RecordKeyInPath> extends infer ObjectV
			? IsNever<ObjectV> extends false
				? [ObjectV, P, _NextPickDeep<ObjectV, SubPath>]// Simplify<BuildObject<SubPath, Get<ContPath, G>>>
				: 'never0'
			: 'never1'
    : _PickDeepObject<RecordType, P, ContPath>

type _MergeArray<A, B> = 
  A extends [infer HeadA, ...infer RestA]
    ? B extends [infer HeadB, ...infer RestB]
      ? [HeadA & HeadB, ..._MergeArray<RestA, RestB>]
    : [HeadA, ...RestA]
  : []

type MergeArray<A extends unknown[], B extends unknown[]> = A['length'] extends 0 ? B : B['length'] extends 0 ? A : true extends GreaterThan<A['length'], B['length']> ? _MergeArray<A, B> : _MergeArray<B, A>

type jakd = MergeArray<[unknown, 1, 2], [0, 1, 2]>
type feajke = MergeArray<[0, 1, 2], [unknown, 1, 2]>
type eiejf = MergeArray<[0, unknown, 2], [unknown, unknown, 2]>

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
