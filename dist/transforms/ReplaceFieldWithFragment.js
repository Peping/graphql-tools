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
function ReplaceFieldWithFragment(targetSchema, mapping) {
    return {
        transformRequest: function (originalRequest) {
            var document = replaceFieldsWithFragments(targetSchema, originalRequest.document, mapping);
            return __assign({}, originalRequest, { document: document });
        },
    };
}
exports.default = ReplaceFieldWithFragment;
function replaceFieldsWithFragments(targetSchema, document, mapping) {
    var typeInfo = new graphql_1.TypeInfo(targetSchema);
    return graphql_1.visit(document, graphql_1.visitWithTypeInfo(typeInfo, (_a = {},
        _a[graphql_1.Kind.SELECTION_SET] = function (node) {
            var parentType = typeInfo.getParentType();
            if (parentType) {
                var parentTypeName_1 = parentType.name;
                var selections_1 = node.selections;
                if (mapping[parentTypeName_1]) {
                    node.selections.forEach(function (selection) {
                        if (selection.kind === graphql_1.Kind.FIELD) {
                            var name_1 = selection.name.value;
                            var fragment = mapping[parentTypeName_1][name_1];
                            if (fragment) {
                                selections_1 = selections_1.concat(fragment);
                            }
                        }
                    });
                }
                if (selections_1 !== node.selections) {
                    return __assign({}, node, { selections: selections_1 });
                }
            }
        },
        _a)));
    var _a;
}
//# sourceMappingURL=ReplaceFieldWithFragment.js.map