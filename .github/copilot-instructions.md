# Project instructions for GitHub Copilot

This is the BPP Campus Store, a sample app for a DevOps CI/CD lab. Learners deploy it with GitHub Actions and AWS CloudFormation. Explain your suggestions simply, because many users are new to coding.

## Project layout
- `app/`: Node.js (20+) API and storefront. **No runtime dependencies.** Use only built-in Node modules in `app/src`. Dev tools (ESLint) are allowed as dev dependencies.
- `app/test/`: tests using the built-in `node:test` runner. Run `npm test` and `npm run lint` from `app/`.
- `infra/template.yaml`: CloudFormation. **Do not add `AWS::IAM::*` resources**; the sandbox cannot create IAM roles.
- `.github/workflows/`: `ci.yml` is the entry point; the other files are reusable workflows (`workflow_call`).

## Rules
- Never hardcode or print credentials. AWS access comes from GitHub Actions secrets (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`).
- Every code change needs a test. Money is stored in pence as integers.
- Validate input on the server. Never trust values from the browser.
- Keep the UI consistent with the existing styles in `app/public/styles.css` (colour variables, Poppins and Source Sans 3).
- Changes go through a branch and a pull request, not straight to `main`.
- After a change, tell the learner how to check it: run `npm test`, `npm run lint`, then look at the pipeline in the Actions tab.
