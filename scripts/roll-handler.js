import { ACTION_TYPES } from "./constants.js";

/**
 * Factory for the RollHandler class.
 *
 * Class-action dispatch is now type-aware — the RollHandler looks up
 * the item on the actor and routes to the correct sheet-registered
 * action based on item.type. This is because FLAIL registers separate
 * action handlers per item type (e.g. castWizardSpell vs castDarkSpell,
 * useDamageGadget vs toggleJoatUsed) rather than a single generic
 * "use this item" handler.
 */
export function buildRollHandler(coreModule) {
  return class FlailRollHandler extends coreModule.api.RollHandler {
    async handleActionClick(event, encodedValue) {
      const actor = this.actor;
      if (!actor) return;
      if (!game.flail) {
        ui.notifications?.warn(
          "Token Action HUD FLAIL: game.flail API is not available. Update the FLAIL system to 0.4.0 or newer."
        );
        return;
      }

      const [type, primary, secondary] = encodedValue.split("|");
      const advantage = this.#netAdvantage();

      switch (type) {
        case ACTION_TYPES.ATTACK:
          return this.#handleAttack(actor, primary);

        case ACTION_TYPES.SAVE:
          return game.flail.rollSave(actor, primary, { advantage });

        case ACTION_TYPES.MORALE:
          return game.flail.rollMorale(actor);

        case ACTION_TYPES.OPEN_SHEET:
          return actor.sheet?.render(true);

        case ACTION_TYPES.OPEN_ITEM:
          return actor.items.get(primary)?.sheet?.render(true);

        // Class-specific casts / uses — dispatch by class + item type.
        case ACTION_TYPES.CAST_SPELL:
          return this.#handleCastSpell(actor, primary);

        case ACTION_TYPES.CAST_PRAYER:
          return game.flail.triggerSheetAction(actor, "castPrayer", { itemId: primary });

        case ACTION_TYPES.USE_TALENT:
          return game.flail.triggerSheetAction(actor, "rollTalent", { itemId: primary });

        case ACTION_TYPES.USE_GADGET:
          return this.#handleUseGadget(actor, primary);

        case ACTION_TYPES.USE_JOAT:
          return this.#handleUseJoat(actor, primary);

        // Druid primal gift — sheet's handler name is "activateGift".
        // Currently packed as SHEET_ACTION|useGift|<id> in the
        // ActionHandler; unified here.
        case ACTION_TYPES.SHAPESHIFT_START:
          return game.flail.triggerSheetAction(actor, "shapeshiftStart");

        case ACTION_TYPES.SHAPESHIFT_ROLL:
          return game.flail.triggerSheetAction(actor, "shapeshiftRoll");

        case ACTION_TYPES.SHAPESHIFT_REVERT:
          return game.flail.triggerSheetAction(actor, "shapeshiftRevert");

        case ACTION_TYPES.SUMMON_PUPPET:
          // No sheet action registered for this — open the sheet as
          // the fallback so the GM can trigger it there.
          ui.notifications?.info("Summon puppet: open the character sheet to trigger.");
          return actor.sheet?.render(true);

        case ACTION_TYPES.SHEET_ACTION:
          return this.#handleSheetAction(actor, primary, secondary);

        default:
          console.warn(`Token Action HUD FLAIL: unknown action type "${type}"`);
      }
    }

    async #handleAttack(actor, weaponId) {
      const weapon = actor.items.get(weaponId);
      if (!weapon) {
        ui.notifications?.warn(`Weapon ${weaponId} not found on ${actor.name}.`);
        return;
      }
      return game.flail.triggerSheetAction(
        actor,
        "rollAttack",
        { itemId: weaponId },
        {
          altKey:   this.isAlt   ?? false,
          shiftKey: this.isShift ?? false,
          ctrlKey:  this.isCtrl  ?? false
        }
      );
    }

    /**
     * Spell casting — dispatch by actor class:
     *   Wizard         → castWizardSpell
     *   Bone Whisperer → castDarkSpell
     */
    async #handleCastSpell(actor, spellId) {
      const classKey = actor.system?.class;
      const actionName = classKey === "wizard"        ? "castWizardSpell"
                       : classKey === "boneWhisperer" ? "castDarkSpell"
                       : null;
      if (!actionName) {
        ui.notifications?.warn("No spell action registered for this class.");
        return;
      }
      return game.flail.triggerSheetAction(actor, actionName, { itemId: spellId });
    }

    /**
     * Tinkerer gadget release — only damage-type gadgets have a
     * click-to-fire button. Non-damage gadgets are player/GM
     * adjudicated; open the sheet as fallback.
     */
    async #handleUseGadget(actor, gadgetId) {
      const gadget = actor.items.get(gadgetId);
      if (!gadget) return;
      if (gadget.system?.gadgetType === "damage") {
        return game.flail.triggerSheetAction(actor, "useDamageGadget", { itemId: gadgetId });
      }
      // Non-damage: open the sheet so the player can read the
      // description and adjudicate manually.
      return gadget.sheet?.render(true);
    }

    /**
     * Bard Jack of All Trades — dispatch by item type:
     *   spell   → castJoatSpell
     *   gadget  → useDamageGadget (only fireable if type=damage)
     *   talent  → toggleJoatUsed
     * Any non-fireable JOAT item opens its own sheet as fallback.
     */
    async #handleUseJoat(actor, itemId) {
      const item = actor.items.get(itemId);
      if (!item) return;
      if (item.type === "spell") {
        return game.flail.triggerSheetAction(actor, "castJoatSpell", { itemId });
      }
      if (item.type === "gadget") {
        if (item.system?.gadgetType === "damage") {
          return game.flail.triggerSheetAction(actor, "useDamageGadget", { itemId });
        }
        return item.sheet?.render(true);
      }
      if (item.type === "talent") {
        return game.flail.triggerSheetAction(actor, "toggleJoatUsed", { itemId });
      }
      return item.sheet?.render(true);
    }

    /**
     * Sheet-action bridge for actions that carry a secondary key.
     * Currently used for the Cutthroat's guild-action spend (secondary
     * is the actionKey) and the Druid's primal gift activation
     * (secondary is the gift item id — packed under SHEET_ACTION|useGift).
     */
    async #handleSheetAction(actor, actionName, secondary) {
      const dataAttrs = {};
      // Rewrite legacy "useGift" name to the sheet's actual action name.
      const finalActionName = actionName === "useGift" ? "activateGift" : actionName;
      if (secondary) {
        if (actionName === "spendGuildAction") dataAttrs.actionKey = secondary;
        else if (actionName === "useGift")     dataAttrs.itemId    = secondary;
        else                                    dataAttrs.id       = secondary;
      }
      return game.flail.triggerSheetAction(actor, finalActionName, dataAttrs);
    }

    #netAdvantage() {
      let adv = 0;
      if (this.isShift) adv += 1;
      if (this.isCtrl)  adv -= 1;
      return adv;
    }
  };
}