# MIGRATION REQUIREMENT: Expo SDK 54

> [!IMPORTANT]
> **MIGRATION TO EXPO SDK 54 IS MANDATORY.**
> This is a strict requirement, not an option.

## Strategic Direction
The goal of this migration is to align the `ai-agent-frontend` with the latest React Native ecosystem standards and prepare for the future.

### Core Principles
1.  **Forward-Looking Resolution**: Any issues encountered during migration must be solved with a focus on **Expo SDK 55** and the **New Architecture**.
2.  **No Legacy Fallbacks**: Do **NOT** revert to legacy architecture or deprecated methods to solve immediate problems. We must fix forward.
3.  **Strict Compliance**: All dependencies and configurations must be compatible with SDK 54 standards.

## Why SDK 54?
-   **Edge-to-Edge Default**: Native Android experience.
-   **Performance**: Precompiled React Native and Hermes engine improvements.
-   **Bridge to New Architecture**: SDK 54 is the final bridge before the New Architecture becomes mandatory. We must be stable here to ensure a smooth transition to SDK 55.

## Action Items
-   [ ] Upgrade `expo` package to `~52.0.0` -> `~54.0.0` (or latest stable).
-   [ ] Resolve all deprecation warnings.
-   [ ] Verify Android and PWA builds.
