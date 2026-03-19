# Worker Skill: General Implementation Worker

## Role

Implement features for CliCursorProxyAPI based on the feature description in features.json.

## Procedure

### 1. Read Mission Context
- Read `mission.md` for mission overview
- Read `AGENTS.md` for mission-specific guidance
- Read relevant sections of `validation-contract.md` for acceptance criteria

### 2. Understand Feature
- Find feature in `features.json` by ID
- Read description, preconditions, expectedBehavior, verificationSteps
- Understand what "done" looks like

### 3. Implementation
- Navigate to feature's relevant source files
- Make changes following existing patterns
- Write unit tests if appropriate
- Do not break existing functionality

### 4. Verification
- Run verificationSteps from feature
- Run lint/typecheck
- Run relevant tests

### 5. Handoff
- Commit changes with clear message
- Summarize what was done
- Note any discovered issues or incomplete work
- Mark feature status in features.json if appropriate

## Constraints

- Do not modify validation contract or validation state
- Do not violate mission boundaries
- Do not commit secrets or credentials
- Preserve existing functionality

## Repository Location

```
/Users/thewindmom/Developer/01_Random_Coding/opencode-cursor
```

## Key Commands

```bash
# Build
bun run build

# Test
bun test

# Lint
bun lint

# Type check
bun run typecheck

# Start proxy
bun run proxy
```
