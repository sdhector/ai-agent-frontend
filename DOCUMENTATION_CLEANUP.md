# Documentation Cleanup Plan

**Date**: November 18, 2025

## Current Documentation Status

### ✅ Keep - Active Documentation

1. **BUILD_DOCUMENTATION.md** (NEW)
   - Current build process, obstacles, and solutions
   - **Status**: Active, keep

2. **MIGRATION_REQUIREMENTS.md**
   - SDK 54 migration requirements
   - **Status**: Reference document, keep

3. **README.md**
   - Project overview and setup instructions
   - **Status**: Active, keep (needs update for SanDi rename)

### ⚠️ Review - Potentially Outdated

4. **DEPLOYMENT_ISSUE.md**
   - Specific deployment issue from November 17, 2025
   - **Content**: registerWebModule error, patching expo-modules-core
   - **Status**: Issue resolved (patch removed in SDK 54 migration)
   - **Action**: Archive or consolidate into BUILD_DOCUMENTATION.md
   - **Recommendation**: Move to `docs/archive/` or delete

5. **FIX_SUMMARY.md**
   - Summary of fixes applied
   - **Content**: registerWebModule patch fix
   - **Status**: Patch no longer needed (SDK 54)
   - **Action**: Archive or delete
   - **Recommendation**: Delete (superseded by BUILD_DOCUMENTATION.md)

6. **TROUBLESHOOTING.md**
   - General troubleshooting guide
   - **Status**: May contain outdated information
   - **Action**: Review and update or archive
   - **Recommendation**: Review, update relevant parts, archive rest

7. **TROUBLESHOOTING_PLAN.md**
   - Troubleshooting plan document
   - **Status**: May be outdated
   - **Action**: Review and consolidate
   - **Recommendation**: Consolidate into BUILD_DOCUMENTATION.md or delete

## Recommended Actions

### Immediate Actions

1. **Create `docs/archive/` directory** for historical documents
2. **Move outdated docs** to archive:
   - `DEPLOYMENT_ISSUE.md` → `docs/archive/DEPLOYMENT_ISSUE.md`
   - `FIX_SUMMARY.md` → `docs/archive/FIX_SUMMARY.md` (or delete)
3. **Review and update** `TROUBLESHOOTING.md` with current information
4. **Delete or archive** `TROUBLESHOOTING_PLAN.md`

### Future Actions

5. **Update README.md**:
   - Add reference to BUILD_DOCUMENTATION.md
   - Update app name to "SanDi" (when rename happens)
   - Update build instructions

## Documentation Structure (Proposed)

```
ai-agent-frontend/
├── README.md                    # Main project documentation
├── BUILD_DOCUMENTATION.md       # Build process and obstacles
├── MIGRATION_REQUIREMENTS.md    # SDK 54 requirements
├── docs/
│   ├── archive/                 # Historical/outdated docs
│   │   ├── DEPLOYMENT_ISSUE.md
│   │   └── FIX_SUMMARY.md
│   └── TROUBLESHOOTING.md       # Updated troubleshooting guide
```

## Notes

- Keep historical context but don't clutter main directory
- BUILD_DOCUMENTATION.md is the single source of truth for current build issues
- Archive rather than delete to preserve context

