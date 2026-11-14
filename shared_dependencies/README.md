# Shared dependencies

The canonical database connection and authenticated transaction helper are owned by Ved in `../database/`. Mark's and Nathan's API handlers depend on these modules. They were not copied into those members' folders, so there is one source of truth.
