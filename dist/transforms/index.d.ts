import { GraphQLSchema } from 'graphql';
import { Request, Result } from '../Interfaces';
export declare type Transform = {
    transformSchema?: (schema: GraphQLSchema) => GraphQLSchema;
    transformRequest?: (originalRequest: Request) => Request;
    transformResult?: (result: Result) => Result;
};
export declare function applySchemaTransforms(originalSchema: GraphQLSchema, transforms: Array<Transform>): GraphQLSchema;
export declare function applyRequestTransforms(originalRequest: Request, transforms: Array<Transform>): Request;
export declare function applyResultTransforms(originalResult: any, transforms: Array<Transform>): any;
