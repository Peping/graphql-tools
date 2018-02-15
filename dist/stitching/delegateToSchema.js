"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var transforms_1 = require("../transforms");
var AddArgumentsAsVariables_1 = require("../transforms/AddArgumentsAsVariables");
var FilterToSchema_1 = require("../transforms/FilterToSchema");
var AddTypenameToAbstract_1 = require("../transforms/AddTypenameToAbstract");
var CheckResultAndHandleErrors_1 = require("../transforms/CheckResultAndHandleErrors");
function delegateToSchema(targetSchema, targetOperation, targetField, args, context, info, transforms) {
    return __awaiter(this, void 0, void 0, function () {
        var rawDocument, rawRequest, processedRequest, errors, rawResult, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rawDocument = createDocument(targetField, targetOperation, info.fieldNodes, Object.keys(info.fragments).map(function (fragmentName) { return info.fragments[fragmentName]; }), info.operation.variableDefinitions);
                    rawRequest = {
                        document: rawDocument,
                        variables: info.variableValues,
                    };
                    transforms = transforms.concat([
                        AddArgumentsAsVariables_1.default(targetSchema, args),
                        FilterToSchema_1.default(targetSchema),
                        AddTypenameToAbstract_1.default(targetSchema),
                        CheckResultAndHandleErrors_1.default(info, targetField),
                    ]);
                    processedRequest = transforms_1.applyRequestTransforms(rawRequest, transforms);
                    errors = graphql_1.validate(targetSchema, processedRequest.document);
                    if (errors.length > 0) {
                        throw errors;
                    }
                    if (!(targetOperation === 'query' || targetOperation === 'mutation')) return [3 /*break*/, 2];
                    return [4 /*yield*/, graphql_1.graphql(targetSchema, graphql_1.print(processedRequest.document), info.rootValue, context, processedRequest.variables)];
                case 1:
                    rawResult = _a.sent();
                    result = transforms_1.applyResultTransforms(rawResult, transforms);
                    return [2 /*return*/, result];
                case 2:
                    if (targetOperation === 'subscription') {
                        // apply result processing ???
                        return [2 /*return*/, graphql_1.subscribe(targetSchema, processedRequest.document, info.rootValue, context, processedRequest.variables)];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.default = delegateToSchema;
function createDocument(targetField, targetOperation, selections, fragments, variables) {
    var originalSelection = selections[0];
    var rootField = {
        kind: graphql_1.Kind.FIELD,
        alias: null,
        arguments: originalSelection.arguments,
        selectionSet: originalSelection.selectionSet,
        name: {
            kind: graphql_1.Kind.NAME,
            value: targetField,
        },
    };
    var rootSelectionSet = {
        kind: graphql_1.Kind.SELECTION_SET,
        selections: [rootField],
    };
    var operationDefinition = {
        kind: graphql_1.Kind.OPERATION_DEFINITION,
        operation: targetOperation,
        variableDefinitions: variables,
        selectionSet: rootSelectionSet,
    };
    return {
        kind: graphql_1.Kind.DOCUMENT,
        definitions: [operationDefinition].concat(fragments),
    };
}
exports.createDocument = createDocument;
//# sourceMappingURL=delegateToSchema.js.map