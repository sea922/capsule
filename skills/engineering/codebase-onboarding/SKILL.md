---
name: codebase-onboarding
description: Map an unfamiliar repository so a person or agent can start working in it - stack, architecture, entry points, how a request flows, conventions, and how to run and test it. Use when joining or inheriting a project, when asked for an overview, tour, or onboarding guide of a codebase or one area of it, "how does this repo work", "where do I start", or when keeping the repository's docs in step with the code. Deciding how to change the design belongs to codebase-design; external research to research.
---

# Codebase onboarding

Give the reader an accurate map quickly: what this system is, how it is put together, and where to start. Every statement comes from a file you read, with its path, and anything you could not confirm is marked as unconfirmed.

## 1. Fix the reader and the scope

Ask or infer who the map is for and what they need to do next: fix a bug in one area, add a feature, review the system, or take it over. Scope the map to that: the whole repository, one service, or one feature. This skill is read-only unless the user asks for the guide to be saved as a file; it does not edit code, install dependencies, or run the application without permission.

**Complete when:** the reader, their next task, and the scope are stated.

## 2. Survey before reading deeply

Gather signals without reading every file: the README and contributor docs, existing agent instruction files, package and build manifests, the top two levels of the directory tree, entry points, CI workflows, container and deploy files, and the test layout. Read existing architecture docs and decision records, then check them against the code, because documentation drifts.

When subagents are available and the repository is large, hand separate areas to the read-only `orchestrate-explorer` agent and combine the reports.

**Complete when:** the languages, frameworks, build and test tools, deployable units, and existing docs are listed with their source files.

## 3. Map the architecture

Describe the shape: one application or several, where the boundaries are, what each top-level directory is for, and which parts own data. Name the external systems it depends on. Describe what the code does today, not what a framework usually does.

Then trace one real path end to end, such as a typical request, job, or command: where it enters, how it is validated and authorized, where the business rules live, how it reaches storage, and what comes back. Cite each hop as `path:line`. A traced path teaches the layout better than a directory list.

**Complete when:** the reader can name the main parts and follow one real path through them.

## 4. Find the conventions

Report what the code already does, with an example file for each: naming and file layout, error handling, how dependencies are wired, state and data access patterns, test style and location, and commit, branch, and review practice from recent history. Where the code is inconsistent, say which pattern is newer or more common instead of picking one silently.

**Complete when:** each convention cites an example, and inconsistencies are named.

## 5. Show how to work in it

List the commands to install, run, test, lint, and build, taken from the manifests, CI, and docs. Run them only with permission; otherwise mark them as untested. Add the first steps for the reader's next task: the files to read first, the tests that cover the area, and the traps you noticed, such as generated files, required services, or slow suites.

**Complete when:** the reader has commands marked as run or untested, and a starting point for their task.

## 6. Deliver the map

Keep it short enough to read in a few minutes, in this order: what the system is, the stack, the architecture with the traced path, key directories, conventions, how to run and test, where to start, and open questions. Use a diagram when the structure has more than a few parts.

Offer to save it as a file when the user wants a lasting guide, and follow `writing-for-agents` if they also want an agent instruction file. Do not overwrite existing docs: propose changes to them. When the request is to keep existing documentation in step with the code instead of mapping the repository once, follow [LIVING-DOCS.md](references/LIVING-DOCS.md).

**Complete when:** the reader has the map, its unconfirmed points are marked, and nothing was written without being asked.
