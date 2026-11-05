# The challenge: choose your outcome

Everyone starts from the same place and the same pipeline. How far you take it is up to you. Each outcome builds on the one before.

| Outcome | What you do | What you show |
|---|---|---|
| **Baseline** | Deploy the store through the pipeline, using temporary credentials stored as GitHub secrets | A green pipeline run, the live store URL, and the commit ID in the site footer |
| **Intermediate** | Make a small change on a branch, open a pull request, let the checks run, merge, and watch it go live | Your pull request (with passing checks) and the new commit ID on the live site |
| **Advanced** | Add a real feature, or improve the pipeline or infrastructure | A pull request with tests, a working deployment, and a short explanation of what you did |

You can use AI tools in this challenge, and you're encouraged to. See [Using AI well](#using-ai-well).

## Evidence checklist

For every outcome, keep these ready to show your trainer:

- [ ] A link to your repository
- [ ] A link to a green run of the **CI/CD** workflow
- [ ] The live store URL, showing your latest commit ID in the footer
- [ ] Proof that no credentials are stored in your code (GitHub secrets page, with the values hidden)
- [ ] Your answers to the reflection questions below

## Feature ideas

Pick something that suits your confidence. All of them must go through a branch, a pull request and passing checks.

**Tier A: content changes (no real coding)**

- Add a new product to `app/src/products.js` (a new bag colour, a scarf, a water bottle)
- Change the free-delivery threshold using the `FREE_SHIPPING_THRESHOLD_PENCE` setting
- Change a price or a product description, and update the test that checks it

**Tier B: small features (with an AI assistant helping)**

- Add a new product category, such as "tech", and check it appears as a filter
- Add a discount code at checkout, with the rule checked on the server and a test
- Add a search endpoint such as `/api/products/search?q=hoodie`, with tests
- Show "only a few left" on products using a new `stock` field

**Tier C: pipeline and infrastructure**

- Require a manual approval before deploying (GitHub Environments)
- Make the pipeline comment on the pull request when the checks pass
- Change something in `infra/template.yaml` (a tag, the instance size) and read the change in the deploy log
- Add an output or alarm to the CloudFormation stack
- Add a second workflow that runs a scheduled health check on the live site

A feature isn't finished until it has a test and the pipeline is green.

## Using AI well

AI tools such as GitHub Copilot, Copilot Chat or ChatGPT are part of how developers work today, so use them. Some uses that work well:

- **Explain:** "Explain what `.github/workflows/ci.yml` does, step by step."
- **Build:** "Add a discount code to the checkout in `app/src/orders.js`, and write tests in `app/test/`."
- **Debug:** paste the first error from a failed pipeline step (with any secrets removed) and ask what it means.
- **Review:** "What could go wrong with this change?"

Ground rules:

1. **Understand what you submit.** You must be able to explain every line of what the AI wrote.
2. **Let the pipeline be the judge.** If the tests and lint pass, you've got evidence. If not, the AI was wrong, so go back and fix it.
3. **Never share secrets.** Don't paste access keys, tokens or your `.env` into an AI tool.
4. **Keep a short note** of what you asked, what the AI suggested, and what you changed or rejected. That shows your judgement.

## Reflection questions

Answer these in a few sentences each. Short answers in your own words are fine.

1. What happens, in order, when you push a commit to `main`?
2. Why do the AWS credentials live in GitHub secrets and not in the repository?
3. What does the CloudFormation template do that clicking in the AWS console would not?
4. How does the pipeline know that the new version is actually running on the server?
5. A test fails in a pull request. What does the pipeline do, and why is that useful?
6. What would you change next to make this pipeline safer or faster?
