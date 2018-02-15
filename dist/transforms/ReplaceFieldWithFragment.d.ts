import { GraphQLSchema, InlineFragmentNode } from 'graphql';
import { Transform } from './index';
export declare type FieldToFragmentMapping = {
    [typeName: string]: {
        [fieldName: string]: InlineFragmentNode;
    };
};
export default function ReplaceFieldWithFragment(targetSchema: GraphQLSchema, mapping: FieldToFragmentMapping): Transform;
