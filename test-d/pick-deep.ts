import {expectType} from 'tsd';
import type {IsEqual, PickDeep} from '../index.d.ts';

declare class ClassA {
	a: string;
}

type BaseType = {
	string: string;
	optionalString?: string;
	array: number[];
	readonlyArray: readonly number[];
	tuples: ['foo', 'bar'];
	objectArray: Array<{a: 1; b: 2}>;
	leadingSpreadArray: [...Array<{a: 1}>, {b: 2}];
	tailingSpreadArray: [{a: 1}, {b: {c: 2; other: 2}}, ...Array<{d: 3}>];
	objectTuple: [{a: 1}];
	number: number;
	boolean: boolean;
	date: Date;
	Class: typeof ClassA;
	instance: ClassA;
	0: number;
};

type Testing = BaseType & {
	object: BaseType;
	optionalObject?: Partial<BaseType>;
	optionalString?: string;
	readonly readonlyObject: {a: 1};
	1: BaseType;
	2?: BaseType;
};

type normal_Actual = PickDeep<Testing, 'string'>;
type normal_Expected = {string: string};
expectType<true>({} as IsEqual<normal_Actual, normal_Expected>);

type DeepType = {
	nested: {
		deep: {
			deeper: {
				value: string;
				value1: number;
			};
		};
	};
	foo: string;
};
type DepthType = {nested: {deep: {deeper: {value: string}}}};

type deep_Actual = PickDeep<DeepType, 'nested.deep.deeper.value'>;
expectType<true>({} as IsEqual<deep_Actual, DepthType>);

// Test interface
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface DeepInterface extends DeepType {
	bar: {
		number: number;
		string: string;
	};
}
type deepInterface_Actual = PickDeep<DeepInterface, 'nested.deep.deeper.value'>;
expectType<true>({} as IsEqual<deepInterface_Actual, DepthType>);
type deepInterface2_Actual = PickDeep<DeepInterface, 'bar.number'>;
type deepInterface2_Expected = {bar: {number: number}};
expectType<true>({} as IsEqual<deepInterface2_Actual, deepInterface2_Expected>);

type GenericType<T> = {
	genericKey: T;
};
type genericTest_Actual = PickDeep<GenericType<number>, 'genericKey'>;
type genericTest_Expect = {genericKey: number};
expectType<true>({} as IsEqual<genericTest_Actual, genericTest_Expect>);

type union_Actual = PickDeep<Testing, 'object.number' | 'object.string'>;
// This is not proper test because object doesn't have this intersection type.
// type union_Expect = { object: { number: number } & { string: string } };
type union_Expect = {object: {number: number; string: string}};
expectType<true>({} as IsEqual<union_Actual, union_Expect>);

type optional_Actual = PickDeep<Testing, 'optionalObject.optionalString'>;
type optional_Expect = {optionalObject?: {optionalString?: string}};
expectType<true>({} as IsEqual<optional_Actual, optional_Expect>);

type optionalUnion_Actual = PickDeep<Testing, 'optionalObject.string' | 'object.number'>;
type optionalUnion_Expect = {
	optionalObject?: {string?: string};
	object: {number: number};
};
expectType<true>({} as IsEqual<optionalUnion_Actual, optionalUnion_Expect>);

type readonlyTest_Actual = PickDeep<Testing, 'readonlyObject.a'>;
type readonlyTest_Expect = {readonly readonlyObject: {a: 1}};
expectType<true>({} as IsEqual<readonlyTest_Actual, readonlyTest_Expect>);

type array_Actual = PickDeep<Testing, 'object.array'>;
type array_Expect = {object: {array: number[]}};
expectType<true>({} as IsEqual<array_Actual, array_Expect>);

type readonlyArray_Actual = PickDeep<Testing, 'object.readonlyArray'>;
type readonlyArray_Expect = {object: {readonlyArray: readonly number[]}};
expectType<true>({} as IsEqual<readonlyArray_Actual, readonlyArray_Expect>);

type tuple_Actual = PickDeep<Testing, 'object.tuples'>;
type tuple_Expect = {object: {tuples: ['foo', 'bar']}};
expectType<true>({} as IsEqual<tuple_Actual, tuple_Expect>);

type objectArray1_Actual = PickDeep<Testing, `object.objectArray.${number}`>;
type objectArray1_Expect = {object: {objectArray: Array<{a: 1; b: 2}>}};
expectType<true>({} as IsEqual<objectArray1_Actual, objectArray1_Expect>);

type objectArray2_Actual = PickDeep<Testing, `object.objectArray.${number}.a`>;
type objectArray2_Expect = {object: {objectArray: Array<{a: 1}>}};
expectType<true>({} as IsEqual<objectArray2_Actual, objectArray2_Expect>);

type leadingSpreadArray1_Actual = PickDeep<Testing, `object.leadingSpreadArray.${number}.a`>;
type leadingSpreadArray1_Expect = {object: {leadingSpreadArray: [...Array<{a: 1}> ]}};
expectType<true>({} as IsEqual<leadingSpreadArray1_Actual, leadingSpreadArray1_Expect>);

type leadingSpreadArray2_Actual = PickDeep<Testing, `object.leadingSpreadArray.${number}`>;
type leadingSpreadArray2_Expect = {object: {leadingSpreadArray: [...Array<{a: 1}>, {b: 2}]}};
expectType<true>({} as IsEqual<leadingSpreadArray2_Actual, leadingSpreadArray2_Expect>);

type tailingSpreadArray1_Actual = PickDeep<Testing, 'object.tailingSpreadArray.1'>;
type tailingSpreadArray1_Expect = {object: {tailingSpreadArray: [unknown, {b: {c: 2; other: 2}}]}};
expectType<true>({} as IsEqual<tailingSpreadArray1_Actual, tailingSpreadArray1_Expect>);

type tailingSpreadArray2_Actual = PickDeep<Testing, 'object.tailingSpreadArray.1.b.c'>;
type tailingSpreadArray2_Expect = {object: {tailingSpreadArray: [unknown, {b: {c: 2}}]}};
expectType<true>({} as IsEqual<tailingSpreadArray2_Actual, tailingSpreadArray2_Expect>);

type date_Actual = PickDeep<Testing, 'object.date'>;
type date_Expect = {object: {date: Date}};
expectType<true>({} as IsEqual<date_Actual, date_Expect>);

type instance_Actual = PickDeep<Testing, 'object.instance'>;
type instance_Expect = {object: {instance: ClassA}};
expectType<true>({} as IsEqual<instance_Actual, instance_Expect>);

type classTest_Actual = PickDeep<Testing, 'object.Class'>;
type classTest_Expect = {object: {Class: typeof ClassA}};
expectType<true>({} as IsEqual<classTest_Actual, classTest_Expect>);

type numberTest_Actual = PickDeep<Testing, '1'>;
type numberTest_Expect = {1: BaseType};
expectType<true>({} as IsEqual<numberTest_Actual, numberTest_Expect>);

type numberTest2_Actual = PickDeep<Testing, '1.0'>;
type numberTest2_Expect = {1: {0: number}};
expectType<true>({} as IsEqual<numberTest2_Actual, numberTest2_Expect>);

type numberTest2_Actual0 = PickDeep<Testing, '1'>;
type numberTest2_Expect0 = PickDeep<Testing, '1.0'>;
expectType<false>({} as IsEqual<numberTest2_Actual0, numberTest2_Expect0>);

type numberTest3_Actual = PickDeep<Testing, '2.0'>;
type numberTest3_Expect = {2?: {0: number}};
expectType<true>({} as IsEqual<numberTest3_Actual, numberTest3_Expect>);

// Test for https://github.com/sindresorhus/type-fest/issues/1224
type unionElement0_Actual = PickDeep<{obj: string | {a: string; b: number; c: boolean} | null | undefined}, 'obj'>;
type unionElement0_Expected = unionElement0_Actual;
expectType<true>({} as IsEqual<unionElement0_Actual, unionElement0_Expected>);

// Test for https://github.com/sindresorhus/type-fest/issues/1224
type unionElement1_Actual = PickDeep<{obj: string | {a: string; b: number; c: {d: 'result'}} | null | undefined}, 'obj.b'>;
type unionElement1_Expected = {obj: string | null | undefined | {b: number}};
expectType<true>({} as IsEqual<unionElement1_Actual, unionElement1_Expected>);

// Test for https://github.com/sindresorhus/type-fest/issues/1224
//
// [note]
// tsd error:
// this passes unintentionally.
// declare const unionElement2: PickDeep<{ obj: string | { a: string; b: number; c: {readonly d?: 'result'} } | null | undefined }, `obj.c.d`>;
type unionElement2_Actual = PickDeep<{obj: string | {a: string; b: number; c: {readonly d?: 'result'}} | null | undefined}, 'obj.c.d'>;
type unionElement2_Expected = {obj: string | null | undefined | {c: {readonly d?: 'result'}}};
expectType<true>({} as IsEqual<unionElement2_Actual, unionElement2_Expected>);

// Test for https://github.com/sindresorhus/type-fest/issues/1224
type unionElement3_Actual = PickDeep<
	{obj: string | {a: string; b: number; c?: {readonly d?: 'result' | 'is'}} | null | undefined}, 'obj.c.d'>;
type unionElement3_Expected = {obj: string | null | undefined | {c?: {readonly d?: 'result' | 'is'}}};
expectType<true>({} as IsEqual<unionElement3_Actual, unionElement3_Expected>);

// Test for https://github.com/sindresorhus/type-fest/issues/1224
type unionElement4_Actual = PickDeep<
	{obj: string | {a: string; b: number; c?: {readonly d?: 'result' | 'is'}} | null | undefined}, 'obj.c.d' | 'obj.b'>;
type unionElement4_Expected = {obj: string | null | undefined | {c?: {readonly d?: 'result' | 'is'}; b: number}};
expectType<true>({} as IsEqual<unionElement4_Actual, unionElement4_Expected>);

// Test for https://github.com/sindresorhus/type-fest/issues/1140#issuecomment-2881382244
type unionObject0_Actual = PickDeep<{foo: string} | {foo: number}, 'foo'>;
type unionObject0_Expected = {foo: string} | {foo: number};
expectType<true>({} as IsEqual<unionObject0_Actual, unionObject0_Expected>);
