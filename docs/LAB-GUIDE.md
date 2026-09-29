# Lab guide: ship the Campus Store with GitHub Actions and CloudFormation

**Outcome:** a code change you push to GitHub is tested automatically, deployed by CloudFormation into your
AWS sandbox, and visible on a public URL, with no credentials in your code.

## 1. Create your repository

1. Open the template repository on GitHub and choose **Use this template > Create a new repository**.
2. Clone it and open it in VS Code:
   ```bash
   git clone https://github.com/<you>/<your-repo>.git
   cd <your-repo>
   ```
3. Open the **Actions** tab. The first run of *CI/CD* builds and tests the app, and the deploy job
   reports "Deployment skipped" because there are no credentials yet. That is expected.

## 2. Give the pipeline access to your sandbox (no hardcoded keys)

Skillable issues temporary credentials for your sandbox. Store them as GitHub secrets. Do not put them in a file.

```bash
gh auth login
export AWS_ACCESS_KEY_ID=...        # from the lab instructions
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...
export AWS_REGION=us-east-1         # or the region shown in your lab
./scripts/configure-secrets.sh      # PowerShell: ./scripts/configure-secrets.ps1
```

Sandbox credentials expire with the session. When you start a new session, run the script again.

## 3. Deploy

1. Actions > **CI/CD** > **Run workflow** (or push any commit to `main`).
2. Watch the jobs: *Build and test*, *Validate infrastructure*, *Deploy to AWS sandbox*.
3. The run summary shows the store URL. Open it. The footer pill shows the first seven characters of your commit SHA.

## 4. Change something the proper way

```bash
git switch -c feature/new-product
```

1. Add a product to `app/src/products.js` and a test for it in `app/test/`.
2. Run `cd app && npm test`.
3. Push the branch and open a pull request. The pipeline runs checks but does **not** deploy.
4. Merge the pull request. The pipeline deploys and the footer pill changes to the new SHA.

## 5. Explore and extend

- Which workflow files are reusable, and how does `ci.yml` call them? (`workflow_call`, `uses:`)
- Break a test on purpose and watch the pull request fail.
- Change `InstanceType` or add a tag in `infra/template.yaml`, open a pull request, and read the CloudFormation change in the deploy log.
- Add a rule to `deploy-stack.yml` so deployments need a manual approval (GitHub Environments).
- Clean up with Actions > **Tear down stack**.

## Troubleshooting

| Symptom | Fix |
|---|---|
| "Deployment skipped" | Secrets are missing. Run `configure-secrets` again. |
| `ExpiredToken` or `InvalidClientTokenId` | The sandbox session changed. Re-run `configure-secrets`, then re-run the workflow. |
| `AccessDenied` on an `ec2:` or `cloudformation:` action | The sandbox policy is missing an action. Compare it with `docs/sandbox-iam-policy.json`. |
| Stack is in `ROLLBACK_COMPLETE` | Run **Tear down stack**, then deploy again. |
| Deploy waits for `/health` and times out | Check the "instance boot log" step at the end of the failed run. |

## For instructors

- `docs/sandbox-iam-policy.json` is the full set of AWS permissions the pipeline needs. Nothing creates IAM roles or pipeline services.
- The instance pulls code from GitHub over HTTPS. The pipeline passes its own short-lived `GITHUB_TOKEN` so private learner repositories work.
- Skillable can inject the credentials into the lab instructions as environment variables or lab-instruction tokens.
