# Your data and demo sessions

Tablelog saves your games automatically. You can keep the example sessions to
explore the app, or start with an empty tracker for your own games.

## Start without demo sessions

Do this **before starting the app for the first time**:

1. In the downloaded project, open `ttrpg_tracker/app/import_source`.
2. Rename `demo_sessions.csv` to `demo_sessions.csv.disabled`.
3. Follow [Getting started](../README.md#getting-started) to launch the app.

Keep the file renamed. Your tracker will start empty, ready for your own systems,
campaigns and sessions.

Already tried the demo? Renaming the file does not remove games that have already
been loaded. See **Start over after trying the demo** below.

## Save a copy of your games

1. Open **Manage** and choose **Export CSV**.
2. Save the downloaded file in a backup folder outside the downloaded project.
3. Include the date in its filename so you can keep several copies.

This file contains your sessions, campaigns and game systems, including notes,
links and settings.

To add saved records to Tablelog, choose **Manage → Import CSV → Preview file**.
Check the preview, then choose **Import new records**. Use a file previously
created with **Export CSV**.

Import keeps existing records and settings. To return everything to an exact
saved version, use the full backup and restore instructions below.

## Where your games are saved

Your records live on the computer running Tablelog. Closing the browser or
restarting the app keeps them saved.

- **Python:** In the file `ttrpg_tracker/app/ttrpg.db`.
- **Docker:** In Docker's own storage, separate from the project files.

The instructions below assume the app's default storage settings.

<details>
<summary>Full backup and restore</summary>

A full backup is a copy of the database file, `ttrpg.db`. Stop the app before
copying or replacing it.

**Before restoring, save the current database under another filename. Restoring
replaces all current records with the saved copy.**

### Python

- **Back up:** Stop the app with `Ctrl+C`. Copy `ttrpg_tracker/app/ttrpg.db` to
  your backup folder, then start the app again.
- **Restore:** Stop the app, replace `ttrpg_tracker/app/ttrpg.db` with your saved
  copy, then start the app again.

### Docker

Run these commands from the project's `ttrpg_tracker` folder.

To back up, save a copy beside the downloaded project folder:

```powershell
docker compose stop ttrpg
docker compose cp ttrpg:/data/ttrpg.db ../../tablelog-backup.db
docker compose start ttrpg
```

To restore that copy:

```powershell
docker compose stop ttrpg
docker compose cp ../../tablelog-backup.db ttrpg:/data/ttrpg.db
docker compose start ttrpg
```

Use different backup filenames when keeping several saved versions.

The app also saves a JSON copy in `ttrpg_tracker/app/backups/` before an import
adds records. These automatic copies do not cover everyday edits or deletions,
and the app has no button for restoring them.

</details>

<details>
<summary>Start over after trying the demo</summary>

**This clears all games, including anything you added yourself.** The app has no
button to clear everything or remove only demo records.

First, make a full backup using the instructions above. Then rename the demo CSV
as described in **Start without demo sessions**.

Choose the method you used to run the app:

- **Python:** Stop the app. Move `ttrpg_tracker/app/ttrpg.db` to your backup folder
  under a new filename. Start the app again to create an empty tracker.
- **Docker:** Run the following from `ttrpg_tracker`. This removes the app's
  stored data and cached dependencies, then starts it again.

  ```powershell
  docker compose down --volumes
  docker compose up -d
  ```

Keep the demo CSV renamed so the examples stay disabled. For Docker, removing
the project folder's `ttrpg.db` file does not clear Docker's stored data.

</details>
