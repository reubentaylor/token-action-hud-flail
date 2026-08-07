import { ACTION_TYPES } from "./constants.js";

/**
 * Factory for the RollHandler class.
 *
 * Same factory pattern as SystemManager and ActionHandler — Core's
 * base class is only available after `tokenActionHudCoreApiReady`.
 *
 * The class we return overrides `handleActionClick`, which Core calls
 * with an event + the encodedValue string we packed in the
 * ActionHandler. We parse the string and dispatch to the appropriate
 * FLAIL API method.
 *
 * Modifier keys (via Core's `this.isShift` / `this.isCtrl`):
 *   - Shift = advantage
 *   - Ctrl  = disadvantage
 *
 * Net advantage is passed as a signed integer to save/attack rolls.
 */
export function buildRollHandler(coreModule) {
  return class FlailRollHandler extends coreModule.api.RollHandler {
    /**
     * TAH Core entry point. `encodedValue` is the string we packed
     * in the ActionHandler. `event` is the underlying DOM click.
     *
     * The base class sets `this.actor`, `this.token`, `this.action`
     * (the raw action object), and modifier-key flags before calling
     * this method.
     */
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

        // Item-use actions: all delegate to the sheet's registered
        // handler via triggerSheetAction. The sheet already knows how
        // to open the dice-count dialog, deduct usage, post the chat
        // card, etc.
        case ACTION_TYPES.CAST_SPELL:
          return game.flail.triggerSheetAction(actor, "castSpell", { spellId: primary });

        case ACTION_TYPES.CAST_PRAYER:
          return game.flail.triggerSheetAction(actor, "castPrayer", { prayerId: primary });

        case ACTION_TYPES.USE_TALENT:
          return game.flail.triggerSheetAction(actor, "useTalent", { talentId: primary });

        case ACTION_TYPES.USE_GADGET:
          return game.flail.triggerSheetAction(actor, "useGadget", { gadgetId: primary });

        case ACTION_TYPES.USE_JOAT:
          return game.flail.triggerSheetAction(actor, "useJoat", { itemId: primary });

        // Shapeshift buttons — no primary id needed, the action name
        // is the full spec.
        case ACTION_TYPES.SHAPESHIFT_START:
          return game.flail.triggerSheetAction(actor, "shapeshiftStart");

        case ACTION_TYPES.SHAPESHIFT_ROLL:
          return game.flail.triggerSheetAction(actor, "shapeshiftRoll");

        case ACTION_TYPES.SHAPESHIFT_REVERT:
          return game.flail.triggerSheetAction(actor, "shapeshiftRevert");

        case ACTION_TYPES.SUMMON_PUPPET:
          return game.flail.triggerSheetAction(actor, "summonPuppet");

        case ACTION_TYPES.CALL_CONSTRUCT:
          return game.flail.triggerSheetAction(actor, "callConstruct");

        case ACTION_TYPES.WITNESS_ME:
          return game.flail.triggerSheetAction(actor, "triggerWitnessMe");

        // Generic bridge — actionName is the primary token, any extra
        // args carried in secondary. Used for guild-action buttons.
        case ACTION_TYPES.SHEET_ACTION:
          return this.#handleSheetAction(actor, primary, secondary);

        default:
          console.warn(`Token Action HUD FLAIL: unknown action type "${type}"`);
      }
    }

    /**
     * Attack path — look up the weapon Item on the actor and hand off
     * to game.flail.rollAttack, which wraps actor.rollAttack. Advantage
     * flows through the options bag.
     */
    async #handleAttack(actor, weaponId) {
      const weapon = actor.items.get(weaponId);
      if (!weapon) {
        ui.notifications?.warn(`Weapon ${weaponId} not found on ${actor.name}.`);
        return;
      }
      // Route through the sheet's own #onRollAttack handler so modifier
      // keys (Alt = modifier dialog, Shift = advantage, Ctrl = disadvantage)
      // produce identical behaviour to clicking the weapon on the sheet.
      // The sheet handler reads event.altKey / shiftKey / ctrlKey; we
      // forward them via the eventOptions bag on triggerSheetAction.
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
     * Sheet-action bridge for actions that carry a secondary key.
     * Currently used for the Cutthroat's guild-action spend, where the
     * secondary is the action key (either `item_<idx>` for new-style
     * or the string key for legacy actions).
     */
    async #handleSheetAction(actor, actionName, secondary) {
      const dataAttrs = {};
      if (secondary) {
        // Convention: guild-action buttons read `actionKey` on the
        // target; gift buttons read `giftId`.
        if (actionName === "spendGuildAction") dataAttrs.actionKey = secondary;
        else if (actionName === "useGift")     dataAttrs.giftId    = secondary;
        else                                    dataAttrs.id        = secondary;
      }
      return game.flail.triggerSheetAction(actor, actionName, dataAttrs);
    }

    /**
     * Compute net advantage from modifier keys.
     *
     * Shift alone → +1 (advantage). Ctrl alone → -1 (disadvantage).
     * Both together cancel to 0 (matches the sheet's roll-button
     * behaviour).
     */
    #netAdvantage() {
      let adv = 0;
      if (this.isShift) adv += 1;
      if (this.isCtrl)  adv -= 1;
      return adv;
    }
  };
}
