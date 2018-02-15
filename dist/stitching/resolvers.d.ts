import { GraphQLSchema } from 'graphql';
import { IResolvers, Operation } from '../Interfaces';
import { Transform } from '../transforms/index';
export declare type Mapping = {
    [typeName: string]: {
        [fieldName: string]: {
            name: string;
            operation: Operation;
        };
    };
};
export declare function generateProxyingResolvers(targetSchema: GraphQLSchema, transforms: Array<Transform>, mapping: Mapping): IResolvers;
export declare function generateSimpleMapping(targetSchema: GraphQLSchema): Mapping;
