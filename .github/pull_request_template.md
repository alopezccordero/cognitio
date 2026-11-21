## Summary

<!-- What does this PR change, and why? One or two sentences. -->

Closes #

## Area

<!-- Check every part of Cognitio this PR touches. -->

- [ ] Auth / login (Resend magic links, sessions)
- [ ] Rooms and multi-user collaboration
- [ ] Research area definition
- [ ] Paper retrieval (Semantic Scholar)
- [ ] Gap extraction / LLM features (Groq)
- [ ] UI (Dissolve design direction)
- [ ] CI/CD, tooling, dependencies
- [ ] Docs

## Type of change

- [ ] Feature
- [ ] Bug fix
- [ ] Refactor (no behaviour change)
- [ ] Performance
- [ ] Chore / dependencies

## How to test

<!-- Steps a reviewer can follow locally. Include the research area or room setup you used. -->

1.
2.

## Screenshots / recordings

<!-- Required for UI changes. Before/after if relevant. Delete this section otherwise. -->

## Checklist

### General
- [ ] `npm run lint`, `npm run typecheck` and `npm run build` pass locally
- [ ] I tested the change in the browser (not only the build)

### Secrets and config
- [ ] No API keys, tokens or `.env` files are committed
- [ ] New env vars are added to `.env.example` with a placeholder and a comment
- [ ] Server-only secrets (Resend, Groq, Semantic Scholar, auth) are **not** prefixed with `VITE_`, so they never reach the browser bundle

### Auth and rooms (if touched)
- [ ] Room data is only readable/writable by members of that room
- [ ] Logged-out users cannot reach protected routes or API endpoints
- [ ] Behaviour checked with at least two users in the same room

### Papers and LLM (if touched)
- [ ] Semantic Scholar calls handle rate limits (429) and empty results
- [ ] Groq calls handle failures/timeouts and malformed model output
- [ ] Prompt or model changes were checked on a few real research areas; gaps listed are traceable to the paper that reported them

### UI (if touched)
- [ ] Works at phone width and with `prefers-reduced-motion`
- [ ] Keyboard accessible, sufficient colour contrast

## Notes for reviewers

<!-- Anything risky, follow-ups, or decisions you'd like a second opinion on. -->
