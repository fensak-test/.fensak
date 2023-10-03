/**
 * Auto approve based on changes in a JSON config file
 *
 * This is a Fensak rule that checks for changes to a JSON
 * config file. The rule will only allow the change if all of the following is
 * true:
 *
 * - The change is to the file `appversions.json` file.
 * - Only the `subapp_version` key is updated.
 * - The `subapp_version` key has been updated to a semantic version.
 */

// fensak remove-start
import type {
  ILineDiff,
  IPatch,
} from "npm:@fensak-io/reng@^1.0.7";
// fensak remove-end

// deno-lint-ignore no-unused-vars
function main(inp: IPatch[]): boolean {
  const numPatches: number = inp.length;
  if (numPatches == 0) {
    // No files updated, so approve.
    console.log("Accepting since no changes.");
    return true;
  } else if (numPatches > 1) {
    // More than one file was updated, which means not just appversions.json was changed so reject.
    console.log("Rejecting since more than one file was updated.");
    return false;
  }

  const patch = inp[0];
  if (patch.op != "modified") {
    // The whole file was updated, so reject.
    console.log("Rejecting since the whole file was updated.");
    return false;
  }
  if (patch.diff.length > 1) {
    // More than one section was updated, so reject.
    console.log(
      "Rejecting since more than one section of the file was updated.",
    );
    return false;
  }
  if (patch.path != "appversions.json") {
    // Unexpected json file was updated, so reject.
    console.log("Rejecting since the update was to an unexpected json file.");
    return false;
  }

  const hunk = patch.diff[0];
  const diffs = hunk.diffOperations.filter(function (d: ILineDiff) {
    return d.op !== "untouched";
  });
  if (diffs.length == 0) {
    // No real updates made to the file, so approve.
    console.log("Accepting since no changes.");
    return true;
  } else if (diffs.length > 1) {
    // More than one line was updated, so reject.
    console.log("Rejecting since more than one line was updated.");
    return false;
  }

  const d = diffs[0];
  if (d.op !== "modified") {
    // A line was inserted, or removed from the config, which means it's not just a change to a single app version
    // config. Reject.
    console.log(
      "Rejecting since change was not a modification to an existing line.",
    );
    return false;
  }

  const subappUpdateRE = /^\s*"subapp": "v\d+\.\d+\.\d+",$/;
  return subappUpdateRE.test(d.newText);
}
