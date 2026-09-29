# BPP Campus Store: ship it with CI/CD

**Your challenge:** the university merchandise store (hoodies, pens, notebooks, bags and gifts) is ready to go live.
Get it there the way professional DevOps teams do. Every change you make is tested automatically, and every
approved change is deployed to the cloud by a pipeline, with no manual uploads and no passwords in your code.

By the end you will have:

- your own copy of this repository on GitHub
- a GitHub Actions pipeline that builds and tests your code on every push and pull request
- an AWS server that CloudFormation builds for you from a template
- a live store at a public URL, updated by a `git push`
- a code change you shipped through a pull request

You'll need a GitHub account, Git, and a code editor such as VS Code. Node.js 20 or later is only needed if you want to run the store on your own machine.

## How it works

```
 You                GitHub                 GitHub Actions               AWS sandbox
  |  git push  ->  your repo  ->  1. lint and test the code
  |                               2. check the CloudFormation template
  |                               3. log in to AWS using secrets   ->  4. CloudFormation builds
  |                                                                      a network + a server
  |                                                                   5. the server downloads
  |                                                                      your commit and runs it
  |  <----------- 6. the pipeline checks the site is live and shows you the URL
```

Two ideas to keep in mind:

- **Continuous integration (CI)** means every change is automatically built and tested, so problems show up within minutes.
- **Continuous deployment (CD)** means a change that passes is automatically released, in this case by building the infrastructure with **infrastructure as code** (CloudFormation) and starting your app on it.

## Your missions

Work through these in order. [docs/LAB-GUIDE.md](docs/LAB-GUIDE.md) has the full instructions and a troubleshooting table.

- [ ] **1. Make it yours.** Create your own repository from this template and clone it.
- [ ] **2. Watch the pipeline run.** Open the **Actions** tab. Which jobs ran? Why was the deploy skipped?
- [ ] **3. Connect to AWS safely.** Store your sandbox credentials as GitHub secrets using `scripts/configure-secrets`. Don't put them in any file.
- [ ] **4. Deploy.** Run the pipeline and open the store URL from the run summary.
- [ ] **5. Ship a change properly.** Add a new product on a branch, open a pull request, watch the checks, merge, and see your commit ID appear in the footer of the live site.
- [ ] **6. Break it on purpose.** Make a test fail and see what the pipeline does. Then fix it.
- [ ] **7. Clean up.** Use the **Tear down stack** workflow to remove what you built.

**Stretch goals**

- Require a manual approval before deployment (look up GitHub Environments).
- Change the server size or add a tag in `infra/template.yaml`, and read the CloudFormation change in the deploy log.
- Add a step to the pipeline that comments on the pull request when checks pass.

## What is in this repository

| Path | What it is |
|---|---|
| `app/` | The Campus Store: a small Node.js API, the storefront pages, and tests |
| `infra/template.yaml` | The CloudFormation template. It describes the network, firewall and server to build |
| `.github/workflows/ci.yml` | The pipeline entry point. It runs on pull requests and on pushes to `main` |
| `.github/workflows/build-test.yml` | A reusable workflow that installs, lints and tests the app |
| `.github/workflows/validate-infra.yml` | A reusable workflow that checks the CloudFormation template |
| `.github/workflows/deploy-stack.yml` | A reusable workflow that logs in to AWS, deploys and checks the site is live |
| `.github/workflows/teardown.yml` | A manual workflow that deletes what you deployed |
| `scripts/configure-secrets.sh` / `.ps1` | Copies your sandbox credentials into GitHub secrets |
| `docs/LAB-GUIDE.md` | Step-by-step instructions |
| `docs/sandbox-iam-policy.json` | The AWS permissions the pipeline needs |

## When does the pipeline deploy?

| What you do | Build and test | Template check | Deploy |
|---|---|---|---|
| Open a pull request | yes | yes | no |
| Merge or push to `main` | yes | yes | yes, once your AWS secrets are set |

Until you add your credentials the deploy job skips with a warning. That is expected.

## Try the store on your own machine

You don't need AWS for this.

```bash
cd app
npm ci          # install the development tools
npm test        # run the tests
npm start       # open http://localhost:3000
```

Run `npm run lint` too. The pipeline runs the same checks, and finding problems locally is faster than waiting for it.

## Golden rules

- Never commit an access key, secret key or token. Use GitHub secrets.
- Never push straight to `main` for a change. Use a branch and a pull request.
- Sandbox credentials expire when your lab session ends. If the pipeline reports `ExpiredToken`, run `configure-secrets` again.

## Stuck?

1. Open the failed run in the **Actions** tab and read the first red step. The error is usually explicit.
2. Check the troubleshooting table in [docs/LAB-GUIDE.md](docs/LAB-GUIDE.md).
3. Ask your trainer, and include the name of the failed step and the error text.
