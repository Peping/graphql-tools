import { GraphQLSchema } from 'graphql';
import { Transform } from './index';
export default function AddArgumentsAsVariablesTransform(schema: GraphQLSchema, args: {
    [key: string]: any;
}): Transform;
