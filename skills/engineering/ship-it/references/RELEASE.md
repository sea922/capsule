# Cutting a release

Read when shipping includes a version, tag, changelog, or published release. `ship-it` coordinates the steps; the project's release tooling and runbook own the mechanics, and anything written here yields to them.

## 1. Find how this project releases

Read the repository before choosing anything: a release runbook or contributing guide, release workflows in CI, a changeset or release-automation configuration, a changelog file and its format, existing tags and their naming (`v1.2.3` or `1.2.3`, per-package prefixes in a monorepo), and every file that carries the version. Check whether tags are signed, whether a release branch is used, and whether publishing happens from CI when a tag or merge lands.

When automation owns the version and changelog, drive that automation. Hand-editing a version field it manages causes drift that the next automated run can turn into a wrong or regressed version.

**Complete when:** the release mechanism, version scheme, tag format, version-bearing files, and what triggers publishing are known from repository evidence.

## 2. Decide the version from the changes

List what merged since the last release: the commits and merged pull or merge requests between the last tag and the release revision. Classify each as breaking, a new capability, a fix, or internal.

Apply the project's scheme. Where it has none, semantic versioning is the default: a breaking change raises the major number, a backward-compatible capability the minor, fixes the patch, and a pre-1.0 project follows its own stated rule for breaking changes. Use a pre-release identifier for a candidate. A change is breaking by its effect on consumers, not by its label, so read anything that touches a public interface, a configuration key, a schema, or a default.

**Complete when:** the version is chosen with the change that determines it named.

## 3. Build the changelog

Use the project's tool first: pending changeset files, a generator driven by conventional commits, or the forge's generated notes. Without one, write entries from the merged requests, not from raw commit subjects.

Write for someone deciding whether and how to upgrade. Group by breaking changes, added, changed, and fixed. Put breaking changes first, each with what to do about it. Leave out internal refactors and CI changes unless they affect users. Link each entry to its request. Check the notes against the diff between the two revisions, so nothing shipped is missing and nothing unshipped is claimed.

**Complete when:** the changelog matches the range being released, and every breaking change has an upgrade note.

## 4. Stop for the go-ahead

A tag and a published release are visible to others and hard to withdraw: registries often refuse to reuse a version, and a moved tag breaks anyone who fetched it. Before either, confirm the release revision is the one whose checks passed, then present the version, the tag name, the target revision, the changelog, and what publishing will trigger. Wait for the user's go-ahead unless the request already gave it for this release.

**Complete when:** the user has approved this version at this revision, or the prepared release is reported as awaiting that decision.

## 5. Tag and publish

Update the version-bearing files and the changelog through the project's flow, which usually means a reviewed release change merged before the tag. Create the tag on that revision in the project's format, annotated or signed as the project does, and push it.

Create the release on the forge with the CLI already in use: `gh release create` on GitHub or `glab release create` on GitLab, attaching the notes and any build artifacts and marking a pre-release as one. Check the installed version's options before relying on a flag. When CI publishes on a tag, let it; do not also publish by hand.

**Complete when:** the tag exists on the intended revision and the release is created, or CI has taken over publishing and its run is identified.

## 6. Verify what was published

Confirm from the outside: the tag resolves to the intended revision, the release page shows the right notes and artifacts, the publishing run finished, and the registry or download location serves the new version. Install or fetch the published artifact fresh and check that it reports the expected version and starts. A release that was created but whose artifact was never verified is published, not verified.

**Complete when:** fresh evidence from the forge and the artifact's destination shows the intended version, or the gap is named.

## 7. When a release is bad

Prefer a new release that fixes or reverts over rewriting the bad one. Do not move or delete a pushed tag, and do not republish different contents under the same version; consumers and caches may already hold it. Mark the bad release as such in its notes, use the registry's deprecation or yank mechanism where it exists, and say which version to use instead. Deleting a release, removing a published package, or rewriting a tag needs the user's explicit decision. For a deployed service, rollback follows the deployment reference.
