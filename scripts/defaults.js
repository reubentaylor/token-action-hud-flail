import { I18N } from "./constants.js";

/**
 * Default HUD layout for FLAIL characters. Groups defined here appear
 * in the user's HUD customisation dialog and are laid out top-to-bottom
 * on the HUD itself.
 *
 * Two "tabs" of top-level groups:
 *   1. Combat — always visible: attacks, saves, morale (NPC only).
 *   2. Class — class-specific sub-groups the ActionHandler populates
 *      based on the actor's current class.
 *   3. Inventory — potions and consumables (Tier 3 hook, currently empty).
 *   4. Utility — open sheet, quick access.
 */

const t = (key) => `${I18N}.groups.${key}`;

export const DEFAULTS = {
  layout: [
    {
      nestId: "combat",
      id: "combat",
      name: t("combat"),
      type: "system",
      groups: [
        { nestId: "combat_attacks", id: "attacks", name: t("attacks"), type: "system" },
        { nestId: "combat_saves",   id: "saves",   name: t("saves"),   type: "system" },
        { nestId: "combat_morale",  id: "morale",  name: t("morale"),  type: "system" }
      ]
    },
    {
      nestId: "class",
      id: "class",
      name: t("class"),
      type: "system",
      groups: [
        { nestId: "class_spells",     id: "spells",     name: t("spells"),     type: "system" },
        { nestId: "class_prayers",    id: "prayers",    name: t("prayers"),    type: "system" },
        { nestId: "class_talents",    id: "talents",    name: t("talents"),    type: "system" },
        { nestId: "class_gadgets",    id: "gadgets",    name: t("gadgets"),    type: "system" },
        { nestId: "class_gifts",      id: "gifts",      name: t("gifts"),      type: "system" },
        { nestId: "class_joat",       id: "joat",       name: t("joat"),       type: "system" },
        { nestId: "class_shapeshift", id: "shapeshift", name: t("shapeshift"), type: "system" },
        { nestId: "class_guild",      id: "guild",      name: t("guild"),      type: "system" },
        { nestId: "class_bonewhisperer", id: "bonewhisperer", name: t("bonewhisperer"), type: "system" }
      ]
    },
    {
      nestId: "utility",
      id: "utility",
      name: t("utility"),
      type: "system",
      groups: [
        { nestId: "utility_sheet", id: "sheet", name: t("sheet"), type: "system" }
      ]
    }
  ],
  groups: [
    { id: "combat",        name: t("combat"),        type: "system" },
    { id: "attacks",       name: t("attacks"),       type: "system" },
    { id: "saves",         name: t("saves"),         type: "system" },
    { id: "morale",        name: t("morale"),        type: "system" },
    { id: "class",         name: t("class"),         type: "system" },
    { id: "spells",        name: t("spells"),        type: "system" },
    { id: "prayers",       name: t("prayers"),       type: "system" },
    { id: "talents",       name: t("talents"),       type: "system" },
    { id: "gadgets",       name: t("gadgets"),       type: "system" },
    { id: "gifts",         name: t("gifts"),         type: "system" },
    { id: "joat",          name: t("joat"),          type: "system" },
    { id: "shapeshift",    name: t("shapeshift"),    type: "system" },
    { id: "guild",         name: t("guild"),         type: "system" },
    { id: "bonewhisperer", name: t("bonewhisperer"), type: "system" },
    { id: "utility",       name: t("utility"),       type: "system" },
    { id: "sheet",         name: t("sheet"),         type: "system" }
  ]
};
