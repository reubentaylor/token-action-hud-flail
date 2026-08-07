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
