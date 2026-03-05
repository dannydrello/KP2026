# Pre-Commit Cleanup Checklist

Before committing this code to git, ensure:

## ✅ Credentials Removed

- [x] No hardcoded Paydestal client IDs in source code
- [x] No hardcoded phone numbers in source code  
- [x] No hardcoded email addresses in source code
- [x] No API keys in source code
- [x] `.env` file is gitignored
- [x] `apps/api/.env.example` uses placeholder values only

## ✅ Sensitive Data Protected

- [x] `apps/pocketbase/pb_data/` is gitignored
- [x] `*.db`, `*.db-shm`, `*.db-wal` files are gitignored
- [x] No personal information in commit history
- [x] No debug console logs with sensitive data

## ✅ Documentation Complete

- [x] README.md created with setup instructions
- [x] FIXES.md created documenting all resolved issues
- [x] Environment variable instructions included
- [x] API endpoints documented

## ✅ Code Quality

- [x] All debug console.logs removed (or made conditional)
- [x] No test/placeholder data in production code
- [x] Error handling implemented
- [x] Proper fallbacks for missing config

## Files That Should NEVER Be Committed

```
apps/api/.env
apps/api/.env.local
apps/api/.env.*.local
apps/pocketbase/pb_data/
*.db
*.db-shm
*.db-wal
node_modules/
```

## How to Verify

Run these commands before committing:

```bash
# Check for credentials in code
grep -r "PYD_" apps/ --include="*.js" --include="*.jsx"
grep -r "sk_live\|pk_live" apps/ --include="*.js" --include="*.jsx"
grep -r "+234" apps/ --include="*.js" --include="*.jsx"

# Check git status
git status

# Ensure .env is not staged
git diff --cached --name-only | grep -E "\.env|pb_data"
```

## Result

If all checks pass, the codebase is safe to commit. No personal data or credentials will be exposed.
