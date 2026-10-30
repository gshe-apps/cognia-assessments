# CAP design-system authority

Read and follow `AGENTS.md` and the Cognia rules in `design-system/cognia/SKILL.md`. The latest cognia-design plugin takes precedence over historical visual styling. The user authorized removing visual locks; preserve interaction behaviour and approved flows. Do not reinstate visual `!important` rules or artificial ID specificity. Do not push or deploy without explicit user approval.

Admin screens use only the plugin's 24 / 16 / 14px type scale: no `--text-subheading`, no inline font sizes, tokens over raw px (see `AGENTS.md`, Admin type scale). Before finishing any screen change, run the cognia-design plugin check from the repo root (`node <plugin>/skills/cognia-design/checks/check-project.cjs`) and `node scripts/check-design-system.cjs`. The rules live in the plugin; never raise `cognia-design.baseline.json` to make a change pass.
