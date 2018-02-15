"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function applySchemaTransforms(originalSchema, transforms) {
    return transforms.reduce(function (schema, transform) {
        return transform.transformSchema ? transform.transformSchema(schema) : schema;
    }, originalSchema);
}
exports.applySchemaTransforms = applySchemaTransforms;
function applyRequestTransforms(originalRequest, transforms) {
    return transforms.reduce(function (request, transform) {
        return transform.transformRequest
            ? transform.transformRequest(request)
            : request;
    }, originalRequest);
}
exports.applyRequestTransforms = applyRequestTransforms;
function applyResultTransforms(originalResult, transforms) {
    return transforms.reduce(function (result, transform) {
        return transform.transformResult ? transform.transformResult(result) : result;
    }, originalResult);
}
exports.applyResultTransforms = applyResultTransforms;
//# sourceMappingURL=index.js.map