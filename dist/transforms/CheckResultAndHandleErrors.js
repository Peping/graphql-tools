"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("../stitching/errors");
function CheckResultAndHandleErrors(info, fieldName) {
    return {
        transformResult: function (result) {
            return errors_1.checkResultAndHandleErrors(result, info, fieldName);
        },
    };
}
exports.default = CheckResultAndHandleErrors;
//# sourceMappingURL=CheckResultAndHandleErrors.js.map