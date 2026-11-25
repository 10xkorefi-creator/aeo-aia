# Outreach contacts

Finds who to write to for each Outreach task and saves it in `aeo_rec_tasks.contact` (shown as "Outreach contact" in the task sidebar).

Run inside a working folder outside the repo that holds `urls.json` (task key, priority, title, page address):

1. `python3 enrich.py`: reads each cited page and the site's contact, about, author and submit pages (browser fallback through `pw_get.js`). Writes `enrich1.json`.
2. `python3 pass2.py`: retries sites with no email in a real browser. Writes `pass2.json`.
3. `python3 build_contacts.py`: picks one contact per task (author's own address, then a named person, then the site inbox, then a form). Writes `contacts.json`.
4. `python3 load_contacts.py`: saves `contacts.json` to the database.

Paid lookups (Apollo, treg) are only for tasks still marked "Not found" or "Form only", and need the owner's go-ahead.
