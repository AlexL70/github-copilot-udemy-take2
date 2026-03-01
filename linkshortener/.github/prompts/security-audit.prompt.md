---
name: security-audit
agent: ask
description: This prompt checks the security issues in the codebase and provides recommendations for fixing them.
---

Perform a security audit on the codebase to detect any potential security vulnerabilities in this project.

Output your findings as a markdown formatted table with the following columns: "ID" (should start at 1 and auto-increment), "Severity", "Issue" (description with details and link(s) to vulnerability documentation), "File Path" (the actual link that opens an appropriate file), "Line number(s)" and "Recommendation".

Next, ask the user which issues they want to fix by either replying "all", or "none", or a comma-separated list of issue IDs. After their reply, run a separate sub-agent (use #runSubagent tool) to fix the each issue that the user has specified. Each sub-agent should report back with a simple `subAgentSuccess_{ID}: true | false` where {ID} is the issue ID.
