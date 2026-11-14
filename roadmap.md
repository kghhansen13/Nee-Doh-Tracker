Squishy Collection Tracker: Roadmap

Each milestone ends with a version you can open in a browser and test.

Milestone 1: Smallest working version.
Open the page, add a squishy, see it in a list, and still see it after a refresh.
 One index.html file with a simple form (name only) and a plain list.
 Adding a squishy puts it in the list.
 Deleting a squishy removes it right away, with no confirmation.
 The list is saved to localStorage and reloads when the page is reopened.
Test it: add three squishies, delete one, refresh the page, and confirm two remain.

Milestone 2: Full item details and the card grid.
The collection looks like a real collection, with all the fields.
 The form has all five fields: name, brand or line, color or variant, date acquired, and squish or texture notes.
 The list becomes a grid of cards showing those fields.
 Separate screens for the collection and the add/edit form, with hash navigation (#/add, #/edit/ID) so the back button works.
 Editing an existing squishy updates it in place.
Test it: add a squishy with every field filled in, edit it, then use the back button to move between screens.

Milestone 3: Search, filters, and sorting.
Finding things stays easy as the collection grows.
 Search box that matches on name.
 Filters for brand and color.
 Sort by name or date acquired.
 A friendly empty state, both for a new collection and for a search with no matches.
Test it: add 8 to 10 varied squishies, then search, filter, and sort and confirm the grid updates each time.

Milestone 4: Playful polish.
The app looks and feels bright, rounded, and squishy.
 Bright color palette, rounded corners, and playful type.
 Press-and-squish animation on cards.
 Color swatch on each card based on its variant.
 Collection count on the main screen.
 Checked on a phone-sized window and with keyboard navigation.
Test it: use the whole app end to end on a desktop window and a narrow phone-sized window.
