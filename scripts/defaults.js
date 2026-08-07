import { I18N } from "./constants.js";

/**
 * Default HUD layout, built at registration time so game.i18n is
 * available for localization. Previous version exported a static
 * DEFAULTS with i18n keys as strings, on the assumption that TAH Core
 * would localize them at render time — but that path doesn't run for
 * every `name` field, so we pre-localize here instead.
 */
export function getDefaults() {
  const t = (key) => game.i18n.localize(`${I18N}.groups.${key}`);
  return {
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
}