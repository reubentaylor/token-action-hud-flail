import { buildActionHandler } from "./action-handler.js";
import { buildRollHandler }   from "./roll-handler.js";
import { getDefaults } from "./defaults.js";

/**
 * Factory for the SystemManager class.
 *
 * TAH Core's SystemManager base class isn't loaded until Core's own
 * init has run — so we can't `class extends CoreClass` at module-parse
 * time. Instead, module.js waits for `tokenActionHudCoreApiReady`,
 * pulls the base class off the passed-in coreModule, and calls this
 * factory to build our subclass.
 *
 * Returns a class extending the Core SystemManager that overrides the
 * three methods TAH Core reads from us: `getActionHandler`,
 * `getAvailableRollHandlers` / `getRollHandler`, and `registerDefaults`.
 */
export function buildSystemManager(coreModule) {
  // Build the ActionHandler and RollHandler class definitions once,
  // then instantiate on demand in the factory methods below.
  const ActionHandlerClass = buildActionHandler(coreModule);
  const RollHandlerClass   = buildRollHandler(coreModule);

  return class FlailSystemManager extends coreModule.api.SystemManager {
    /** Factory: return the ActionHandler instance. */
    getActionHandler() {
      return new ActionHandlerClass();
    }

    /**
     * Return the set of available roll handlers keyed by their id.
     * We only ship one — "core" — so the map is a single entry.
     */
    getAvailableRollHandlers() {
      return { core: "Core FLAIL" };
    }

    /** Factory: return the RollHandler instance. */
    getRollHandler(_rollHandlerId) {
      return new RollHandlerClass();
    }

    /** Provide the default HUD layout to Core. */
    async registerDefaults() {
      return getDefaults();
    }
  };
}
