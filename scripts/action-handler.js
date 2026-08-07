import { ACTION_TYPES, ATTRIBUTES, CLASSES, I18N } from "./constants.js";

/**
 * Factory for the ActionHandler class.
 *
 * Same pattern as SystemManager — Core's base class isn't available
 * at module-parse time, so we build ours inside the factory once Core
 * fires `tokenActionHudCoreApiReady`.
 *
 * The class we return overrides `buildSystemActions`, which is Core's
 * entry point for building the action tree per invocation. Core sets
 * `this.actor` and `this.token` before calling.
 *
 * Encoded value format: `<actionType>|<primaryId>|<secondaryId?>`
 * where `actionType` is one of ACTION_TYPES, `primaryId` is usually
 * an item/attribute id, and `secondaryId` is optional context (e.g.
 * a guild-action key when actionType is `sheetAction`).
 *
 * Handlers use two paths to reach FLAIL's mechanics:
 *   - Direct calls to `game.flail.rollAttack`, `game.flail.rollSave`,
 *     `game.flail.rollMorale` — the wrapper API exposed by the FLAIL
 *     system.
 *   - `game.flail.triggerSheetAction(actor, actionName, dataAttrs)`
 *     for sheet-registered actions.
 */
export function buildActionHandler(coreModule) {
  return class FlailActionHandler extends coreModule.api.ActionHandler {
    /**
     * TAH Core entry point. Branch on actor.type; only single-actor
     * mode is supported (multi-select falls back to per-actor HUDs).
     */
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

    // -----------------------------------------------------------------
    //  Character (PCs)
    // -----------------------------------------------------------------

    async #buildCharacterActions(actor, groupIds) {
      // Tier 1 — universal
      this.#buildAttacks(actor);
      this.#buildSaves(actor);
      this.#buildOpenSheet(actor);

      // Tier 2 — class-specific
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

    // ---- Tier 1 — Universal ----

    /**
     * Every equipped weapon becomes an attack button. Click fires the
     * standard rollAttack pipeline (which handles TH pool, damage,
     * chat card, etc.). Shift = advantage, Ctrl = disadvantage — the
     * RollHandler reads modifier keys and passes them through.
     */
    #buildAttacks(actor) {
      const weapons = actor.items.filter(i => i.type === "weapon");
      if (weapons.length === 0) return;

      const actions = weapons.map(w => ({
        id: `weapon_${w.id}`,
        name: w.name,
        encodedValue: [ACTION_TYPES.ATTACK, w.id].join("|"),
        img: w.img,
        info1: { text: `TH ${w.system?.th ?? "?"} / DMG ${w.system?.damage ?? "?"}` }
      }));

      this.addActions(actions, { id: "attacks", type: "system" });
    }

    /**
     * Five save buttons (STR/DEX/CHA/INT/LUCK). Each shows the current
     * attribute score as info1 for quick reference.
     */
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

    /** "Open Sheet" utility button — always present. */
    #buildOpenSheet(actor) {
      const actions = [{
        id: "openSheet",
        name: game.i18n.localize(`${I18N}.actions.openSheet`),
        encodedValue: [ACTION_TYPES.OPEN_SHEET].join("|")
      }];
      this.addActions(actions, { id: "sheet", type: "system" });
    }

    // ---- Tier 2 — Wizard ----

    #buildWizardActions(actor) {
      const spells = actor.items.filter(i => i.type === "spell");
      if (spells.length === 0) return;
      const actions = spells.map(s => ({
        id: `spell_${s.id}`,
        name: s.name,
        encodedValue: [ACTION_TYPES.CAST_SPELL, s.id].join("|"),
        img: s.img
      }));
      this.addActions(actions, { id: "spells", type: "system" });
    }

    // ---- Tier 2 — Cleric ----

    #buildClericActions(actor) {
      const prayers = actor.items.filter(i => i.type === "prayer");
      if (prayers.length === 0) return;
      const actions = prayers.map(p => ({
        id: `prayer_${p.id}`,
        name: p.name,
        encodedValue: [ACTION_TYPES.CAST_PRAYER, p.id].join("|"),
        img: p.img
      }));
      this.addActions(actions, { id: "prayers", type: "system" });
    }

    // ---- Tier 2 — Druid ----

    #buildDruidActions(actor) {
      // Primal gifts (attribute-save gifts)
      const gifts = actor.items.filter(i => i.type === "gift");
      if (gifts.length > 0) {
        const giftActions = gifts.map(g => ({
          id: `gift_${g.id}`,
          name: g.name,
          encodedValue: [ACTION_TYPES.SHEET_ACTION, "useGift", g.id].join("|"),
          img: g.img
        }));
        this.addActions(giftActions, { id: "gifts", type: "system" });
      }

      // Shapeshifting — one of three buttons depending on state.
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

    // ---- Tier 2 — Cutthroat ----

    #buildCutthroatActions(actor) {
      // Talents
      const talents = actor.items.filter(i => i.type === "talent");
      if (talents.length > 0) {
        const talentActions = talents.map(t => ({
          id: `talent_${t.id}`,
          name: t.name,
          encodedValue: [ACTION_TYPES.USE_TALENT, t.id].join("|"),
          img: t.img
        }));
        this.addActions(talentActions, { id: "talents", type: "system" });
      }

      // Guild — special actions from the equipped guild item.
      const guild = actor.items.find(i => i.type === "guild");
      if (guild) {
        const items = guild.system?.actionItems ?? [];
        const legacy = guild.system?.specialActions ?? [];
        // Prefer new-style item snapshots, fall back to legacy struct.
        const guildActions = items.length > 0
          ? items.map((snap, idx) => ({
              id: `guild_item_${idx}`,
              name: snap.name ?? `Action ${idx + 1}`,
              encodedValue: [ACTION_TYPES.SHEET_ACTION, "spendGuildAction", `item_${idx}`].join("|"),
              img: snap.img
            }))
          : legacy.map(a => ({
              id: `guild_${a.key}`,
              name: a.name,
              encodedValue: [ACTION_TYPES.SHEET_ACTION, "spendGuildAction", a.key].join("|")
            }));
        if (guildActions.length > 0) {
          this.addActions(guildActions, { id: "guild", type: "system" });
        }
      }
    }

    // ---- Tier 2 — Bard ----

    #buildBardActions(actor) {
      // Every talent, gadget, and spell embedded on a Bard's sheet is
      // a Jack of All Trades pick — that's how they got there. No
      // separate flag disambiguates them from other item types.
      const joatItems = actor.items.filter(i =>
        i.type === "talent" || i.type === "gadget" || i.type === "spell"
      );
      if (joatItems.length > 0) {
        const joatActions = joatItems.map(i => ({
          id: `joat_${i.id}`,
          name: i.name,
          encodedValue: [ACTION_TYPES.USE_JOAT, i.id].join("|"),
          img: i.img
        }));
        this.addActions(joatActions, { id: "joat", type: "system" });
      }
    }

    // ---- Tier 2 — Tinkerer ----

    #buildTinkererActions(actor) {
      const gadgets = actor.items.filter(i => i.type === "gadget");
      if (gadgets.length > 0) {
        const gadgetActions = gadgets.map(g => ({
          id: `gadget_${g.id}`,
          name: g.name,
          encodedValue: [ACTION_TYPES.USE_GADGET, g.id].join("|"),
          img: g.img
        }));
        this.addActions(gadgetActions, { id: "gadgets", type: "system" });
      }
    }

    // ---- Tier 2 — Bone Whisperer ----

    #buildBoneWhispererActions(actor) {
      // Dark spells (Bone Whisperer's spell type).
      const spells = actor.items.filter(i => i.type === "spell");
      if (spells.length > 0) {
        const spellActions = spells.map(s => ({
          id: `spell_${s.id}`,
          name: s.name,
          encodedValue: [ACTION_TYPES.CAST_SPELL, s.id].join("|"),
          img: s.img
        }));
        this.addActions(spellActions, { id: "spells", type: "system" });
      }

      // Summon Undead Puppet — one-shot button.
      const summonActions = [{
        id: "summonPuppet",
        name: game.i18n.localize(`${I18N}.actions.summonPuppet`),
        encodedValue: [ACTION_TYPES.SUMMON_PUPPET].join("|")
      }];
      this.addActions(summonActions, { id: "bonewhisperer", type: "system" });
    }

    // ---- Tier 2 — Warrior ----

    #buildWarriorActions(_actor) {
      // Warriors don't have a spell/prayer list — attacks + saves cover
      // most of it. Placeholder for future features (Berserker rage etc.)
    }

    // -----------------------------------------------------------------
    //  NPC (minimal)
    // -----------------------------------------------------------------

    async #buildNpcActions(actor, _groupIds) {
      this.#buildAttacks(actor);
      this.#buildSaves(actor);

      const moraleActions = [{
        id: "morale",
        name: game.i18n.localize(`${I18N}.actions.morale`),
        encodedValue: [ACTION_TYPES.MORALE].join("|"),
        info1: { text: `${actor.system?.morale ?? "?"}` }
      }];
      this.addActions(moraleActions, { id: "morale", type: "system" });

      this.#buildOpenSheet(actor);
    }

    // -----------------------------------------------------------------
    //  Construct (Tinkerer companion)
    // -----------------------------------------------------------------

    async #buildConstructActions(actor, _groupIds) {
      // v0.1 — constructs get "open sheet" only. Combat actions live
      // on the Tinkerer's own HUD via the "call construct" button.
      this.#buildOpenSheet(actor);
    }
  };
}
