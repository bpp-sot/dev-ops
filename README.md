# BPP Campus Store - DevOps CI/CD lab template

A template repository for the Level 6/7 DevOps & Cloud lab. Learners keep application code and
infrastructure-as-code in GitHub, and **GitHub Actions** builds, tests and deploys them into an
ephemeral Skillable CloudSlice AWS sandbox with CloudFormation. No AWS pipeline services (CodePipeline,
CodeBuild) and no IAM role creation are needed in the sandbox.

```
Local VS Code / browser --git push--> GitHub repo --> GitHub Actions
                                                        |  lint, test, cfn-lint
                                                        |  aws cloudformation deploy (temporary credentials)
                                                        v
                                        Skillable AWS sandbox: VPC + security group + EC2
                                        EC2 checks out the exact commit and serves the store
```

## Repository layout

| Path | Purpose |
|---|---|
| `app/` | Campus Store: dependency-free Node.js API, storefront UI, tests, ESLint config |
| `infra/template.yaml` | CloudFormation: VPC, subnet, security group, EC2 instance, Elastic IP (no IAM resources) |
| `.github/workflows/ci.yml` | Entry point. Runs on pull requests and pushes to `main` |
| `.github/workflows/build-test.yml` | Reusable: install, lint, test, audit, start-up check |
| `.github/workflows/validate-infra.yml` | Reusable: `cfn-lint` on the template |
| `.github/workflows/deploy-stack.yml` | Reusable: authenticate, deploy the stack, wait for the new commit to serve traffic |
| `.github/workflows/teardown.yml` | Manual: delete the stack |
| `scripts/configure-secrets.*` | Loads sandbox credentials from your shell into GitHub secrets |
| `docs/LAB-GUIDE.md` | Learner walkthrough |
| `docs/sandbox-iam-policy.json` | Minimum sandbox permissions (for the CloudSlice security review) |

## Pipeline behaviour

| Event | Build and test | Infra lint | Deploy |
|---|---|---|---|
| Pull request to `main` | yes | yes | no |
| Push / merge to `main` | yes | yes | yes, if AWS secrets exist |

The `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_SESSION_TOKEN` secrets are never in the code.
If they are missing the deploy job skips with a clear warning instead of failing. Optional repository
variables: `AWS_REGION` (default `us-east-1`) and `STACK_NAME` (default `campus-store`).

## Run the app locally

```bash
cd app
npm ci
npm test
npm start        # http://localhost:3000
```

## Using this as a Skillable lab template

1. Mark the repo as a template (**Settings > Template repository**).
2. Learners choose **Use this template** to create their own copy.
3. Learners run `scripts/configure-secrets.sh` with the credentials Skillable gives them, then push.

See [docs/LAB-GUIDE.md](docs/LAB-GUIDE.md).
