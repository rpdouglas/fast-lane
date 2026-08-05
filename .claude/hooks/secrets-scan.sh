#!/usr/bin/env bash
# PreToolUse hook (matcher: Bash). Reads the hook JSON payload from stdin, and — only
# when the Bash command being run is a `git commit` — scans the *added* lines of the
# staged diff for common secret shapes before letting the commit through. Every other
# Bash call (including non-commit git commands) is a fast no-op pass-through.
#
# NOTE: deliberately calls `command grep` everywhere, not bare `grep` — this repo's
# interactive Claude Code shell aliases `grep` to a wrapper that proved non-deterministic
# on multi-way alternation patterns during testing; `command grep` bypasses any such
# shell-level shadowing and always resolves to the real grep binary.
set -euo pipefail

payload="$(cat)"

if ! command -v jq >/dev/null 2>&1; then
  echo "secrets-scan: jq not found — skipping scan this run (fix: install jq)." >&2
  exit 0
fi

bash_command="$(printf '%s' "$payload" | jq -r '.tool_input.command // empty')"

# Only act on an actual `git commit` invocation, anywhere in a chained command.
if ! printf '%s' "$bash_command" | command grep -qE '(^|[;&|]|\bthen\b)[[:space:]]*git[[:space:]]+commit([[:space:]]|$)'; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

# Only *added* lines — a diff that removes a secret shouldn't block the commit that removes it.
staged_additions="$(git diff --cached -U0 --no-color -- . 2>/dev/null \
  | command grep -E '^[+]' | command grep -Ev '^[+]{3} ' || true)"

if [ -z "$staged_additions" ]; then
  exit 0
fi

findings=""

scan() {
  local label="$1" pattern="$2" hits
  hits="$(printf '%s\n' "$staged_additions" | command grep -nEi "$pattern" || true)"
  if [ -n "$hits" ]; then
    findings="${findings}
[$label]
${hits}
"
  fi
}

scan "Firebase/Google API key"           'AIza[0-9A-Za-z_-]{35}'
scan "Private key header"                '^\+?-----BEGIN [A-Z ]*PRIVATE KEY-----'
scan "Service-account JSON shape"        '"type":[[:space:]]*"service_account"'
scan "Generic secret-looking assignment" '(api[_-]?key|secret|token|password|passwd)[[:space:]]*[:=][[:space:]]*"[A-Za-z0-9_/+=-]{16,}"'

if [ -n "$findings" ]; then
  {
    echo "secrets-scan: commit blocked — staged changes look like they contain a secret:"
    echo "$findings"
    echo "If this is a false positive (e.g. a test fixture or a deliberately-fake example"
    echo "key), tell the user and get explicit confirmation before committing anyway —"
    echo "don't silently work around this check."
  } >&2
  exit 2
fi

exit 0
