/**
 * Module constants for Token Action HUD FLAIL.
 */
export const MODULE = {
  ID: "token-action-hud-flail",
  LABEL: "Token Action HUD FLAIL"
};

export const REQUIRED_CORE_MODULE_VERSION = "2.1";
export const I18N = "tokenActionHudFlail";
export const ATTRIBUTES = ["str", "dex", "cha", "int", "luck"];

export const ACTION_TYPES = {
  ATTACK:            "attack",
  SAVE:              "save",
  MORALE:            "morale",
  SHEET_ACTION:      "sheetAction",
  OPEN_SHEET:        "openSheet",
  OPEN_ITEM:         "openItem",
  CAST_SPELL:        "castSpell",
  CAST_PRAYER:       "castPrayer",
  USE_TALENT:        "useTalent",
  USE_GADGET:        "useGadget",
  USE_JOAT:          "useJoat",
  USE_INSTRUMENT:    "useInstrument",
  SHAPESHIFT_START:  "shapeshiftStart",
  SHAPESHIFT_ROLL:   "shapeshiftRoll",
  SHAPESHIFT_REVERT: "shapeshiftRevert",
  SUMMON_PUPPET:     "summonPuppet",
  CALL_CONSTRUCT:    "callConstruct",
  WITNESS_ME:        "witnessMe"
};

export const CLASSES = {
  BARD:           "bard",
  BONE_WHISPERER: "boneWhisperer",
  CLERIC:         "cleric",
  CUTTHROAT:      "cutthroat",
  DRUID:          "druid",
  TINKERER:       "tinkerer",
  WARRIOR:        "warrior",
  WIZARD:         "wizard"
};
