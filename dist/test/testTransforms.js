"use strict";
/* tslint:disable:no-unused-expression */
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var graphql_1 = require("graphql");
var transforms_1 = require("../transforms");
var visitSchema_1 = require("../transforms/visitSchema");
var testingSchemas_1 = require("./testingSchemas");
var schemaGenerator_1 = require("../schemaGenerator");
var resolvers_1 = require("../stitching/resolvers");
function RenameTypes(renameMap) {
    var reverseMap = {};
    Object.keys(renameMap).map(function (from) {
        reverseMap[renameMap[from]] = from;
    });
    return {
        transformSchema: function (originalSchema) {
            return visitSchema_1.default(originalSchema, (_a = {},
                _a[visitSchema_1.VisitSchemaKind.TYPE] = function (type) {
                    if (type.name in renameMap) {
                        var newType = Object.assign(Object.create(type), type);
                        newType.name = renameMap[type.name];
                        return newType;
                    }
                },
                _a));
            var _a;
        },
        transformRequest: function (originalRequest) {
            var newDocument = graphql_1.visit(originalRequest.document, (_a = {},
                _a[graphql_1.Kind.NAMED_TYPE] = function (node) {
                    var name = node.name.value;
                    if (name in reverseMap) {
                        return __assign({}, node, { name: {
                                kind: graphql_1.Kind.NAME,
                                value: reverseMap[name],
                            } });
                    }
                },
                _a));
            return {
                document: newDocument,
                variables: originalRequest.variables,
            };
            var _a;
        },
    };
}
// function NamespaceSchema(namespace: string): Transform {
//   return {
//     transformSchema();,
//   };
// }
describe('transforms', function () {
    describe('rename type', function () {
        var schema;
        before(function () {
            var transforms = [
                RenameTypes({
                    Property: 'House',
                    Location: 'Spots',
                    TestInterface: 'TestingInterface',
                    DateTime: 'Datum',
                    InputWithDefault: 'DefaultingInput',
                    TestInterfaceKind: 'TestingInterfaceKinds',
                }),
            ];
            schema = transforms_1.applySchemaTransforms(testingSchemas_1.propertySchema, transforms);
            var mapping = resolvers_1.generateSimpleMapping(testingSchemas_1.propertySchema);
            var resolvers = resolvers_1.generateProxyingResolvers(testingSchemas_1.propertySchema, transforms, mapping);
            schemaGenerator_1.addResolveFunctionsToSchema(schema, resolvers);
        });
        it('should work', function () { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, graphql_1.graphql(schema, "\n          query($input: DefaultingInput!) {\n            interfaceTest(kind: ONE) {\n              ... on TestingInterface {\n                testString\n              }\n            }\n            propertyById(id: \"p1\") {\n              ... on House {\n                id\n              }\n            }\n            dateTimeTest\n            defaultInputTest(input: $input)\n          }\n        ", {}, {}, {
                            input: {
                                test: 'bar',
                            },
                        })];
                    case 1:
                        result = _a.sent();
                        chai_1.expect(result).to.deep.equal({
                            data: {
                                dateTimeTest: '1987-09-25T12:00:00',
                                defaultInputTest: 'bar',
                                interfaceTest: {
                                    testString: 'test',
                                },
                                propertyById: {
                                    id: 'p1',
                                },
                            },
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=testTransforms.js.map