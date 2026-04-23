#!/bin/bash
# check_git_workflow.sh
#
# Analyzes git workflow compliance for the CS3550 Project 6 grading rubric.
# Checks for Project 6 phase branch patterns, merged PRs, commit count,
# and conventional commit format usage.
#
# Always exits 0 — results are informational for manual grading (15 pts).
# Outputs variables to GITHUB_OUTPUT for use in the workflow summary.
#
# ── Configuration (customize per assignment) ─────────────────────────────────
#
# REQUIRED_BRANCH_PATTERNS: space-separated list of keyword patterns.
#   A branch satisfies a pattern if its name contains the keyword (case-insensitive).
#   Examples:
#     "phase1 phase2 phase3"           → needs one branch for each project phase
#     "phase1-indexing phase2-schema"  → can be overridden with more specific names
#
REQUIRED_BRANCH_PATTERNS="${REQUIRED_BRANCH_PATTERNS:-phase1 phase2 phase3}"
#
# ─────────────────────────────────────────────────────────────────────────────

set -uo pipefail

REPO="${GITHUB_REPOSITORY:-}"

# ─── Helper: collect all known branch names ───────────────────────────────────
# Returns a newline-separated list of branch names from:
#   1. Active remote refs
#   2. Merged PR head branches (GitHub API)
#   3. Merge commit subjects in git log (fallback)
collect_all_branches() {
    # 1. Active remote branches
    git ls-remote --heads origin 2>/dev/null \
        | awk '{print $2}' | sed 's|refs/heads/||'

    # 2. Merged PR head branches via GitHub API
    if command -v gh &>/dev/null && [ -n "$REPO" ]; then
        gh pr list --repo "$REPO" --state merged \
            --json headRefName --jq '.[].headRefName' 2>/dev/null || true
    fi

    # 3. Extract branch names from merge commit messages ("Merge branch 'X'" / "Merge pull request … from …/X")
    git log --all --merges --pretty="%s" 2>/dev/null \
        | grep -oE "from [^ ]+/([^ ]+)|branch '([^']+)'" \
        | grep -oE "[^/' ]+$" || true
}

# ─── Helper: check if any known branch matches a keyword pattern ──────────────
# Returns "true"/"false" and the matching branch name (or "none").
branch_matches_pattern() {
    local pattern="$1"
    local all_branches="$2"   # newline-separated list
    local match
    match=$(echo "$all_branches" | grep -i "$pattern" | head -1 || true)
    if [ -n "$match" ]; then
        echo "true|$match"
    else
        echo "false|none"
    fi
}

echo "🔍 Analyzing Git Workflow..."
echo ""

# ─── 1. Collect all branch names once ────────────────────────────────────────
echo "Collecting branch names..."
ALL_BRANCHES=$(collect_all_branches | sort -u)

# ─── 2. Check each required pattern ──────────────────────────────────────────
echo "Checking required branch patterns: $REQUIRED_BRANCH_PATTERNS"

BRANCHES_FOUND=0
BRANCH_SUMMARY=""   # human-readable lines for the console report
BRANCH_TABLE=""     # pipe-separated rows for GITHUB_OUTPUT (pattern|status|matched_name)

for pattern in $REQUIRED_BRANCH_PATTERNS; do
    result=$(branch_matches_pattern "$pattern" "$ALL_BRANCHES")
    found="${result%%|*}"
    matched="${result##*|}"

    if [ "$found" = "true" ]; then
        BRANCHES_FOUND=$((BRANCHES_FOUND + 1))
        BRANCH_SUMMARY="${BRANCH_SUMMARY}✅ Pattern '*${pattern}*': found ('$matched')\n"
        BRANCH_TABLE="${BRANCH_TABLE}${pattern}|✅ Found ('$matched')|"
    else
        BRANCH_SUMMARY="${BRANCH_SUMMARY}❌ Pattern '*${pattern}*': no matching branch found\n"
        BRANCH_TABLE="${BRANCH_TABLE}${pattern}|❌ Not found|"
    fi
done

TOTAL_PATTERNS=$(echo "$REQUIRED_BRANCH_PATTERNS" | wc -w | tr -d ' ')

# ─── 3. Merged PR count (targeting main) ─────────────────────────────────────
echo "Counting merged PRs..."
MERGED_PR_COUNT=0
if command -v gh &>/dev/null && [ -n "$REPO" ]; then
    MERGED_PR_COUNT=$(gh pr list --repo "$REPO" --state merged --base main \
        --json number --jq 'length' 2>/dev/null || echo "0")
fi
MERGED_PR_COUNT="${MERGED_PR_COUNT:-0}"

# ─── 4. Commit count (non-merge commits on main) ─────────────────────────────
echo "Counting commits..."
COMMIT_COUNT=$(git log main --no-merges --oneline 2>/dev/null | wc -l | tr -d ' ')
COMMIT_COUNT="${COMMIT_COUNT:-0}"

# ─── 5. Conventional commit format ───────────────────────────────────────────
echo "Checking commit message format..."
CONVENTIONAL_PATTERN="^(feat|fix|docs|style|refactor|test|chore|perf|ci|build)(\(.+\))?!?:"
CONVENTIONAL_COUNT=$(git log main --no-merges --pretty="%s" 2>/dev/null \
    | grep -cE "$CONVENTIONAL_PATTERN" || echo "0")
CONVENTIONAL_COUNT="${CONVENTIONAL_COUNT:-0}"

# ─── 6. Estimate grading tier (informational only) ───────────────────────────
#
# Excellent (15): all patterns matched, 3+ PRs, 10+ commits
# Good     (12): all patterns matched, 2+ PRs, 7-9 commits
# Fair      (8): all patterns matched, 1+ PRs, 4-6 commits
# Needs Work(3): missing patterns, 0-1 PRs, or <4 commits
#
ESTIMATED_TIER="Needs Work"
TIER_POINTS=3
ALL_FOUND=$([ "$BRANCHES_FOUND" -eq "$TOTAL_PATTERNS" ] && echo "yes" || echo "no")

if   [ "$ALL_FOUND" = "yes" ] && [ "$MERGED_PR_COUNT" -ge 3 ] && [ "$COMMIT_COUNT" -ge 10 ]; then
    ESTIMATED_TIER="Excellent"; TIER_POINTS=15
elif [ "$ALL_FOUND" = "yes" ] && [ "$MERGED_PR_COUNT" -ge 2 ] && [ "$COMMIT_COUNT" -ge 7 ]; then
    ESTIMATED_TIER="Good";      TIER_POINTS=12
elif [ "$ALL_FOUND" = "yes" ] && [ "$MERGED_PR_COUNT" -ge 1 ] && [ "$COMMIT_COUNT" -ge 4 ]; then
    ESTIMATED_TIER="Fair";      TIER_POINTS=8
fi

# ─── Write outputs for workflow ───────────────────────────────────────────────
if [ -n "${GITHUB_OUTPUT:-}" ]; then
    {
        echo "branches_found=$BRANCHES_FOUND"
        echo "total_patterns=$TOTAL_PATTERNS"
        echo "branch_table=$BRANCH_TABLE"
        echo "merged_pr_count=$MERGED_PR_COUNT"
        echo "commit_count=$COMMIT_COUNT"
        echo "conventional_count=$CONVENTIONAL_COUNT"
        echo "estimated_tier=$ESTIMATED_TIER"
        echo "tier_points=$TIER_POINTS"
    } >> "$GITHUB_OUTPUT"
fi

# ─── Console report ───────────────────────────────────────────────────────────
echo ""
echo "=== GIT WORKFLOW REPORT ==="
printf "%b" "$BRANCH_SUMMARY"
echo "   Branches matched:           $BRANCHES_FOUND / $TOTAL_PATTERNS required patterns"
echo "   Merged PRs (→ main):        $MERGED_PR_COUNT"
echo "   Commits (non-merge):        $COMMIT_COUNT"
echo "   Conventional-format commits: $CONVENTIONAL_COUNT / $COMMIT_COUNT"
echo "   Estimated tier:             $ESTIMATED_TIER (~$TIER_POINTS pts)"
echo ""
echo "⚠️  Git workflow (15 pts) requires manual grading."
echo "   This report provides data points only — final score"
echo "   depends on PR descriptions, issue links, and commit clarity."

exit 0