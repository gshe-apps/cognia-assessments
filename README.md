# Cognia Assessment Hub, Wireframes

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
- Interim: SA 1 Home, SA 2 Overview, SA 3 Analytics, SA 4 Follow-up, SA 6 Assessments
- Formative: SA 5 Formative (usage by school, school year picker, sort, share report)
- Coming soon: Screeners, Alt Assessments

**School Administrator, institution-level review**
- Interim: School 1 Home, School 2 Overview (school trend and students), School 3 Analytics, School 4 Follow-up, School 6 Assessments
- Formative: School 5 Formative (classroom usage by teacher, teacher clusters)
- Coming soon: Screeners, Alt Assessments

**Teacher, classroom assessments**
- Interim: Teacher Interim (coming soon)
- Formative: create an assessment; assign, classes and question library; results, scoring and feedback

**Student, take an assessment**
- Formative: access and complete an assessment

## Prototype controls

- **Switch role**: every account menu has a Switch button that opens a modal for System Administrator, School Administrator, Teacher and Student. Prototype only.
- **Plan**: every account menu has a Basic / Classroom Plus switch. On Basic, Classroom Plus features are locked, and the teacher Interim hub shows as a paid add-on.
- The Analytics tab is hidden in the Interim navigation; the Analytics screens stay on the canvas and are reachable from links on the Overview screens.
