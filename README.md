# Cognia Assessment Hub, Wireframes

## Design-system authority

Cognia Design 1.2.0 governs visual work. Read `AGENTS.md` (or `CLAUDE.md`) and the full rules in `design-system/cognia/` before styling. Historical visual approvals no longer override the design system; interaction flows remain protected. Legacy CSS is in the `cap-legacy` layer, so normal semantic styles win without `!important` or artificial ID selectors. Run `node scripts/check-design-system.cjs` and `node verify-homepages.cjs` before delivery. The design-system workflow runs these checks after this local change is published.

Interactive wireframes for the Summer 2027 Assessment Hub, exported from the Claude Design canvas. The canvas is the source of truth; this repo is a snapshot of it.

## Structure

- `project/canvas.json`, canvas layout, screen titles and flow labels
- `project/*.dc.html`, one file per screen
- `project/ds/cognia/`, Cognia Design System tokens (the single source for colour, type, spacing and radius)
- `project/cognia-skin.css`, admin screen styles
- `project/hub-header.css`, shared header, My Hubs launcher, account menu and footer
- `project/prototype-roles.css`, prototype-only role switcher and plan switch
- `project/cap-prototype.css` and `project/cap-cognia.css`, teacher and student screen styles

Images (logo and Home cards) are stored as canvas blobs (`/_blob/...`), so they only render inside the canvas.

## Flows

**System Administrator, district oversight**
- Interim: SA 1 Home, SA 2 Overview (Assign), SA 2a All schools, SA 2b Subgroups, SA 6 Library (preview and assign to schools)
- Formative: SA 5 Formative (usage by school, school year picker, sort, share report)
- Coming soon: Screeners, Alt Assessments

**School Administrator, institution-level review**
- Interim: School 1 Home, School 2 Overview (Assign), School 2a All students, School 2b Subgroups, School 3 Analytics, School 6 Library (preview and assign to classes)
- Formative: School 5 Formative (usage by grade, school stats, teachers with no recent activity; teacher clusters on Classroom+ only)
- Coming soon: Screeners, Alt Assessments

**Teacher, classroom assessments**
- Interim: Teacher Interim (coming soon)
- Formative: create an assessment; assign, classes and question library; results, scoring and feedback

**Student, take an assessment**
- Formative: access and complete an assessment

## Prototype controls

- **Switch role**: every account menu has a Switch button that opens a modal for System Administrator, School Administrator, Teacher and Student. Prototype only.
- **Plan**: every account menu has a Basic / Classroom+ switch. On Basic, Classroom+ features are locked, and the teacher Interim hub shows as a paid add-on.
- The Interim navigation has two tabs, Overview and Library. The Overview summary cards open All schools / All students (pre-filtered) and Subgroups.
- **All schools / All students**: the selected row opens a side column with a water-fill completion card, a stack of detail cards (click one to bring it to the front) and a follow-up alert for anything below the 50% benchmark.
- The Follow-up screens (SA 4, School 4) are off the canvas for now but kept here, as other screens still link to them.
- **My Hubs**: product tiles take their hub colour (Cognia accent 200). Screeners and Alt Assessments are disabled for now; their status badges show in the hover description.

## Run the interactive browser prototype

Requires Node.js. No dependency installation is needed.

```sh
node serve.cjs
```

Open http://127.0.0.1:4174/CAP-T01-Overview.dc.html for the teacher flow or http://127.0.0.1:4174/CAP-S01-SignIn.dc.html for the student flow. Progress is stored locally in the browser. The account menu switches Basic / Classroom+; AI drafting uses labelled sample content, not an external AI service.

This branch includes the updated teacher and student screens, multiple tests, delivery sessions, draft and banked assessment navigation, consistent progress bars, and subtle hover effects. Newer administrator screen content from main is preserved.
