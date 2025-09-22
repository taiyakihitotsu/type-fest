import type {BuildObject, BuildTuple, NonRecursiveType, ObjectValue} from './internal/index.d.ts';
import type {IsNever} from './is-never.d.ts';
import type {IsTuple} from './is-tuple.d.ts';
import type {Paths} from './paths.d.ts';
import type {Simplify} from './simplify.d.ts';
import type {ArraySplice} from './array-splice.d.ts'
import type {Merge} from './merge.d.ts';
import type {GreaterThan} from './greater-than.d.ts';
import type {IsEqual} from './is-equal.d.ts'
import type {SetReadonly} from './set-readonly.d.ts';
import type {Or} from './or.d.ts'
import type {KeysOfUnion} from './keys-of-union.d.ts';
import type {Get} from './get.d.ts';
import type {ArrayTail} from './array-tail.d.ts'
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
                    ? MergeNarrow<{[P in PathUnion]: InternalPickDeep<T, P>}[PathUnion]>
//                  ? {[P in PathUnion]: InternalPickDeep<T, P>}[PathUnion]
			: T extends object
                              ? MergeNarrow<Simplify<PickDeepObject<T, PathUnion>>>
//                            ? Simplify<PickDeepObject<T, PathUnion>>
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

type _NextPickDeep<a, k> = (a extends any ? k extends keyof a ? Pick<a, k>[k] : a : never)
type _NextPickDeep1<a, k> = (a extends any ? k extends keyof a ? Pick<a, k> : a : never)

type jkafdj = PickDeepObject<{a: [0, 1, 2]}, 'a.0'>

// [todo] readonly imp
type _TupleUpsertAt<
  Tuple extends UnknownArray
, K extends (string | number)
, V
, R extends UnknownArray = []> = 
  Tuple extends readonly [infer Head, ...infer Rest extends UnknownArray]
    ? IsEqual<`${R['length']}`, `${K}`> extends true
      ? [...R, V,...Rest] 
    : _TupleUpsertAt<Rest, K, V, [...R, Head]>
  : never

type TupleUpsertAt<Tuple extends UnknownArray, K extends (string | number), V> = _TupleUpsertAt<Tuple, K, V>
  

type adjkd = TupleUpsertAt<[0,1,2,3], '3', true> //[0,1,2,true]
type adjkd00 = TupleUpsertAt<[0,1,2,3], '4', true> //never

type adfjkae = ObjectValue<{a: [0,1,2]}, 'a'>

// This is set for `BuildObject` order of arguments.
// type UpsertAt<
//   K extends (string | number)
// , V
// , Model extends (UnknownArray | object)> =
//   Model extends UnknownArray
//     ? TupleUpsertAt<Model, K, V>
//   : BuildObject<K, V, Model>

type PickDeepObject<RecordType extends object, P extends string | number, ContPath extends string = ''> =
    P extends `${infer RecordKeyInPath}.${infer SubPath}`
      ? SubPath extends `${infer _MainSubPath}.${infer _NextSubPath}`
		? ObjectValue<RecordType, RecordKeyInPath> extends infer ObjectV
			? IsNever<ObjectV> extends false
				? BuildObject<RecordKeyInPath, InternalPickDeep<ObjectV, SubPath>, ObjectV extends (UnknownArray | object) ? ObjectV : {}> // [todo] fix this
				: never
			: never
       : ObjectValue<RecordType, RecordKeyInPath> extends infer ObjectV
			? IsNever<ObjectV> extends false
//				? Simplify<BuildObject<RecordKeyInPath, Simplify<_NextPickDeep<ObjectV, SubPath>>, RecordType>>
                                ? ObjectV extends UnknownArray
                                  ? Simplify<BuildObject<RecordKeyInPath, PickDeepArray<ObjectV, SubPath>, RecordType>>
// [note] ObjectV is never even though `IsNever<Object>` returns `false`.
				: Simplify<BuildObject<RecordKeyInPath, Simplify<_NextPickDeep1<Simplify<_NextPickDeep<RecordType, RecordKeyInPath>>, SubPath>>, RecordType>> //Simplify<BuildObject<RecordKeyInPath, Simplify<_NextPickDeep<ObjectV, SubPath>>, RecordType>>
				: '0never'
			: '1never'
    : Simplify<_PickDeepObject<RecordType, P, ContPath>>
//   : never

// [todo] FirstArrayElement? in internal
type ArrayFirst<A> = A extends readonly [infer Head, ...infer _R] ? Head : A extends readonly [infer Head, ...infer _R] ? Head : never

// -- merge tuple
// This is used for an inner function of merge object shrinkly.
type _MergeTuple<
A extends UnknownArray
, B extends UnknownArray> = 
  A extends readonly [infer HeadA, ...infer RestA]
    ? B extends readonly [infer HeadB, ...infer RestB]
      ? [HeadA, HeadB] extends infer M extends [UnknownArray, UnknownArray]
        ? [MergeTuple<M[0], M[1]>, ..._MergeTuple<RestA, RestB>]
      : [HeadA, HeadB] extends infer M extends [object, object]
        ? [MergeNarrowObject<M[0], M[1]>, ..._MergeTuple<RestA, RestB>]
      // [note] don't use MergeNarrow directly, because it takes union type and its return A | B simply if not tuple nor object, so it transfers `0 | unknown` to `unknown` if its union is of element.
      : [HeadA & HeadB, ..._MergeTuple<RestA, RestB>]
    : [HeadA, ...RestA]
  : []

type MergeTuple<
  A extends UnknownArray
  , B extends UnknownArray> = 
  A['length'] extends 0
    ? B
  : B['length'] extends 0
    ? A
  : true extends GreaterThan<A['length'], B['length']>
      ? _MergeTuple<A, B>
    : _MergeTuple<B, A>
    
type jakd = MergeTuple<[unknown, 1, 2], [0, 1, 2]> // [0,1,2]
type feajke = MergeTuple<[0, 1, 2], [unknown, 1, 2]> // [0,1,2]
type feajke2 = MergeNarrow<[0, 1, 2] | [unknown, 1, 2]> // [0,1,2]
type feajkdd = MergeTuple<[0, 1, 2], []> // [0,1,2]
type feajkddef = MergeTuple<never, [0,1,2]> // [0,1,2]
type eiejf = MergeTuple<[0, unknown, 2], [unknown, unknown, 2]> // [0,unknown,2]
type eijff = MergeTuple<[0, unknown, 2, [0, unknown]], [unknown, unknown, 2, [unknown, 1]]> // [0, unknown, 2, [0, 1]]
type deeiejf = MergeTuple<readonly [0, unknown, 2], [unknown, unknown, 2]> // readonly [0,unknown,2]

type _MergeNarrowObject<A extends object, B extends object, KU extends (keyof A | keyof B), R extends object = {}> =
  LastOfUnion<KU> extends infer K
    ? K extends (keyof A) & (keyof B)
      // ? _MergeNarrowObject<A, B, Exclude<KU, K>, Simplify<BuildObject<K, A[K] & B[K], A & B>>>
      ? _MergeNarrowObject<A, B, Exclude<KU, K>, Simplify<R & BuildObject<K, MergeNarrow<A[K] | B[K]>, A & B>>>

    : K extends keyof A
      ? _MergeNarrowObject<A, B, Exclude<KU, K>, Simplify<R & BuildObject<K, A[K], A>>>
    : K extends keyof B
      ? _MergeNarrowObject<A, B, Exclude<KU, K>, Simplify<R & BuildObject<K, B[K], B>>>
    : R
  : never

// delete because of dup
// type kjakd = MergeNarrowObject<{readonly a: 1, c: 'a'}, {b?: 2, c: 'a'}>
type testmergenever = MergeNarrowObject<{readonly a: 1, c: 'a'}, never> // {readonly a: 1, c: 'a'}
type testmergeempty0 = MergeNarrowObject<{}, {readonly a: 1, c: 'a'}> // {readonly a: 1, c: 'a'}

type kjakd0 = MergeNarrowObject<{readonly a: 1, c: 'b'}, {b?: 2, c: 'a'}> // {readonly a: 1, b?: 2, c: never}
type jkjakd0 = MergeNarrowObject<{readonly a: 1, c: [0, unknown]}, {b?: 2, c: [unknown, 1]}> // {readonly a: 1, b?: 2, c: [0, 1]}
// delete because of dup
// type uidfa = _MergeNarrowObject<{readonly a: 1, c: [0, unknown]}, {b?: 2, c: [unknown, 1]}, Exclude<'a' | 'b' | 'c', 'c'>, Simplify<BuildObject<'c', MergeNarrow<{readonly a: 1, c: [0, unknown]}['c'] | {b?: 2, c: [unknown, 1]}['c']>, {readonly a: 1, c: [0, unknown]} & {b?: 2, c: [unknown, 1]}>>>

type MergeNarrowObject<
  A extends object
, B extends object> = 
  // [todo]
  Or<IsEqual<A, never>, IsEqual<A, {}>> extends true
    ? B
  : Or<IsEqual<B, never>, IsEqual<B, {}>> extends true
    ? A
  : _MergeNarrowObject<A, B, (KeysOfUnion<A> | KeysOfUnion<B>) extends infer K extends (keyof A | keyof B) ? K : never>

// -- merege only tuple
type LastOfUnion<T> =
UnionToIntersection<T extends any ? () => T : never> extends () => (infer R)
	? R
	: never;

export type MergeNarrow<
  T
, R extends UnknownArray = never
, M extends object = never> =
  LastOfUnion<T> extends infer L
    ? IsNever<T> extends false
      ? L extends UnknownArray
// [todo] rename
        ? MergeNarrow<Exclude<T, L>, MergeTuple<R, L>, M>
      : L extends object
// [todo] rename
        ? MergeNarrow<Exclude<T, L>, R, MergeNarrowObject<M, L>>
      : L | MergeNarrow<Exclude<T, L>, R, M>
    : IsEqual<[R, M], [[], {}]> extends true
       ? never
    :  R | M
  : never

type fff_feajke = MergeNarrow<[0, 1, 2] | [unknown, 1, 2]> // [0,1,2]
type jkadjkej = MergeNarrow<string | 1> // (string | 1)
type jkadjkej0 = MergeNarrow<string | 1 | [0]> // (string | 1 | [0])
type jkadjkej1 = MergeNarrow<string | 1 | ['x', unknown] | [unknown, 1]> // (string | 1 | ['x', 1])
// [todo] keep readonly
type jkadjkej2 = MergeNarrow<string | 1 | readonly ['x', unknown] | [unknown, 1]> // (string | 1 | ['x', 1])
type jkadjkej3 = MergeNarrow<string | 1 | readonly ['x', unknown] | [unknown, 1] | {a: 'some'} | {readonly b: 'thing', c?: '?'}> // (string | 1 | ['x', 1] | {a: 'some', b: 'thing'})
type jkadjkej4 = MergeNarrow<string | 1 | readonly ['x', unknown] | [unknown, 1] | {a: 'some'} | {readonly b: 'thing', c?: '?'}> // (string | 1 | ['x', 1] | {a: 'some', readonly b: 'thing', c?: '?'})

type _notobjnortuple = MergeNarrow<string | string> // string
type _object = MergeNarrow<{a: 1, c: number} | {b: 2, c: number}>
type _keepoptional_object = MergeNarrow<{a: 1, c: number} | {b?: 2, c: number}>
type _keepreadonly_object = MergeNarrow<{a: 1, c: number} | {readonly b: 2, c: number}>
type _keepreadonlyoptional_object = MergeNarrow<{a: 1, c: number} | {readonly b?: 2, c: number}>
type _tuple = MergeNarrow<[0, unknown, 2], [0, 1, unknown]>
type _keepreadonly_tuple = MergeNarrow<readonly [0, unknown, 2], [0, 1, unknown]>
type _keepreadonly_deeptuple = MergeNarrow<readonly [0, unknown, 2, [4, unknown, 6]], [0, 1, unknown, [unknown, 5, 6]]> // [0,1,2,[4,5,6]]

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


