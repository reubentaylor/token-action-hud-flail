/**
 * Module constants for Token Action HUD FLAIL.
 *
 * Kept in one place so bumping the required TAH Core version or the
 * module ID doesn't require a scavenger hunt.
 */
export const MODULE = {
  ID: "token-action-hud-flail",
  LABEL: "Token Action HUD FLAIL"
};

// TAH Core module version this system module targets. Uses Major.Minor
// so we don't need to re-tag for every patch of TAH Core.
export const REQUIRED_CORE_MODULE_VERSION = "2.0";

// Prefix for i18n keys — everything in the languages file starts here.
export const I18N = "tokenActionHudFlail";

// Attribute keys FLAIL characters use for saves. Order matches how
// the character sheet displays them (STR, DEX, CHA, INT, LUCK).
export const ATTRIBUTES = ["str", "dex", "cha", "int", "luck"];

// Encoded-value action types. RollHandler dispatches on the first
// pipe-delimited token.
export const ACTION_TYPES = {
  ATTACK:            "attack",         // roll a weapon's To Hit
  SAVE:              "save",           // roll an attribute save
  MORALE:            "morale",         // NPC morale check
  SHEET_ACTION:      "sheetAction",    // trigger any sheet-registered action
  OPEN_SHEET:        "openSheet",      // open the actor's sheet
  OPEN_ITEM:         "openItem",       // open a specific item sheet
  CAST_SPELL:        "castSpell",      // cast an arcane spell
  CAST_PRAYER:       "castPrayer",     // cast a divine prayer
  USE_TALENT:        "useTalent",      // use a Cutthroat talent
  USE_GADGET:        "useGadget",      // use a Tinkerer gadget
  USE_JOAT:          "useJoat",        // use a Bard JOAT pick
  SHAPESHIFT_START:  "shapeshiftStart",
  SHAPESHIFT_ROLL:   "shapeshiftRoll",
  SHAPESHIFT_REVERT: "shapeshiftRevert",
  SUMMON_PUPPET:     "summonPuppet",   // Bone Whisperer
  CALL_CONSTRUCT:    "callConstruct",  // Tinkerer
  WITNESS_ME:        "witnessMe"       // Bard trigger
};

// FLAIL class keys used to gate class-specific groups.
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
