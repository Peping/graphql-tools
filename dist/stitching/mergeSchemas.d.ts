import { GraphQLSchema } from 'graphql';
import { IResolvers, MergeInfo, VisitType } from '../Interfaces';
export default function mergeSchemas({schemas, visitType, resolvers}: {
    schemas: Array<{
        name: string;
        schema: string | GraphQLSchema;
    }>;
    visitType?: VisitType;
    resolvers?: IResolvers | ((mergeInfo: MergeInfo) => IResolvers);
}): GraphQLSchema;
