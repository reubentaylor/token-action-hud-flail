# Token Action HUD FLAIL

A [Token Action HUD](https://github.com/Larkinabout/fvtt-token-action-hud-core) system module for the [FLAIL! Foundry system](https://github.com/reubentaylor/flail-system).

Surfaces every FLAIL character's combat and class-specific actions on Token Action HUD's floating action bar — one click to attack, save, cast a spell, or trigger a class ability, without opening the character sheet.

## Features

**Universal actions (Tier 1) — every character:**
- **Attacks**: each weapon becomes a button showing name, TH, and DMG. Click to fire the standard attack pipeline (dice pool, damage, chat card, all normal FLAIL mechanics).
- **Saves**: STR / DEX / CHA / INT / LUCK buttons, each showing the current attribute score. Shift-click for advantage, Ctrl-click for disadvantage.
- **Open Sheet**: quick access utility.

**Class-specific actions (Tier 2) — driven by the character's class:**
- **Wizard**: every learned arcane spell as a cast button. Opens FLAIL's dice-count dialog for the cast.
- **Cleric**: every prepared divine prayer.
- **Druid**: primal gifts + shapeshifting controls (Begin Shapeshift → Roll Beast Round + Revert while shifted).
- **Cutthroat**: every learned talent + all guild-token spending actions from the equipped guild.
- **Bard**: every Jack of All Trades pick.
- **Tinkerer**: every prepared gadget.
- **Bone Whisperer**: every learned dark spell + Summon Undead Puppet.
- **Warrior**: covered by universal attacks/saves.

**NPCs (minimal):**
- Attacks + Saves + Morale + Open Sheet.

## Installation

**Requirements:**
- Foundry VTT v13 or later
- [FLAIL! Foundry system](https://github.com/reubentaylor/flail-system) v0.4.0 or later
- [Token Action HUD Core](https://github.com/Larkinabout/fvtt-token-action-hud-core) v2.0 or later

Install this module from Foundry's module browser, or via manifest URL:

```
https://github.com/reubentaylor/token-action-hud-flail/releases/latest/download/module.json
```

Enable all three (FLAIL system + TAH Core + this module) in your world and the HUD will appear in the top-left of the canvas when a token is selected.

## How it works

This module extends TAH Core's `SystemManager`, `ActionHandler`, and `RollHandler` classes with FLAIL-specific implementations. When a token is selected, the ActionHandler scans the controlled actor and builds a class-appropriate action tree. When a HUD button is clicked, the RollHandler dispatches through `game.flail`'s API to the same code paths the character sheet's own buttons use — so the chat cards, dice pools, and side effects (usage marks, guild-token deductions, etc.) are identical to sheet clicks.

Modifier keys pass through: Shift = advantage, Ctrl = disadvantage. Combining them cancels to a neutral roll.

## Credits

**FLAIL!** © André Novoa. This TAH system module by Reuben Taylor.

Built on Larkinabout's [Token Action HUD Core](https://github.com/Larkinabout/fvtt-token-action-hud-core) — the framework this module extends.

## Licence

MIT.
