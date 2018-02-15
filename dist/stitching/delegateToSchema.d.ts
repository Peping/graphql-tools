import { DocumentNode, FragmentDefinitionNode, GraphQLResolveInfo, GraphQLSchema, SelectionNode, VariableDefinitionNode } from 'graphql';
import { Operation } from '../Interfaces';
import { Transform } from '../transforms';
export default function delegateToSchema(targetSchema: GraphQLSchema, targetOperation: Operation, targetField: string, args: {
    [key: string]: any;
}, context: {
    [key: string]: any;
}, info: GraphQLResolveInfo, transforms: Array<Transform>): Promise<any>;
export declare function createDocument(targetField: string, targetOperation: Operation, selections: Array<SelectionNode>, fragments: Array<FragmentDefinitionNode>, variables: Array<VariableDefinitionNode>): DocumentNode;
