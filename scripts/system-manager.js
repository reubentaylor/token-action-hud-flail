import { buildActionHandler } from "./action-handler.js";
import { buildRollHandler }   from "./roll-handler.js";
import { getDefaults }        from "./defaults.js";

/**
 * Factory for the SystemManager class.
 *
 * TAH Core's SystemManager base class isn't loaded until Core's own
 * init has run — so we can't `class extends CoreClass` at module-parse
 * time. Instead, module.js waits for `tokenActionHudCoreApiReady`,
 * pulls the base class off the passed-in coreModule, and calls this
 * factory to build our subclass.
 *
 * getDefaults() is called at registration time (not at module load)
 * so game.i18n is available for localization of group names.
 */
export function buildSystemManager(coreModule) {
  const ActionHandlerClass = buildActionHandler(coreModule);
  const RollHandlerClass   = buildRollHandler(coreModule);

  return class FlailSystemManager extends coreModule.api.SystemManager {
    getActionHandler() {
      return new ActionHandlerClass();
    }

    getAvailableRollHandlers() {
      return { core: "Core FLAIL" };
    }

    getRollHandler(_rollHandlerId) {
      return new RollHandlerClass();
    }

    async registerDefaults() {
      return getDefaults();
    }
  };
}
