"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonToYamlWithComments = void 0;
const yaml = require("js-yaml");
function jsonToYamlWithComments(input, shouldCommentOutProperty, dumpOptions) {
    const policyAsCodeDtoWithCommentFlags = policiesToPolicyAsCodeDtoWithCommentFlags(input, shouldCommentOutProperty);
    const yamlWithCommentFlags = policyAsCodeDtoWithCommentFlagsToYamlWithCommentFlags(policyAsCodeDtoWithCommentFlags, dumpOptions);
    return yamlWithCommentFlagsToYamlWithComments(yamlWithCommentFlags);
}
exports.jsonToYamlWithComments = jsonToYamlWithComments;
const COMMENT_FLAGS_BASE = "UNIQUE_STRING_f8qs2h5r4j_";
const START_COMMENTING = COMMENT_FLAGS_BASE + "START";
const END_COMMENTING = COMMENT_FLAGS_BASE + "END";
function applyOnEntireInput(entry, shouldCommentOutProperty) {
    if (shouldCommentOutProperty(entry)) {
    }
    else if (typeof entry === "object") {
        return Object.entries(entry).map((entry) => applyOnEntireInput(entry, shouldCommentOutProperty));
    }
}
function policiesToPolicyAsCodeDtoWithCommentFlags(input, shouldCommentOutProperty) {
    return applyOnEntireInput(input, shouldCommentOutProperty);
}
function policyAsCodeDtoWithCommentFlagsToYamlWithCommentFlags(policyAsCodeDtoWithCommentFlags, dumpOptions) {
    const sortKeys = (firstEl, secondEl) => {
        if (firstEl === START_COMMENTING) {
            return -1;
        }
        if (secondEl === START_COMMENTING) {
            return 1;
        }
        if (firstEl === END_COMMENTING) {
            return 1;
        }
        if (secondEl === END_COMMENTING) {
            return -1;
        }
        if (dumpOptions.sortKeys === undefined) {
            return -1;
        }
        if (typeof dumpOptions.sortKeys === "boolean") {
            if (dumpOptions.sortKeys === false) {
                return -1;
            }
            else {
                return -1;
            }
        }
        return dumpOptions.sortKeys(firstEl, secondEl);
    };
    return yaml.dump(policyAsCodeDtoWithCommentFlags, Object.assign(Object.assign({}, dumpOptions), { sortKeys }));
}
function yamlWithCommentFlagsToYamlWithComments(yamlWithCommentFlags) {
    let isCommenting = false;
    let commentIndent = null;
    return yamlWithCommentFlags
        .split("\n")
        .map((row) => {
        const shouldCommentCurrentLine = isCommenting;
        if (row.includes(START_COMMENTING)) {
            isCommenting = true;
            commentIndent = null;
            return row;
        }
        if (row.includes(END_COMMENTING)) {
            isCommenting = false;
            commentIndent = null;
            return row;
        }
        if (!shouldCommentCurrentLine) {
            return row;
        }
        if (commentIndent === null) {
            commentIndent = row.length - row.trimStart().length - 2;
            return (row.slice(0, commentIndent) + "# -" + row.slice(commentIndent + 1));
        }
        else {
            return (row.slice(0, commentIndent) + "#  " + row.slice(commentIndent + 1));
        }
    })
        .filter((row) => !row.includes(COMMENT_FLAGS_BASE))
        .join("\n");
}
//# sourceMappingURL=jsonToYamlWithComments.js.map