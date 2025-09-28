import type {Get} from './get.d.ts';
import type {TupleOf} from './tuple-of.d.ts';
import type {BuildObject, NonRecursiveType, ObjectValue} from './internal/index.d.ts';
import type {Paths} from './paths.d.ts';
import type {Simplify} from './simplify.d.ts';
import type {GreaterThan} from './greater-than.d.ts';
import type {IsEqual} from './is-equal.d.ts';
import type {Or} from './or.d.ts';
import type {UnionToTuple} from './union-to-tuple.d.ts'
import type {NonNegative, IsNegative} from './numeric.d.ts'
import type {IsTuple} from './is-tuple.d.ts'
import type {KeysOfUnion} from './keys-of-union.d.ts';
import type {UnionToIntersection} from './union-to-intersection.d.ts';
import type {UnknownArray} from './unknown-array.d.ts';


type Test_Pick_0 = _Pick<[0,1], 1>; // 1
type Test_Pick_1 = _Pick<{a: 'aa'}, 'a'>; // {a: 'aa'}
type _Pick<T, Key extends (string | number)> =
  T extends UnknownArray
    ? T[Key extends keyof T ? Key : never]
  : 
  {[k in keyof T as `${k extends (string | number) ? k : never}` extends `${Key}` ? k : never]: T[k]};

/*
Force `Get` if possible; otherwise, return `never`.
type Test_Get_0 = _Get<{2: 'x'}, '2'>; // 'x'
type Test_Get_1 = _Get<{'2': 'x'}, '2'>; // 'x'
type Test_Get_2 = _Get<{2: 'x'}, 2>; // 'x'
type Test_Get_3 = _Get<{'2': 'x'}, 2>; // 'x'
type Test_Get_4 = _Get<['x', 'xx'], 0>; // 'x'
type Test_Get_5 = _Get<['x', 'xx'], '0'>; // 'x'
type Test_Get_6 = _Get<['x', 'xx'], '2'> // never
type Test_Get_7 = _Get<{a: 'x'}, 'b'> // never
type Test_Get_8 = _Get<[0,1,2], `${number}`> // 0 | 1 | 2
type Test_Get_9 = _Get<string[], `${number}`> // string
*/
// [todo] rename
type _Get<T, Key extends PropertyKey> =
  Key extends keyof T
    ? T[Key]
    : Key extends string | number
      ? StringToNumber<`${Key}`> extends infer Num extends number
        ? IsNever<Num> extends false
          ? `${Key}` extends `${keyof T extends (string | number) ? keyof T : never}`
            ? T[(`${Key}` extends infer K extends keyof T ? K : never)] |
              T[(Num extends infer K extends keyof T ? K : never)]
            /* `${number}` case */
            : `${Key}` extends `${infer N extends number}`
              ? IsEqual<N, number> extends true
                ? T extends Array<infer ArrayType>
                  ? ArrayType
                  : never
                : never
              : never
          : never
        : never
      : never;

/*
Return a number which a string expresses; otherwise return `never`. 

type Test_StringToNumber_0 = StringToNumber<'s'>; // never
type Test_StringToNumber_1 = StringToNumber<'0'>; // 0
*/
type StringToNumber<T extends string> = T extends `${infer N extends number}` ? N : never;

// [todo] 一旦これで書いてるけど後でIsKeyOfに統合したい
/*
type Test_CollKeyOf_0 = CollKeyOf<[0, 1], 1>; // true
type Test_CollKeyOf_1 = CollKeyOf<[0, 1], 3>; // false
type Test_CollKeyOf_2 = CollKeyOf<[0, 1], -1>; // false
type Test_CollKeyOf_3 = CollKeyOf<[0, 1], 's'>; // false
type Test_CollKeyOf_4 = CollKeyOf<[0, 1], '1'>; // true
type Test_CollKeyOf_5 = CollKeyOf<[0, 1], '3'>; // false
type Test_CollKeyOf_6 = CollKeyOf<[0, 1], '-1'>; // false
type Test_CollKeyOf_7 = CollKeyOf<[0, 1], `${number}`>; // true
type Test_CollKeyOf_8 = CollKeyOf<Array<{a: 0}>, `${number}`>; // true
type Test_CollKeyOf_9 = CollKeyOf<{0: 'a0'}, 0> // true
type Test_CollKeyOf_10 = CollKeyOf<{'0': 'a0'}, 0> // true
type Test_CollKeyOf_11 = CollKeyOf<{0: 'a0'}, '0'> // true
type Test_CollKeyOf_12 = CollKeyOf<{'0': 'a0'}, 0> // true
*/
type CollKeyOf<A, K extends PropertyKey> = 
  A extends UnknownArray
    ? IsEqual<IsTuple<A>, true> extends false
      ? K extends `${number}`
        ? true
      : K extends (string | number)
        ? IsEqual<false, IsNegative<StringToNumber<`${K}`>>>
      : 89
    : K extends (string | number)
      ? [A['length'], IsEqual<A['length'], number>] extends [number, false]
        ? IsEqual<false, IsNegative<StringToNumber<`${K}`>>> extends true
          ? GreaterThan<A['length'], StringToNumber<`${K}`>> extends true
            ? true
          : false
        : false
      : false
    : false
  : A extends object
    ? K extends (string | number)
      ? IsKeyOf<A, K>
    : false
  : false;

/* [todo] LooseKeyOf とかにしてもいい */
type IsKeyOf<a, k extends string | number> = `${k}` extends `${keyof a extends (string | number) ? keyof a : never}` ? true : false;

type GetOrSelf<a, k extends (number | string)> = (a extends any ? IsEqual<true, IsKeyOf<a, k>> extends true ? Get<a, `${k}`> : a : never);

// type PickOrSelf<a, k extends (number | string)> = (a extends any ? IsEqual<true, IsKeyOf<a, k>> extends true ? _Pick<a, k> : a : never);
// type PickOrSelf<a, k extends (number | string)> = (a extends object ? IsEqual<true, IsKeyOf<a, k>> extends true ? _Pick<a, k> : never : a);
/**/
// [todo] use `TupleOf`

type Test_PickOrSelf_0 = PickOrSelf<string, 'a'>; // string
type Test_PickOrSelf_1 = PickOrSelf<{readonly a?: 0}, 'a'>; // {readonly a?: 0}
type Test_PickOrSelf_2 = PickOrSelf<{2?: 0}, '2'>; // {2?: 0}
type Test_PickOrSelf_3 = PickOrSelf<{2?: 0}, 2>; // {2?: 0}
type Test_PickOrSelf_4 = PickOrSelf<{'2': 0}, 2>; // {'2': 0}

type PickOrSelf<a, k extends (number | string)> = (a extends UnknownArray ? _Pick<a, k> : a extends object ? IsEqual<true, IsKeyOf<a, k>> extends true ? _Pick<a, k> : never : a);

// type PickOrSelf<a, k extends (number | string)> = (a extends UnknownArray ? [...TupleOf<StringToNumber<`${k}`>>, _Pick<a, k>] : a extends object ? IsEqual<true, IsKeyOf<a, k>> extends true ? _Pick<a, k> : never : a);


type LastOfUnion<T> =
UnionToIntersection<T extends any ? () => T : never> extends () => (infer R)
	? R
	: never;

// [todo] local
type IsNever<MaybeNever> = IsEqual<never, MaybeNever>;

/*
Merge only objects of union type.

type Test_MergeOnlyObjectUnion = MergeOnlyObjectUnion<0 | string | {readonly a: 0} | {b?: 2} | [0] | [1]>; // string | 0 | [0] | [1] | {readonly a: 0; b?: 2} 
*/
type MergeOnlyObjectUnion<MaybeObjectUnion> = _MergeOnlyObjectUnion<MaybeObjectUnion>
type _MergeOnlyObjectUnion<MaybeObjectUnion, ObjectStack = {}, UnionStack = never> =
	LastOfUnion<MaybeObjectUnion> extends infer L
		? IsNever<L> extends false
			? L extends UnknownArray
				? _MergeOnlyObjectUnion<Exclude<MaybeObjectUnion, L>, ObjectStack, UnionStack | L>
				: L extends object
					? _MergeOnlyObjectUnion<Exclude<MaybeObjectUnion, L>, ObjectStack & L, UnionStack>
					: _MergeOnlyObjectUnion<Exclude<MaybeObjectUnion, L>, ObjectStack, UnionStack | L>
			: UnionStack | Simplify<IsEqual<{}, ObjectStack> extends false ? ObjectStack : never>
		: never;


/*
This doesn't fail with non-object type, to safely support `keyof` with union types including objects.

type Test_CoerceKeyof = CoerceKeyof<string | {x: 0}>;
// "x"
*/
type CoerceKeyof<R> = R extends object ? keyof R extends (string | number) ? keyof R : never : never;

/* `BuildObject` supporting `${number}`. */
type Build<K extends PropertyKey, L, M extends object | UnknownArray> =
  `${K extends string ? K : never}` extends `${infer N extends number}`
    ? IsEqual<N, number> extends true
      ? Array<L>
      : BuildObject<K, L, M>
    : BuildObject<K, L, M>;

/*
Coerce with union types including objects.
*/
//type PickDeep<P, PathTree extends PathTreeType> = P extends object ? PathTree extends string ? ['pt', PathTree] : _PickDeep<P, PathTree, keyof PathTree> : P
export type PickDeep<T, PathUnion extends Paths<T>> = PPPP<T, MergeNarrow<PathToTree<PathUnion>> extends infer M extends PathTreeType ? M : never>

type PPPP<P, PathTree extends PathTreeType> =
  P extends UnknownArray
    ? [_PickDeep<P, PathTree, keyof PathTree>][0]
    : P extends object
      ? [_PickDeep<P, PathTree, keyof PathTree>][0]
      : P;

type _PickDeep<Parent, PathTree extends PathTreeType, K extends keyof PathTree> =
  LastOfUnion<K> extends infer L extends keyof PathTree
    ? IsNever<L> extends false
      ? L extends number | string
        ? IsEqual<true, CollKeyOf<Parent, L>> extends true
          /* Detect an end of path. */
          ? IsEqual<LeafMark, PathTree[L]> extends true
              ? Parent extends UnknownArray
                /* `${number}` case. */
                ? IsEqual<IsTuple<Parent>, false> extends true
                  ? 'never' // [todo] 何してるかわからん
                  : PickOrSelf<Parent, L> // [todo] 同じく
                /*  */
                : MergeOnlyObjectUnion<
                    Simplify<PickOrSelf<Parent, L>> | _PickDeep<Parent, PathTree, Exclude<K, L>>
                  >
              : _Get<PathTree, L> extends infer NextPathTree
                ? _Get<Parent, L> extends infer NextParent
                ? MergeOnlyObjectUnion<
Simplify<
  Build<
L, 

NextParent extends infer AAA extends UnknownArray
  /* NextParent: array */
  ? IsEqual<IsTuple<AAA>, false> extends true
              /* Via tuple to prevent distribution. */
    ? [AAA extends Array<infer _>
      ? _Get<NextPathTree, CoerceKeyof<NextPathTree>> extends LeafMark
        ? IsEqual<`${number}`, `${CoerceKeyof<NextPathTree>}`> extends true
          /* `leadingSpreadArray2_Actual` in `test-d/pick-deep.ts` */
          ? [NextParent, Array<PickOrSelf<NextParent, CoerceKeyof<NextPathTree>>>][0]
          /* `tailingSpreadArray1_Actual` in `test-d/pick-deep.ts` */
          : [...TupleOf<StringToNumber<`${CoerceKeyof<NextPathTree>}`>>, PickOrSelf<NextParent, CoerceKeyof<NextPathTree>>]
        /* not end */
        : PPPP<PickOrSelf<NextParent, CoerceKeyof<NextPathTree>>, _Get<NextPathTree, CoerceKeyof<NextPathTree>> extends infer G extends PathTreeType
            ? G
            : never> extends infer Result
              ? IsEqual<`${number}`, `${CoerceKeyof<NextPathTree>}`> extends true
                /* `leadingSpreadArray1_Actual` in `test-d/pick-deep.ts` */
                ? [Array<Result>][0]
                /* `tailingSpreadArray2_Actual` in `test-d/pick-deep.ts`. */
                : [[...TupleOf<StringToNumber<`${CoerceKeyof<NextPathTree>}`>>, Result]][0]
              : never
      : never][0]
      // [todo] refac
    /* NextParent: tuple */
    : [ PickOrSelf<
          NextParent
  	, CoerceKeyof<PathTree[L]>>
  	, PPPP< NextParent
  	      , PathTree[L] extends PathTreeType ? PathTree[L] : never >
      ][1]
  /* NextParent: object */
  : [PPPP<Simplify<PickOrSelf<NextParent, CoerceKeyof<Simplify<PickOrSelf<NextParent, CoerceKeyof<PathTree[L]>>>>>>, PathTree[L] extends PathTreeType ? PathTree[L] : never>][0],

 Parent extends object ? Parent : never
>>
                  | _PickDeep<Parent, PathTree, Exclude<K, L>>
                >
          : never // [todo] infer
          : never // [todo] infer
          : never
        : never
      : never
    : never;

// [todo]
// これらもテストケースとして追加する
type panda = {a: string | {b: 1 | true, c: 2, d: {g: {f: 9, h: 10}}} | {b: '1', c: '2'}, x: 10 | 11, y: [[0, 1], 2, 3]}
type pandsak = MergeNarrow<PathToTree<`a.${'b' | 'c'}` | 'x'>>
type Path = PPPP<panda, pandsak>
type pandsak1 = MergeNarrow<PathToTree<`a.d.g.f`>>
type Path1 = PPPP<panda, pandsak1>
type pandsak2 = MergeNarrow<PathToTree<`y.0`>>
type Path2 = PPPP<panda, pandsak2>

type landda = {0: string}
type landdsak = MergeNarrow<PathToTree<`0`>>
type Path3 = PPPP<landda, landdsak>

type landda1 = {'2': {0: string}}
type landdsak1 = MergeNarrow<PathToTree<`2.0`>>
type Path4 = PPPP<landda1, landdsak1>

type jkafje = [[[111, 222,333], 22, 33], 1, 2]
type jakdf = MergeNarrow<PathToTree<`0.${number}.${number}`>>
type Path5 = PPPP<jkafje, jakdf>

// type aaget = _Get<landda1, 2>


type LeafMark = ''
type PathTreeType = {[K in string]: PathTreeType | LeafMark}

/*

type Test_PathToTree = MergeNarrow<PathToTree<`a.b.${'c'|'d'}.x` | `d.b.${'c'|'d'}`>>;
// {d: {b: {d: ''; c: ''}};
//  a: {b: {d: {x: ''}; c: {x: ''}}}}
*/
// [todo]
// 今MergeNarrowをUnionMerge->IntersectionMergeに改造しているので注意
type PathToTree<S> = 
  S extends `${infer F}.${infer Next}`
    ? Next extends `${infer _}.${infer __}`
      ? {[K in F]: PathToTree<Next>}
      : {[K in F]: {[L in Next]: LeafMark}}
    : {[K in S extends string ? S : never]: LeafMark};



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
// export type XXXPickDeep<T, PathUnion extends Paths<T>> =
// 	T extends NonRecursiveType
// 		? never
// 		: T extends UnknownArray
// 			? MergeNarrow<{[P in PathUnion]: InternalPickDeep<T, P>}[PathUnion]>
// 			: T extends object
// 				? MergeNarrow<Simplify<PickDeepObject<T, PathUnion>>>
// 				: never;

/**
Pick an object/array from the given object/array by one path.
*/
// type InternalPickDeep<T, Path extends (string | number)> =
// 	T extends NonRecursiveType
// 		? T
// 		: T extends UnknownArray ? PickDeepArray<T, Path>
// 			: T extends object ? Simplify<PickDeepObject<T, Path>>
// 				: T;

// type _PickDeepObject<RecordType extends object, P extends (string | number)> =
// 	ObjectValue<RecordType, P> extends infer ObjectV
// 		? IsNever<ObjectV> extends false
// 			? BuildObject<P, ObjectV, RecordType>
// 			: never
// 		: never;

/**
Pick an object from the given object by one path.
*/
// type PickDeepObject<RecordType extends object, P extends (string | number)> =
// 	P extends `${infer RecordKeyInPath}.${infer SubPath}`
// 		// `ObjectV` doesn't extends `(UnknownArray | object)` when the union type includes members that don't satisfy that constraint.
// 		// In such cases, `InternalPickDeep` returns the original type itself.
// 		// This allows union types to preserve their structure.
// 		? ObjectValue<RecordType, RecordKeyInPath> extends infer ObjectV
// 			? IsNever<ObjectV> extends false
// 				? SubPath extends `${infer _MainSubPath}.${infer _NextSubPath}`
// 					? BuildObject<RecordKeyInPath, InternalPickDeep<ObjectV, SubPath>, ObjectV extends (UnknownArray | object) ? ObjectV : never>
// 					: ObjectV extends UnknownArray
// 						? Simplify<BuildObject<RecordKeyInPath, PickDeepArray<ObjectV, SubPath>, RecordType>>
// 						: Simplify<BuildObject<RecordKeyInPath, PickOrSelf<GetOrSelf<RecordType, RecordKeyInPath>, SubPath>, RecordType>>
// 				: never
// 			: never
// 		// Case where the path is not concatenated.
// 		: Simplify<_PickDeepObject<RecordType, P>>;

// /**
// Pick an array from the given array by one path.
// */
// type PickDeepArray<ArrayType extends UnknownArray, P extends string | number> =
// 	// Handle paths that are `${number}.${string}`
// 	P extends `${infer ArrayIndex extends number}.${infer SubPath}`
// 		// When `ArrayIndex` is equal to `number`
// 		? number extends ArrayIndex
// 			? ArrayType extends unknown[]
// 				? Array<InternalPickDeep<NonNullable<ArrayType[number]>, SubPath>>
// 				: ArrayType extends readonly unknown[]
// 					? ReadonlyArray<InternalPickDeep<NonNullable<ArrayType[number]>, SubPath>>
// 					: never
// 			// When `ArrayIndex` is a number literal
// 			: ArrayType extends unknown[]
// 				? [...TupleOf<ArrayIndex>, InternalPickDeep<NonNullable<ArrayType[ArrayIndex]>, SubPath>]
// 				: ArrayType extends readonly unknown[]
// 					? readonly [...TupleOf<ArrayIndex>, InternalPickDeep<NonNullable<ArrayType[ArrayIndex]>, SubPath>]
// 					: never
// 		// When the path is equal to `number`
// 		: P extends `${infer ArrayIndex extends number}`
// 			// When `ArrayIndex` is `number`
// 			? number extends ArrayIndex
// 				? ArrayType
// 				// When `ArrayIndex` is a number literal
// 				: ArrayType extends unknown[]
// 					? [...TupleOf<ArrayIndex>, ArrayType[ArrayIndex]]
// 					: ArrayType extends readonly unknown[]
// 						? readonly [...TupleOf<ArrayIndex>, ArrayType[ArrayIndex]]
// 						: never
// 			: never;

/*
This is a local function that merges multiple objects obtained as a union type when the path in `PickDeep` is a union type.

Assuming `T` is a union type:
 - If a member `t` of `T` is not a collection type, it is returned as is.
 - If `t` is an object, each property is narrowed via union, and `MergeNarrow` is applied to any property that is a collection (which would also be a union type). The results are then merged.
 - The same logic applies to tuples, but merged via intersection.

Here is an example that explains why tuples are merged via intersection and objects via union.

type testMergeNarrow_0 = MergeNarrow<string | number | [unknown, 1, [2, 3, unknown], {x: unknown}] | [0, unknown, unknown, {x: 1, y: 2}] | {a: number, b: {readonly c: unknown}, d: [unknown, 1]} | {a: 100, b: 199, d: [0, unknown]}>
// ^ string | number | { a: number; d: [0, 1]; b: 199 | {readonly c: unknown;}} | [0, 1, [2, 3, unknown], {x: unknown; y: 2}]
*/
type MergeNarrow<T, R extends UnknownArray = never, M extends object = never> =
	LastOfUnion<T> extends infer L
		? IsNever<T> extends false
			? L extends UnknownArray
				? MergeNarrow<Exclude<T, L>, MergeNarrowTuple<R, L>, M>
				: L extends object
					? MergeNarrow<Exclude<T, L>, R, MergeNarrowObject<M, L>>
					: L | MergeNarrow<Exclude<T, L>, R, M>
			: IsEqual<[R, M], [[], {}]> extends true
				? never
				: R | M
		: never;

type _MergeNarrowTuple<A extends UnknownArray, B extends UnknownArray> =
	A extends readonly [infer HeadA, ...infer RestA]
		? B extends readonly [infer HeadB, ...infer RestB]
			? [HeadA, HeadB] extends infer M extends [UnknownArray, UnknownArray]
				? [MergeNarrowTuple<M[0], M[1]>, ..._MergeNarrowTuple<RestA, RestB>]
				: [HeadA, HeadB] extends infer M extends [object, object]
					? [MergeNarrowObject<M[0], M[1]>, ..._MergeNarrowTuple<RestA, RestB>]
					: [HeadA & HeadB, ..._MergeNarrowTuple<RestA, RestB>]
			: [HeadA, ...RestA]
		// For https://github.com/sindresorhus/type-fest/issues/1223
		: [A, B] extends [Array<infer TA extends object>, Array<infer TB extends object>]
			? Array<MergeNarrow<TA | TB>>
			: [];

/*
If A is longer than B, fill the rest with A's elements, so position matters.
*/
type MergeNarrowTuple<A extends UnknownArray, B extends UnknownArray> =
	A['length'] extends 0
		? B
		: B['length'] extends 0
			? A
			: true extends GreaterThan<A['length'], B['length']>
				? _MergeNarrowTuple<A, B>
				: _MergeNarrowTuple<B, A>;

type _MergeNarrowObject<A extends object, B extends object, KU extends (keyof A | keyof B), R extends object = {}> =
	LastOfUnion<KU> extends infer K
		? K extends (keyof A) & (keyof B)
//			? _MergeNarrowObject<A, B, Exclude<KU, K>, Simplify<R & BuildObject<K, MergeNarrow<A[K] | B[K]>, A & B>>>
			? _MergeNarrowObject<A, B, Exclude<KU, K>, Simplify<R & BuildObject<K, MergeNarrow<A[K] | B[K]>, A | B>>>
			: K extends keyof A
				? _MergeNarrowObject<A, B, Exclude<KU, K>, Simplify<R & BuildObject<K, A[K], A>>>
				: K extends keyof B
					? _MergeNarrowObject<A, B, Exclude<KU, K>, Simplify<R & BuildObject<K, B[K], B>>>
					: R
		: never;

type MergeNarrowObject<A extends object, B extends object> =
	Or<IsEqual<A, never>, IsEqual<A, {}>> extends true
		? B
		: Or<IsEqual<B, never>, IsEqual<B, {}>> extends true
			? A
			// Not Intersection.
			: _MergeNarrowObject<A, B, (KeysOfUnion<A> | KeysOfUnion<B>) extends infer K extends (keyof A | keyof B) ? K : never>;

export {};
