# Bucket B — Manual Firebase Hosting setup (you run this, not Claude)

Part of the CI/Firebase Hosting deploy plan (see `CLAUDE.md`'s "Before you open a PR" and
`docs/governance/GOVERNANCE.md`'s lifecycle step 5). Bucket A (CI workflow, secrets-scan
hook, doc/governance updates) is already implemented and committed. This step needs
interactive browser OAuth that Claude Code can't do from this sandboxed environment — so
it's yours to run.

Run everything below from the repo root (`/workspaces/fast-lane`) in this Codespace's
regular terminal, not through Claude Code.

---

## 1. Authenticate the Firebase CLI

Codespaces has no local browser to catch a `localhost` OAuth redirect, so use the
device-code flow instead:

```bash
npx firebase-tools@latest login --no-localhost
```

Follow the printed URL (open it on your phone or any browser), authorize, and paste the
confirmation code back into the terminal.

## 2. Create the project + wire GitHub Actions

```bash
unpx firebase-tools@latest init hosting:github
```

This single command creates the Firebase project, configures Hosting, and sets up the
GitHub Actions deploy workflows — including creating and wiring the service-account secret
automatically. Expected prompts and the answers matching the decisions already made for
this repo:

| Prompt | Answer |
|---|---|
| "Are you ready to proceed?" | **Yes** |
| Project selection | **Use an existing project** → `mrt-one-day`. Confirmed with the user this project is dedicated to fast-lane and currently has no Hosting configured — not MRT2's live backend project. |
| Hosting site | Set fast-lane up as its **own Hosting site** within `mrt-one-day` (multi-site hosting), not the project's default site — keeps it cleanly separated even though it shares a project. If `firebase init hosting:github` doesn't prompt for a site name, run `firebase hosting:sites:create <site-id>` first, then `firebase target:apply hosting fast-lane <site-id>` before re-running init. |
| "What do you want to use as your public directory?" | **dist** |
| "Configure as a single-page app (rewrite all urls to /index.html)?" | **Yes** |
| "Set up automatic builds and deploys with GitHub?" | **Yes** |
| GitHub authorization | Follow the printed device-code URL, authorize for `rpdouglas/fast-lane` |
| "For which GitHub repository would you like to set up a GitHub workflow?" | **rpdouglas/fast-lane** |
| "Set up the workflow to run a build script before every deploy?" | **Yes** (accept the detected `npm ci && npm run build`, or type it if asked) |
| "Set up automatic deployment to your site's live channel when a PR is merged?" | **Yes**, branch **main** |

This generates, in the repo:
- `firebase.json`
- `.firebaserc`
- `.github/workflows/firebase-hosting-merge.yml` (deploys to the live channel on merge to `main`)
- `.github/workflows/firebase-hosting-pull-request.yml` (deploys an ephemeral preview channel per PR)

...and creates + attaches a `FIREBASE_SERVICE_ACCOUNT_*`-style GitHub Actions secret to the
repo automatically — this is the part deliberately left to the CLI's own tested flow rather
than hand-rolled, since a mistake in service-account JSON handling is exactly the kind of
thing not worth risking by hand.

### Troubleshooting: "Service account ... does not exist" (404)

Hit this on the first attempt: `firebase init` silently reused a stale cached project
association (`~/.config/configstore/firebase-tools.json` → `activeProjects`, keyed by this
directory's absolute path) and then tried to reuse a GitHub Actions service account that no
longer exists for that project. Fix:

```bash
npx firebase-tools@latest use --clear
npx firebase-tools@latest init hosting:github
```

Re-run project/site selection explicitly (don't let it silently default) — pick `mrt-one-day`
and set up its own Hosting site per the table above. If the same SA 404 recurs, it means a
previous partial `init` run left a broken service-account reference specifically on
`mrt-one-day`; check `gh secret list --repo rpdouglas/fast-lane` for a stray
`FIREBASE_SERVICE_ACCOUNT_*` secret from that attempt and delete it (`gh secret remove ...`)
before retrying, so init creates a fresh service account rather than trying to reuse the dead
one.

## 3. (Optional) Enforce the PR-based workflow mechanically

Now that CI exists to gate on, you can require the `ci.yml` `build` check to pass before a
PR can merge into `main`:

```bash
gh api repos/rpdouglas/fast-lane/branches/main/protection \
  -X PUT \
  -f required_status_checks[strict]=true \
  -f 'required_status_checks[contexts][]=build' \
  -f enforce_admins=false \
  -f required_pull_request_reviews=null \
  -f restrictions=null
```

This doesn't require a second human reviewer (there isn't one) — it's purely mechanical
enforcement of the PR-based practice already adopted. Skip this if you'd rather keep it
convention-only for now; nothing else in the plan depends on it.

## 4. Hand the session back

Once steps 1–2 (and optionally 3) are done, come back to Claude Code — Bucket C picks up
from here:

1. Read the two generated workflow files and insert `npm run lint` + `npm run test:once`
   steps before their existing build/deploy step (exact insertion point depends on what
   that firebase-tools version actually generated).
2. `gh secret list --repo rpdouglas/fast-lane` — confirm a `FIREBASE_SERVICE_ACCOUNT_*`
   secret exists (read-only, never viewing the value itself).
3. Confirm `firebase.json`'s `public` is `dist` and `hosting.rewrites` has the SPA
   catch-all, matching `vite.config.ts`'s root-path (no `base` override) build.
4. `npm run build` once locally to confirm `dist/` matches what `firebase.json` expects.
5. Commit Bucket A's files together with (or separately from) the newly-generated/patched
   files, then open the first PR (`gh pr create`, still requiring your approval) so it
   exercises the new preview-deploy pipeline end to end.
