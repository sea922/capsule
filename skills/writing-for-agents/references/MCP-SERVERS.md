# Building an MCP server

Read this when building, extending, or debugging a Model Context Protocol
server. [TOOLS.md](TOOLS.md) owns how each tool is named, described, and
shaped; this file owns the server around the tools.

The protocol and its SDKs change quickly. Read the current specification and
the README of the SDK version the project pins before writing code, and take
registration and transport API names from there, not from memory or from this
file. If the project already depends on an SDK major version, stay on it
unless the user asks to migrate, and do not mix examples from two majors.

## 1. Decide what the server exposes

| Primitive | Who decides to use it | Use it for |
| --- | --- | --- |
| Tool | The model, during a task | An action or a query with parameters |
| Resource | The client or user, by address | Read-only content with a stable identifier |
| Prompt | The user, by picking it | A reusable, parameterized starting instruction |

Client support for resources and prompts varies, so anything the agent must
reach during a task needs to be a tool. Start from the tasks a user will give
the agent and list the calls each one needs. Wrapping every endpoint of an API
one-to-one gives the agent many low-level steps; a few tools that complete a
task are usually easier to use well. Add broad coverage when agents need to
compose operations the workflow tools did not foresee.

Prefix tool names with the service, so they stay distinct beside other
servers' tools in the same session.

## 2. Choose the transport

- **stdio** for a server the client starts on the user's machine. Standard
  output carries the protocol, so send every log line to standard error; one
  stray print corrupts the stream.
- **Streamable HTTP** for a server reached over the network. Prefer stateless
  request handling unless a feature needs a session, because it scales and
  restarts cleanly. Support the older HTTP-plus-SSE transport only for a client
  that still requires it.

Keep tool logic free of transport details, and choose the transport at the
entry point. The same handlers then run under both.

## 3. Validate inputs

Give every tool an input schema in the SDK's schema library, with types,
bounds, enumerations, and a description per field. Validate again inside the
handler anything the schema cannot express, such as a path that must stay
under a root or an identifier the caller must own. Arguments come from a model
that may be relaying untrusted text, so treat them as you would a public API
request: no argument reaches a shell, query, or file path unescaped. Declare
an output schema and return structured content where the SDK supports it.

## 4. Return errors the agent can act on

Distinguish two failures. A malformed request or an unknown tool is a protocol
error. A tool that ran and failed returns a result flagged as an error, with a
message the model can use to correct the call, as TOOLS.md describes. For
arguments that fail validation, follow the specification version in use;
recent revisions return them as tool errors so the model can correct the call. Keep stack traces, internal paths,
and upstream credentials out of both. Put a timeout on every outbound call so
a hung dependency becomes a clear error.

Annotate each tool with the hints the protocol offers for read-only,
destructive, idempotent, and open-world behavior. They help a client decide
when to ask the user, but they are hints: the server still enforces its own
permissions. Make tools idempotent where possible, since clients retry.

## 5. Authenticate and limit

- A local stdio server takes credentials from its environment, never from tool
  arguments, and never echoes them in results or logs.
- A remote server authenticates every request using the authorization scheme
  the current specification defines, validates that a token was issued for
  this server, and does not forward a client's token to an upstream service.
- A server listening on HTTP validates the `Origin` header and binds to
  localhost when it is meant for local use, to resist DNS rebinding.
- Scope upstream credentials to the least the tools need, and apply the
  caller's permissions inside each tool, not only at connection time.
- Bound result sizes and paginate. Respect upstream rate limits, and say in
  the tool description when a call is slow, costly, or rate limited.

Use `security-review` when the server handles secrets or other users' data.

## 6. Test it

1. Build or type-check, then start the server and confirm it lists what you
   registered.
2. Drive it with the protocol's inspector tool: call each tool with valid
   input, invalid input, an empty result, and a failing dependency, and read
   exactly what comes back.
3. Connect it to a real client and give an agent realistic tasks, as the
   "Prove it" section of TOOLS.md describes. Read which tools it picks and
   where it stalls.
4. Keep a small set of realistic, read-only questions with known answers and
   rerun them after changing a definition.

Pin the SDK version, and read its release notes before upgrading.
