---
name: write-code
description: "Ensures a uniform code‑generation pattern for all models and CLI tools in the project. Provides consistent templates, JSDoc headers, and import handling."
category: code-generation
risk: safe
source: community
date_added: "2026-04-15"
author: delin
tags: [code, generation, template, cli]
tools: [openai, claude, gemini]
---

# write-code — Code Generation Skill

## Overview

Ensures a uniform code‑generation pattern for all models and CLI tools in the project. The skill activates on trigger phrases such as **“write code,” “create code,”** and **“generate code file.”** It creates boilerplate files that conform to the project’s linting, formatting, and architectural standards, and inserts a JSDoc header describing the generated entity.

## When to Use This Skill

- When a new component, page, hook, or any source file needs to be scaffolded.
- When multiple models/CLIs (OpenCode, Gemini, Kilocode, GitHub Copilot, Claude, Codex) should follow the same generation contract.
- When the user requests file creation without specifying the exact path; the skill will infer placement under `src/` respecting existing folder hierarchy.

## How It Works

1. **Trigger Detection** – Recognises trigger phrases defined in the skill metadata.
2. **Parameter Extraction** – Parses user‑provided `--name`, `--type`, and optional description.
3. **Path Resolution** – Maps the requested type to a canonical location under `src/` (e.g., components, hooks, pages).
4. **Template Rendering** – Fills placeholders (`{{FILE_PATH}}`, `{{FILE_NAME}}`, `{{ENTITY_NAME}}`, `{{DESCRIPTION}}`) using the provided values.
5. **Import Hygiene** – Preserves existing import style and adds missing type imports automatically.
6. **Safety Checks** –
   - Files are only created inside `src/`.
   - Existing files are never overwritten without explicit user consent.
   - Ambiguous identifiers prompt the user for clarification.

## Rules for Code Generation
- ✅ Respect the project's ESLint/Prettier configuration.
- ✅ Generate files under `src/` following the existing folder hierarchy.
- ✅ Add a JSDoc comment header describing the generated entity.
- ✅ Preserve existing import style (named vs default) and add missing type imports.
- ❌ Never modify existing business‑logic files without explicit user request.
- ❌ Never create files outside the repository root.

## Template Placeholders
- `{{FILE_PATH}}` – relative path where the new file will be created.
- `{{FILE_NAME}}` – name of the file (without extension).
- `{{ENTITY_NAME}}` – capitalised name of the component/class/function.
- `{{DESCRIPTION}}` – short description supplied by the user.

## Example Usage
```
# OpenCode CLI
opencode use write-code --name MyComponent --type component

# Gemini CLI
gemini skill run write-code "create code MyComponent component"

# Kilocode CLI
kilocode run write-code "generate code file MyComponent.tsx"
```

For detailed configuration see the README in the `write-code` skill directory.
