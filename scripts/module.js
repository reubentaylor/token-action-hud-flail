import { MODULE, REQUIRED_CORE_MODULE_VERSION } from "./constants.js";
import { buildSystemManager } from "./system-manager.js";

/**
 * Token Action HUD FLAIL — entry point.
 *
 * TAH Core exposes its API on the `tokenActionHudCoreApiReady` hook,
 * which fires after Core has finished its own registration. We hook
 * into that, then use the coreModule's SystemManager base class to
 * build ours (see system-manager.js for the factory).
 *
 * Setting `module.api = { requiredCoreModuleVersion, SystemManager }`
 * is how Core learns about us. Firing the
 * `tokenActionHudSystemReady` hook tells Core to pick us up now.
 */
Hooks.once("tokenActionHudCoreApiReady", async (coreModule) => {
  const module = game.modules.get(MODULE.ID);
  const SystemManager = buildSystemManager(coreModule);
  module.api = {
    requiredCoreModuleVersion: REQUIRED_CORE_MODULE_VERSION,
    SystemManager
  };
  Hooks.call("tokenActionHudSystemReady", module);
});

/**
 * On the `init` hook, override the "displayCharacterName" and
 * "displayCategories" TAH Core settings to hide empty groups by
 * default. TAH Core doesn't expose a "show empty groups" toggle
 * directly — its behaviour depends on how the ActionHandler flags
 * groups. We flip the world-scope defaults so NPC HUDs don't render
 * empty Class subgroups.
 *
 * Runs at Foundry `init` (before ready) so the setting is in place
 * before TAH Core reads it for its own first render.
 */
Hooks.once("init", () => {
  const CORE_ID = "token-action-hud-core";
  // Whitelist of keys we try to flip. TAH Core's setting names have
  // varied by version — check each and skip any that aren't registered.
  const candidateKeys = [
    "displayEmptyGroups",       // TAH Core 2.0+
    "showEmptyGroups",          // possible alias
    "displayEmptyCategories",   // legacy
  ];
  Hooks.once("ready", () => {
    for (const key of candidateKeys) {
      try {
        const current = game.settings.get(CORE_ID, key);
        if (current === true) {
          game.settings.set(CORE_ID, key, false);
          console.log(`TAH FLAIL: flipped ${CORE_ID}.${key} → false`);
        }
      } catch (_) {
        // Setting doesn't exist under this key in this TAH Core version.
      }
    }
  });
});

/**
 * Belt-and-braces guard: if TAH Core is missing or disabled at ready
 * time, surface a warning so the user knows why nothing's happening.
 */
Hooks.once("ready", () => {
  if (!game.modules.get("token-action-hud-core")?.active) {
    ui.notifications?.warn(
      "Token Action HUD FLAIL: TAH Core is not active. Install and enable " +
      "token-action-hud-core to use this module."
    );
  }
});
