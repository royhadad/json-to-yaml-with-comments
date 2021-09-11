import * as yaml from "js-yaml";
import { DumpOptions } from "js-yaml";

type Entry = [string, unknown];
type ShouldCommentOutProperty = (entry: Entry) => boolean;

export function jsonToYamlWithComments(
  input: Entry,
  shouldCommentOutProperty: ShouldCommentOutProperty,
  dumpOptions: DumpOptions
): string {
  const policyAsCodeDtoWithCommentFlags =
    policiesToPolicyAsCodeDtoWithCommentFlags(input, shouldCommentOutProperty);
  const yamlWithCommentFlags =
    policyAsCodeDtoWithCommentFlagsToYamlWithCommentFlags(
      policyAsCodeDtoWithCommentFlags,
      dumpOptions
    );
  return yamlWithCommentFlagsToYamlWithComments(yamlWithCommentFlags);
}

// COMMENT_FLAGS_BASE is a string that shouldn't (realistically) be included in the yaml string,
// this way we can use it for flagging certain points in the yaml
const COMMENT_FLAGS_BASE = "UNIQUE_STRING_f8qs2h5r4j_";
const START_COMMENTING = COMMENT_FLAGS_BASE + "START"; // A flag that tells the parser to start commenting out lines
const END_COMMENTING = COMMENT_FLAGS_BASE + "END"; // A flag that tells the parser to stop commenting out lines

// function mapSingleProperty(
//   property: unknown,
//   shouldCommentOutProperty: ShouldCommentOutProperty
// ) {
//   if (shouldCommentOutProperty(property)) {
//     if (typeof property === "object") {
//       return {
//         [START_COMMENTING]: true,
//         ...property,
//         [END_COMMENTING]: true,
//       };
//     } else {
//       return property; // TODO handle this case
//     }
//   } else {
//     return property;
//   }
// }

function applyOnEntireInput(
  entry: Entry,
  shouldCommentOutProperty: ShouldCommentOutProperty
): unknown {
  if (shouldCommentOutProperty(entry)) {
    // TODO handle this case
  } else if (typeof entry === "object") {
    return Object.entries(entry).map((entry: Entry) =>
      applyOnEntireInput(entry, shouldCommentOutProperty)
    );
  }
}

function policiesToPolicyAsCodeDtoWithCommentFlags(
  input: Entry,
  shouldCommentOutProperty: ShouldCommentOutProperty
): unknown {
  return applyOnEntireInput(input, shouldCommentOutProperty);
}

function policyAsCodeDtoWithCommentFlagsToYamlWithCommentFlags(
  policyAsCodeDtoWithCommentFlags: unknown,
  dumpOptions: DumpOptions
): string {
  const sortKeys = (firstEl: string, secondEl: string) => {
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
      } else {
        return -1; // TODO do default sort
      }
    }

    return dumpOptions.sortKeys(firstEl, secondEl);
  };

  return yaml.dump(policyAsCodeDtoWithCommentFlags, {
    ...dumpOptions,
    sortKeys,
  });
}

function yamlWithCommentFlagsToYamlWithComments(
  yamlWithCommentFlags: string
): string {
  let isCommenting = false;
  let commentIndent: null | number = null;
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
        return (
          row.slice(0, commentIndent) + "# -" + row.slice(commentIndent + 1)
        );
      } else {
        return (
          row.slice(0, commentIndent) + "#  " + row.slice(commentIndent + 1)
        );
      }
    })
    .filter((row) => !row.includes(COMMENT_FLAGS_BASE))
    .join("\n");
}
