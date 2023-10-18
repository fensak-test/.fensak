/**
 * A required rule that enforces that only PRs originating from a branch named `feature` can be merged to `main`.
 */

// fensak remove-start
import type {
  IChangeSetMetadata,
  IPatch,
} from "npm:@fensak-io/reng@^1.1.3";
// fensak remove-end

// deno-lint-ignore no-unused-vars
function main(_inp: IPatch[], metadata: IChangeSetMetadata): boolean {
  const featureBranchRE = /^feature\/.*$/;
  return featureBranchRE.test(metadata.sourceBranch) && metadata.targetBranch === "main";
}
