"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var schemaGenerator_1 = require("../schemaGenerator");
var schemaRecreation_1 = require("./schemaRecreation");
var delegateToSchema_1 = require("./delegateToSchema");
var typeFromAST_1 = require("./typeFromAST");
var ReplaceFieldWithFragment_1 = require("../transforms/ReplaceFieldWithFragment");
function mergeSchemas(_a) {
    var schemas = _a.schemas, visitType = _a.visitType, resolvers = _a.resolvers;
    var allSchemas = {};
    var typeCandidates = {};
    var types = {};
    var extensions = [];
    var fragments = {};
    if (!resolvers) {
        resolvers = {};
    }
    if (!visitType) {
        visitType = defaultVisitType;
    }
    var resolveType = schemaRecreation_1.createResolveType(function (name) {
        if (types[name] === undefined) {
            throw new Error("Can't find type " + name + ".");
        }
        return types[name];
    });
    var createNamedStub = function (name, type) {
        var constructor;
        if (type === 'object') {
            constructor = graphql_1.GraphQLObjectType;
        }
        else if (type === 'interface') {
            constructor = graphql_1.GraphQLInterfaceType;
        }
        else {
            constructor = graphql_1.GraphQLInputObjectType;
        }
        return new constructor({
            name: name,
            fields: {
                __fake: {
                    type: graphql_1.GraphQLString,
                },
            },
        });
    };
    schemas.forEach(function (subSchema) {
        if (subSchema.schema instanceof graphql_1.GraphQLSchema) {
            var schema_1 = subSchema.schema;
            allSchemas[subSchema.name] = schema_1;
            var queryType_1 = schema_1.getQueryType();
            var mutationType_1 = schema_1.getMutationType();
            var subscriptionType_1 = schema_1.getSubscriptionType();
            addTypeCandidate(typeCandidates, 'Query', {
                schemaName: subSchema.name,
                schema: schema_1,
                type: queryType_1,
            });
            if (mutationType_1) {
                addTypeCandidate(typeCandidates, 'Mutation', {
                    schemaName: subSchema.name,
                    schema: schema_1,
                    type: mutationType_1,
                });
            }
            if (subscriptionType_1) {
                addTypeCandidate(typeCandidates, 'Subscription', {
                    schemaName: subSchema.name,
                    schema: schema_1,
                    type: subscriptionType_1,
                });
            }
            var typeMap_1 = schema_1.getTypeMap();
            Object.keys(typeMap_1).forEach(function (typeName) {
                var type = typeMap_1[typeName];
                if (graphql_1.isNamedType(type) &&
                    graphql_1.getNamedType(type).name.slice(0, 2) !== '__' &&
                    type !== queryType_1 &&
                    type !== mutationType_1 &&
                    type !== subscriptionType_1) {
                    addTypeCandidate(typeCandidates, type.name, {
                        schemaName: subSchema.name,
                        schema: schema_1,
                        type: type,
                    });
                }
            });
        }
        else if (typeof subSchema.schema === 'string') {
            var parsedSchemaDocument = graphql_1.parse(subSchema.schema);
            parsedSchemaDocument.definitions.forEach(function (def) {
                var type = typeFromAST_1.default(def, createNamedStub);
                if (type) {
                    addTypeCandidate(typeCandidates, type.name, {
                        schemaName: subSchema.name,
                        type: type,
                    });
                }
            });
            var extensionsDocument = schemaGenerator_1.extractExtensionDefinitions(parsedSchemaDocument);
            if (extensionsDocument.definitions.length > 0) {
                extensions.push(extensionsDocument);
            }
        }
        else {
            throw new Error("Invalid schema " + subSchema.name);
        }
    });
    var generatedResolvers = {};
    Object.keys(typeCandidates).forEach(function (typeName) {
        var resultType = visitType(typeName, typeCandidates[typeName]);
        if (resultType === null) {
            types[typeName] = null;
        }
        else {
            var type = void 0;
            var typeResolvers = void 0;
            if (graphql_1.isNamedType(resultType)) {
                type = resultType;
            }
            else if (resultType.type) {
                type = resultType.type;
                typeResolvers = resultType.resolvers;
            }
            else {
                throw new Error('Invalid `visitType` result for type "${typeName}"');
            }
            types[typeName] = schemaRecreation_1.recreateType(type, resolveType);
            if (typeResolvers) {
                generatedResolvers[typeName] = typeResolvers;
            }
        }
    });
    var mergedSchema = new graphql_1.GraphQLSchema({
        query: types.Query,
        mutation: types.Mutation,
        subscription: types.Subscription,
        types: Object.keys(types).map(function (key) { return types[key]; }),
    });
    extensions.forEach(function (extension) {
        mergedSchema = graphql_1.extendSchema(mergedSchema, extension, {
            commentDescriptions: true,
        });
    });
    Object.keys(resolvers).forEach(function (typeName) {
        var type = resolvers[typeName];
        if (type instanceof graphql_1.GraphQLScalarType) {
            return;
        }
        Object.keys(type).forEach(function (fieldName) {
            var field = type[fieldName];
            if (field.fragment) {
                fragments[typeName] = fragments[typeName] || {};
                fragments[typeName][fieldName] = parseFragmentToInlineFragment(field.fragment);
            }
        });
    });
    schemaGenerator_1.addResolveFunctionsToSchema(mergedSchema, mergeDeep(generatedResolvers, resolvers));
    var mergeInfo = createMergeInfo(allSchemas, fragments);
    forEachField(mergedSchema, function (field) {
        if (field.resolve) {
            var fieldResolver_1 = field.resolve;
            field.resolve = function (parent, args, context, info) {
                var newInfo = __assign({}, info, { mergeInfo: mergeInfo });
                return fieldResolver_1(parent, args, context, newInfo);
            };
        }
        if (field.subscribe) {
            var fieldResolver_2 = field.subscribe;
            field.subscribe = function (parent, args, context, info) {
                var newInfo = __assign({}, info, { mergeInfo: mergeInfo });
                return fieldResolver_2(parent, args, context, newInfo);
            };
        }
    });
    return mergedSchema;
}
exports.default = mergeSchemas;
function createMergeInfo(schemas, fragmentReplacements) {
    return {
        getSubSchema: function (schemaName) {
            var schema = schemas[schemaName];
            if (!schema) {
                throw new Error("No subschema named " + schemaName + ".");
            }
            return schema;
        },
        delegate: function (schemaName, operation, fieldName, args, context, info) {
            var schema = schemas[schemaName];
            var fragmentTransform = ReplaceFieldWithFragment_1.default(schema, fragmentReplacements);
            if (!schema) {
                throw new Error("No subschema named " + schemaName + ".");
            }
            return delegateToSchema_1.default(schema, operation, fieldName, args, context, info, [fragmentTransform]);
        },
    };
}
function createDelegatingResolver(schemaName, operation, fieldName) {
    return function (root, args, context, info) {
        return info.mergeInfo.delegate(schemaName, operation, fieldName, args, context, info);
    };
}
function forEachField(schema, fn) {
    var typeMap = schema.getTypeMap();
    Object.keys(typeMap).forEach(function (typeName) {
        var type = typeMap[typeName];
        if (!graphql_1.getNamedType(type).name.startsWith('__') &&
            type instanceof graphql_1.GraphQLObjectType) {
            var fields_1 = type.getFields();
            Object.keys(fields_1).forEach(function (fieldName) {
                var field = fields_1[fieldName];
                fn(field, typeName, fieldName);
            });
        }
    });
}
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}
function mergeDeep(target, source) {
    var output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(function (key) {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, (_a = {}, _a[key] = source[key], _a));
                }
                else {
                    output[key] = mergeDeep(target[key], source[key]);
                }
            }
            else {
                Object.assign(output, (_b = {}, _b[key] = source[key], _b));
            }
            var _a, _b;
        });
    }
    return output;
}
function parseFragmentToInlineFragment(definitions) {
    var document = graphql_1.parse(definitions);
    for (var _i = 0, _a = document.definitions; _i < _a.length; _i++) {
        var definition = _a[_i];
        if (definition.kind === graphql_1.Kind.FRAGMENT_DEFINITION) {
            return {
                kind: graphql_1.Kind.INLINE_FRAGMENT,
                typeCondition: definition.typeCondition,
                selectionSet: definition.selectionSet,
            };
        }
    }
    throw new Error('Could not parse fragment');
}
function addTypeCandidate(typeCandidates, name, typeCandidate) {
    if (!typeCandidates[name]) {
        typeCandidates[name] = [];
    }
    typeCandidates[name].push(typeCandidate);
}
var defaultVisitType = function (name, candidates) {
    var resolveType = schemaRecreation_1.createResolveType(function (_, type) { return type; });
    if (name === 'Query' || name === 'Mutation' || name === 'Subscription') {
        var fields_2 = {};
        var operationName_1;
        switch (name) {
            case 'Query':
                operationName_1 = 'query';
                break;
            case 'Mutation':
                operationName_1 = 'mutation';
                break;
            case 'Subscription':
                operationName_1 = 'subscription';
                break;
            default:
                break;
        }
        var resolvers_1 = {};
        var resolverKey_1 = operationName_1 === 'subscription' ? 'subscribe' : 'resolve';
        candidates.forEach(function (_a) {
            var candidateType = _a.type, schemaName = _a.schemaName;
            var candidateFields = candidateType.getFields();
            fields_2 = __assign({}, fields_2, candidateFields);
            Object.keys(candidateFields).forEach(function (fieldName) {
                resolvers_1[fieldName] = (_a = {},
                    _a[resolverKey_1] = createDelegatingResolver(schemaName, operationName_1, fieldName),
                    _a);
                var _a;
            });
        });
        var type = new graphql_1.GraphQLObjectType({
            name: name,
            fields: schemaRecreation_1.fieldMapToFieldConfigMap(fields_2, resolveType),
        });
        return {
            type: type,
            resolvers: resolvers_1,
        };
    }
    else {
        return candidates[candidates.length - 1].type;
    }
};
//# sourceMappingURL=mergeSchemas.js.map