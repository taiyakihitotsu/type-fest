import type {TupleOf} from './tuple-of.d.ts';
import type {BuildObject} from './internal/index.d.ts';
import type {Paths} from './paths.d.ts';
import type {Simplify} from './simplify.d.ts';
import type {GreaterThan} from './greater-than.d.ts';
import type {IsEqual} from './is-equal.d.ts';
import type {Or} from './or.d.ts';
import type {IsNegative} from './numeric.d.ts';
import type {IsTuple} from './is-tuple.d.ts';
import type {KeysOfUnion} from './keys-of-union.d.ts';
import type {UnionToIntersection} from './union-to-intersection.d.ts';
import type {UnknownArray} from './unknown-array.d.ts';

/*

Type Test_Pick_0 = _Pick<[0,1], 1>; // 1
type Test_Pick_1 = _Pick<{a: 'aa'}, 'a'>; // {a: 'aa'}
*/
type _Pick<Collection, Key extends (string | number)> =
	Collection extends UnknownArray
		? Collection[Key extends keyof Collection ? Key : never]
		: {[K in keyof Collection as `${K extends (string | number) ? K : never}` extends `${Key}` ? K : never]: Collection[K]};

/*
Force `Get` if possible; otherwise, return `never`.

type TestForceGet_0 = ForceGet<{2: 'x'}, '2'>; // 'x'
type TestForceGet_1 = ForceGet<{'2': 'x'}, '2'>; // 'x'
type TestForceGet_2 = ForceGet<{2: 'x'}, 2>; // 'x'
type TestForceGet_3 = ForceGet<{'2': 'x'}, 2>; // 'x'
type TestForceGet_4 = ForceGet<['x', 'xx'], 0>; // 'x'
type TestForceGet_5 = ForceGet<['x', 'xx'], '0'>; // 'x'
type TestForceGet_6 = ForceGet<['x', 'xx'], '2'> // never
type TestForceGet_7 = ForceGet<{a: 'x'}, 'b'> // never
type TestForceGet_8 = ForceGet<[0,1,2], `${number}`> // 0 | 1 | 2
type TestForceGet_9 = ForceGet<string[], `${number}`> // string
*/
type ForceGet<T, Key extends PropertyKey> =
	Key extends keyof T
		? T[Key]
		: Key extends string | number
			? StringToNumber<`${Key}`> extends infer Number_ extends number
				? IsNever<Number_> extends false
					? `${Key}` extends `${keyof T extends (string | number) ? keyof T : never}`
						? T[(`${Key}` extends infer K extends keyof T ? K : never)] | T[(Number_ extends infer K extends keyof T ? K : never)]
						/* `${number}` case */
						: `${Key}` extends `${infer N extends number}`
							? [IsEqual<N, number>, T] extends [true, Array<infer ArrayType>]
								? ArrayType
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
type Test_CollKeyOf_9 = CollKeyOf<{0: 'a0'}, 0>; // true
type Test_CollKeyOf_10 = CollKeyOf<{'0': 'a0'}, 0>; // true
type Test_CollKeyOf_11 = CollKeyOf<{0: 'a0'}, '0'>; // true
type Test_CollKeyOf_12 = CollKeyOf<{'0': 'a0'}, 0>; // true
*/
type CollKeyOf<A, K extends PropertyKey> =
	A extends UnknownArray
		? IsEqual<IsTuple<A>, true> extends false
			? K extends `${number}`
				? true
				: K extends (string | number)
					? IsEqual<false, IsNegative<StringToNumber<`${K}`>>>
					: never
			: K extends (string | number)
				? [A['length'], IsEqual<A['length'], number>, IsEqual<false, IsNegative<StringToNumber<`${K}`>>>, GreaterThan<A['length'], StringToNumber<`${K}`>>] extends [number, false, true, true]
					? true
					: false
				: false
		: A extends object
			? K extends (string | number)
				? IsKeyOf<A, K>
				: false
			: false;

// [todo] dup
type IsKeyOf<a, k extends string | number> = `${k}` extends `${keyof a extends (string | number) ? keyof a : never}` ? true : false;

// Type GetOrSelf<a, k extends (number | string)> = (a extends any ? IsEqual<true, IsKeyOf<a, k>> extends true ? Get<a, `${k}`> : a : never);

// type PickOrSelf<a, k extends (number | string)> = (a extends any ? IsEqual<true, IsKeyOf<a, k>> extends true ? _Pick<a, k> : a : never);
// type PickOrSelf<a, k extends (number | string)> = (a extends object ? IsEqual<true, IsKeyOf<a, k>> extends true ? _Pick<a, k> : never : a);
/**/
// [todo] use `TupleOf`

/*

type Test_PickOrSelf_0 = PickOrSelf<string, 'a'>; // string
type Test_PickOrSelf_1 = PickOrSelf<{readonly a?: 0}, 'a'>; // {readonly a?: 0}
type Test_PickOrSelf_2 = PickOrSelf<{2?: 0}, '2'>; // {2?: 0}
type Test_PickOrSelf_3 = PickOrSelf<{2?: 0}, 2>; // {2?: 0}
type Test_PickOrSelf_4 = PickOrSelf<{'2': 0}, 2>; // {'2': 0}
*/
type PickOrSelf<a, k extends (number | string)> = (a extends UnknownArray ? _Pick<a, k> : a extends object ? IsEqual<true, IsKeyOf<a, k>> extends true ? _Pick<a, k> : never : a);

type LastOfUnion<T> = UnionToIntersection<T extends any ? () => T : never> extends () => (infer R)	? R : never;

type IsNever<MaybeNever> = IsEqual<never, MaybeNever>;

/*
Merge only objects of union type.

type Test_MergeOnlyObjectUnion = MergeOnlyObjectUnion<0 | string | {readonly a: 0} | {b?: 2} | [0] | [1]>; // string | 0 | [0] | [1] | {readonly a: 0; b?: 2}
*/
type MergeOnlyObjectUnion<MaybeObjectUnion> = _MergeOnlyObjectUnion<MaybeObjectUnion>;
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
			? L[]
			: BuildObject<K, L, M>
		: BuildObject<K, L, M>;

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
export type PickDeep<T, PathUnion extends Paths<T>> = InternalPickDeep<T, MergeTree<PathToTree<PathUnion>> extends infer M extends PathTreeType ? M : never>;

type InternalPickDeep<Parent, PathTree extends PathTreeType> =
	Parent extends UnknownArray
		? [_PickDeep<Parent, PathTree, keyof PathTree>][0]
		: Parent extends object
			? [_PickDeep<Parent, PathTree, keyof PathTree>][0]
			: Parent;

type RecursionPickDeep<NextParent, NextPathTree extends PathTreeType> =
	NextParent extends infer NextParentArray extends UnknownArray
		/* NextParent: array */
		? IsEqual<IsTuple<NextParentArray>, false> extends true
			/* Via tuple to prevent distribution. */
			? [NextParentArray extends Array<infer _>
				/* If end */
				? ForceGet<NextPathTree, CoerceKeyof<NextPathTree>> extends LeafMark
					? IsEqual<`${number}`, `${CoerceKeyof<NextPathTree>}`> extends true
						/* `leadingSpreadArray2_Actual` in `test-d/pick-deep.ts` */
						? [NextParent, Array<PickOrSelf<NextParent, CoerceKeyof<NextPathTree>>>][0]
						/* `tailingSpreadArray1_Actual` in `test-d/pick-deep.ts` */
						: [...TupleOf<StringToNumber<`${CoerceKeyof<NextPathTree>}`>>, PickOrSelf<NextParent, CoerceKeyof<NextPathTree>>]
					/* Not end */
					: InternalPickDeep<PickOrSelf<NextParent, CoerceKeyof<NextPathTree>>, ForceGet<NextPathTree, CoerceKeyof<NextPathTree>> extends infer G extends PathTreeType ? G : never> extends infer Result
						? IsEqual<`${number}`, `${CoerceKeyof<NextPathTree>}`> extends true
							/* `leadingSpreadArray1_Actual` in `test-d/pick-deep.ts` */
							? [Result[]][0]
							/* `tailingSpreadArray2_Actual` in `test-d/pick-deep.ts`. */
							: [[...TupleOf<StringToNumber<`${CoerceKeyof<NextPathTree>}`>>, Result]][0]
						: never
				: never][0]
			/* NextParent: tuple */
			: [InternalPickDeep<NextParent, NextPathTree>][0]
		/* NextParent: object */
		: [InternalPickDeep<Simplify<PickOrSelf<NextParent, CoerceKeyof<Simplify<PickOrSelf<NextParent, CoerceKeyof<NextPathTree>>>>>>, NextPathTree>][0];

/* Just rename */
type As<Source, T> = Extract<Source, T>;

type _PickDeep<Parent, PathTree extends PathTreeType, K extends keyof PathTree> =
	LastOfUnion<K> extends infer L extends keyof PathTree
		? IsNever<L> extends false
			? L extends number | string
				? IsEqual<true, CollKeyOf<Parent, L>> extends true
					/* Detect an end of path. */
					? IsEqual<LeafMark, PathTree[L]> extends true
						? MergeOnlyObjectUnion<Simplify<PickOrSelf<Parent, L>> | _PickDeep<Parent, PathTree, Exclude<K, L>>>
						: MergeOnlyObjectUnion<Simplify<Build<L, RecursionPickDeep<ForceGet<Parent, L>, As<ForceGet<PathTree, L>, PathTreeType>>, As<Parent, object>>> | _PickDeep<Parent, PathTree, Exclude<K, L>>>
					: never
				: never
			: never
		: never;

// [todo]
// これらもテストケースとして追加する
type panda = {a: string | {b: 1 | true; c: 2; d: {g: {f: 9; h: 10}}} | {b: '1'; c: '2'}; x: 10 | 11; y: [[0, 1], 2, 3]};
type pandsak = MergeTree<PathToTree<`a.${'b' | 'c'}` | 'x'>>;
type Path = InternalPickDeep<panda, pandsak>;
type pandsak1 = MergeTree<PathToTree<'a.d.g.f'>>;
type Path1 = InternalPickDeep<panda, pandsak1>;
type pandsak2 = MergeTree<PathToTree<'y.0'>>;
type Path2 = InternalPickDeep<panda, pandsak2>;
type landda = {0: string};
type landdsak = MergeTree<PathToTree<'0'>>;
type Path3 = InternalPickDeep<landda, landdsak>;
type landda1 = {'2': {0: string}};
type landdsak1 = MergeTree<PathToTree<'2.0'>>;
type Path4 = InternalPickDeep<landda1, landdsak1>;
type jkafje = [[[111, 222, 333], 22, 33], 1, 2];
type jakdf = MergeTree<PathToTree<`0.${number}.${number}`>>;
type Path5 = InternalPickDeep<jkafje, jakdf>; // [todo] ?

type LeafMark = '';
type PathTreeType = {[K in string]: PathTreeType | LeafMark};
/*

Type Test_PathToTree = MergeNarrow<PathToTree<`a.b.${'c'|'d'}.x` | `d.b.${'c'|'d'}`>>;
// {d: {b: {d: ''; c: ''}};
//  a: {b: {d: {x: ''}; c: {x: ''}}}}
*/
type PathToTree<S> =
	S extends `${infer F}.${infer Next}`
		? Next extends `${infer _}.${infer __}`
			? {[K in F]: PathToTree<Next>}
			: {[K in F]: {[L in Next]: LeafMark}}
		: {[K in S extends string ? S : never]: LeafMark};

/*
*/
type MergeTree<T, M extends object = never> =
	LastOfUnion<T> extends infer L
		? IsNever<T> extends false
			? L extends object
				? MergeTree<Exclude<T, L>, MergeTreeObject<M, L>>
				: L | MergeTree<Exclude<T, L>, M>
			: IsEqual<[M], [{}]> extends true
				? never
				: M
		: never;

type _MergeTreeObject<A extends object, B extends object, KU extends (keyof A | keyof B), R extends object = {}> =
	LastOfUnion<KU> extends infer K
		? K extends (keyof A) & (keyof B)
			? _MergeTreeObject<A, B, Exclude<KU, K>, Simplify<R & BuildObject<K, MergeTreeObject<A[K] extends object ? A[K] : never, B[K] extends object ? B[K] : never>, A | B>>>
			: K extends keyof A
				? _MergeTreeObject<A, B, Exclude<KU, K>, Simplify<R & BuildObject<K, A[K], A>>>
				: K extends keyof B
					? _MergeTreeObject<A, B, Exclude<KU, K>, Simplify<R & BuildObject<K, B[K], B>>>
					: R
		: never;

type MergeTreeObject<A extends object, B extends object> =
	Or<IsEqual<A, never>, IsEqual<A, {}>> extends true
		? B
		: Or<IsEqual<B, never>, IsEqual<B, {}>> extends true
			? A
			: _MergeTreeObject<A, B, (KeysOfUnion<A> | KeysOfUnion<B>) extends infer K extends (keyof A | keyof B) ? K : never>;

export {};
