import { ACTION_TYPES, ATTRIBUTES, CLASSES, I18N } from "./constants.js";

/**
 * Factory for the ActionHandler class.
 *
 * Same pattern as SystemManager — Core's base class isn't available
 * at module-parse time, so we build ours inside the factory once Core
 * fires `tokenActionHudCoreApiReady`.
 *
 * Tooltip content is populated per action from FLAIL's item data:
 *   - Weapons show their Special Attack Feature.
 *   - Spells/prayers/talents/gadgets/gifts show their description.
 * Empty tooltip fields render the action's name only (falls back to
 * TAH's default "nameOnly" behaviour). Users need to have TAH Core's
 * `tooltips` setting on "full" for the extra text to appear.
 */
export function buildActionHandler(coreModule) {
  return class FlailActionHandler extends coreModule.api.ActionHandler {
    async buildSystemActions(groupIds) {
      const actor = this.actor;
      if (!actor) return;

      if (actor.type === "character") {
        await this.#buildCharacterActions(actor, groupIds);
      } else if (actor.type === "npc") {
        await this.#buildNpcActions(actor, groupIds);
      } else if (actor.type === "construct") {
        await this.#buildConstructActions(actor, groupIds);
      }
    }

    /**
     * Wrap tooltip content in a TAH tooltip descriptor. Returns null
     * (not undefined) if there's no useful content, so we can safely
     * conditionally set it on the action object.
     */
    #makeTooltip(name, htmlContent) {
      if (!htmlContent || htmlContent.trim() === "") return null;
      return {
        content: `<div class="tah-flail-tooltip"><h4>${name}</h4>${htmlContent}</div>`,
        class: "tah-flail-tooltip-wrapper"
      };
    }

    // -----------------------------------------------------------------
    //  Character (PCs)
    // -----------------------------------------------------------------

    async #buildCharacterActions(actor, groupIds) {
      this.#buildAttacks(actor);
      this.#buildSaves(actor);
      this.#buildOpenSheet(actor);

      const classKey = actor.system?.class;
      if (!classKey) return;

      switch (classKey) {
        case CLASSES.WIZARD:         this.#buildWizardActions(actor); break;
        case CLASSES.CLERIC:         this.#buildClericActions(actor); break;
        case CLASSES.DRUID:          this.#buildDruidActions(actor); break;
        case CLASSES.CUTTHROAT:      this.#buildCutthroatActions(actor); break;
        case CLASSES.BARD:           this.#buildBardActions(actor); break;
        case CLASSES.TINKERER:       this.#buildTinkererActions(actor); break;
        case CLASSES.BONE_WHISPERER: this.#buildBoneWhispererActions(actor); break;
        case CLASSES.WARRIOR:        this.#buildWarriorActions(actor); break;
      }
    }

    #buildAttacks(actor) {
      const weapons = actor.items.filter(i => i.type === "weapon");
      if (weapons.length === 0) return;

      const actions = weapons.map(w => {
        const action = {
          id: `weapon_${w.id}`,
          name: w.name,
          encodedValue: [ACTION_TYPES.ATTACK, w.id].join("|"),
          img: w.img,
          info1: { text: `TH ${w.system?.th ?? "?"} / DMG ${w.system?.damage ?? "?"}` }
        };
        // Weapon tooltip = the Special Attack Feature text (from the
        // weapon sheet). Blank weapons fall through to the default
        // name-only tooltip.
        const tooltip = this.#makeTooltip(w.name, w.system?.specialFeature);
        if (tooltip) action.tooltip = tooltip;
        return action;
      });

      this.addActions(actions, { id: "attacks", type: "system" });
    }

    #buildSaves(actor) {
      const attrs = actor.system?.attributes ?? {};
      const actions = ATTRIBUTES.map(a => {
        const score = attrs[a]?.current ?? attrs[a]?.base ?? "?";
        return {
          id: `save_${a}`,
          name: game.i18n.localize(`${I18N}.attributes.${a}`),
          encodedValue: [ACTION_TYPES.SAVE, a].join("|"),
          info1: { text: `${score}` }
        };
      });
      this.addActions(actions, { id: "saves", type: "system" });
    }

    #buildOpenSheet(actor) {
      const actions = [{
        id: "openSheet",
        name: game.i18n.localize(`${I18N}.actions.openSheet`),
        encodedValue: [ACTION_TYPES.OPEN_SHEET].join("|")
      }];
      this.addActions(actions, { id: "sheet", type: "system" });
    }

    /**
     * Generic item-list builder — factors out the repeated pattern of
     * "map each item of type X to an action, attach description as
     * tooltip, add to a subgroup." All class-item groups (spells,
     * prayers, talents, gadgets, gifts) share this shape.
     */
    #addItemActionGroup(items, actionType, subgroupId) {
      if (items.length === 0) return;
      const actions = items.map(i => {
        const action = {
          id: `${actionType}_${i.id}`,
          name: i.name,
          encodedValue: [actionType, i.id].join("|"),
          img: i.img
        };
        const tooltip = this.#makeTooltip(i.name, i.system?.description);
        if (tooltip) action.tooltip = tooltip;
        return action;
      });
      this.addActions(actions, { id: subgroupId, type: "system" });
    }

    #buildWizardActions(actor) {
      const spells = actor.items.filter(i => i.type === "spell");
      this.#addItemActionGroup(spells, ACTION_TYPES.CAST_SPELL, "spells");
    }

    #buildClericActions(actor) {
      const prayers = actor.items.filter(i => i.type === "prayer");
      this.#addItemActionGroup(prayers, ACTION_TYPES.CAST_PRAYER, "prayers");
    }

    #buildDruidActions(actor) {
      const gifts = actor.items.filter(i => i.type === "gift");
      if (gifts.length > 0) {
        const giftActions = gifts.map(g => {
          const action = {
            id: `gift_${g.id}`,
            name: g.name,
            encodedValue: [ACTION_TYPES.SHEET_ACTION, "useGift", g.id].join("|"),
            img: g.img
          };
          const tooltip = this.#makeTooltip(g.name, g.system?.description);
          if (tooltip) action.tooltip = tooltip;
          return action;
        });
        this.addActions(giftActions, { id: "gifts", type: "system" });
      }

      // Shapeshifting — static labels, no per-item tooltips.
      const shifted = actor.system?.shapeshift?.active === true;
      const shapeshiftActions = shifted
        ? [
            {
              id: "shapeshiftRoll",
              name: game.i18n.localize(`${I18N}.actions.shapeshiftRoll`),
              encodedValue: [ACTION_TYPES.SHAPESHIFT_ROLL].join("|")
            },
            {
              id: "shapeshiftRevert",
              name: game.i18n.localize(`${I18N}.actions.shapeshiftRevert`),
              encodedValue: [ACTION_TYPES.SHAPESHIFT_REVERT].join("|")
            }
          ]
        : [
            {
              id: "shapeshiftStart",
              name: game.i18n.localize(`${I18N}.actions.shapeshiftStart`),
              encodedValue: [ACTION_TYPES.SHAPESHIFT_START].join("|")
            }
          ];
      this.addActions(shapeshiftActions, { id: "shapeshift", type: "system" });
    }

    #buildCutthroatActions(actor) {
      const talents = actor.items.filter(i => i.type === "talent");
      this.#addItemActionGroup(talents, ACTION_TYPES.USE_TALENT, "talents");

      // Guild special actions from the equipped guild item.
      const guild = actor.items.find(i => i.type === "guild");
      if (guild) {
        const items = guild.system?.actionItems ?? [];
        const legacy = guild.system?.specialActions ?? [];
        const guildActions = items.length > 0
          ? items.map((snap, idx) => {
              const action = {
                id: `guild_item_${idx}`,
                name: snap.name ?? `Action ${idx + 1}`,
                encodedValue: [ACTION_TYPES.SHEET_ACTION, "spendGuildAction", `item_${idx}`].join("|"),
                img: snap.img
              };
              const tooltip = this.#makeTooltip(snap.name, snap.system?.description);
              if (tooltip) action.tooltip = tooltip;
              return action;
            })
          : legacy.map(a => {
              const action = {
                id: `guild_${a.key}`,
                name: a.name,
                encodedValue: [ACTION_TYPES.SHEET_ACTION, "spendGuildAction", a.key].join("|")
              };
              const tooltip = this.#makeTooltip(a.name, a.description);
              if (tooltip) action.tooltip = tooltip;
              return action;
            });
        if (guildActions.length > 0) {
          this.addActions(guildActions, { id: "guild", type: "system" });
        }
      }
    }

    #buildBardActions(actor) {
      // Every talent/gadget/spell on a Bard's sheet is a JOAT pick.
      const joatItems = actor.items.filter(i =>
        i.type === "talent" || i.type === "gadget" || i.type === "spell"
      );
      this.#addItemActionGroup(joatItems, ACTION_TYPES.USE_JOAT, "joat");
    }

    #buildTinkererActions(actor) {
      const gadgets = actor.items.filter(i => i.type === "gadget");
      this.#addItemActionGroup(gadgets, ACTION_TYPES.USE_GADGET, "gadgets");
    }

    #buildBoneWhispererActions(actor) {
      const spells = actor.items.filter(i => i.type === "spell");
      this.#addItemActionGroup(spells, ACTION_TYPES.CAST_SPELL, "spells");

      // Summon Undead Puppet — static button, no per-item tooltip.
      const summonActions = [{
        id: "summonPuppet",
        name: game.i18n.localize(`${I18N}.actions.summonPuppet`),
        encodedValue: [ACTION_TYPES.SUMMON_PUPPET].join("|")
      }];
      this.addActions(summonActions, { id: "bonewhisperer", type: "system" });
    }

    #buildWarriorActions(_actor) {
      // Universal attacks/saves cover the Warrior; placeholder for
      // any future class-specific features.
    }

    // -----------------------------------------------------------------
    //  NPC (minimal)
    // -----------------------------------------------------------------

    async #buildNpcActions(actor, _groupIds) {
      this.#buildAttacks(actor);

      const saveActions = [{
        id: "save",
        name: game.i18n.localize(`${I18N}.actions.save`),
        encodedValue: [ACTION_TYPES.SHEET_ACTION, "rollSave"].join("|"),
        info1: { text: `${actor.system?.saves ?? "?"}` }
      }];
      this.addActions(saveActions, { id: "saves", type: "system" });

      const moraleActions = [{
        id: "morale",
        name: game.i18n.localize(`${I18N}.actions.morale`),
        encodedValue: [ACTION_TYPES.SHEET_ACTION, "rollMorale"].join("|"),
        info1: { text: `${actor.system?.morale ?? "?"}` }
      }];
      this.addActions(moraleActions, { id: "morale", type: "system" });

      this.#buildOpenSheet(actor);
    }

    // -----------------------------------------------------------------
    //  Construct (Tinkerer companion)
    // -----------------------------------------------------------------

    async #buildConstructActions(actor, _groupIds) {
      this.#buildOpenSheet(actor);
    }
  };
}