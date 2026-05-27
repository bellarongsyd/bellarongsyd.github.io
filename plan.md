# Bella Media Workflow Plan

## Goal

Create a simple quarterly workflow for moving favorite photos and audio from Mac Photos into Cloudflare R2, then publishing them on Bella's website through metadata files.

## Recommended Workflow

1. Export favorites from Mac Photos by quarter.
2. Put exported files into a clean local import folder.
3. Run one import script to process files, upload to R2, and update metadata.
4. Commit the metadata and site changes.
5. Restart or redeploy the website.

## Local Export Folder

Use a predictable local structure:

```text
Bella Export/
  2026-Q1/
    photos/
    audio/
```

Example files:

```text
2026-02-13-play-with-alistair-01.jpg
2026-02-13-play-with-alistair-02.jpg
2026-02-13-play-with-alistair.m4a
```

## Naming Convention

Use lowercase, hyphenated names:

```text
YYYY-MM-DD-short-description-01.jpg
YYYY-MM-DD-short-description.m4a
```

Avoid spaces in filenames and R2 object paths.

## R2 Bucket Structure

Use one private bucket:

```text
bella-media/
  photos/
    2026/
      2026-q1/
        play-with-alistair/
          originals/
          web/
          thumbs/

  audio/
    2026/
      2026-q1/
        play-with-alistair/
          original/
          web/

  metadata/
    albums.json
    audio.json
    journeys.json
```

## Media Processing

For photos:

```text
originals/  untouched exports from Mac Photos
web/        resized/compressed website images
thumbs/     small gallery thumbnails
```

For audio:

```text
original/   untouched exported file
web/        browser-ready m4a or mp3
```

## Metadata

The website should render photos/audio from metadata instead of hardcoding every file in HTML.

### albums.json

```json
[
  {
    "id": "2026-q1-play-with-alistair",
    "title": "Play with Alistair",
    "date": "2026-02-13",
    "age": "2 years, 11 months",
    "category": "siblings",
    "cover": "/media/photos/2026/2026-q1/play-with-alistair/web/01.jpg",
    "images": [
      {
        "src": "/media/photos/2026/2026-q1/play-with-alistair/web/01.jpg",
        "thumb": "/media/photos/2026/2026-q1/play-with-alistair/thumbs/01.jpg",
        "alt": "Bella playing with Alistair"
      }
    ]
  }
]
```

### audio.json

```json
[
  {
    "id": "2026-02-13-play-with-alistair",
    "title": "Play with Alistair",
    "date": "2026-02-13",
    "age": "2 years, 11 months",
    "category": "siblings",
    "src": "/media/audio/2026/2026-q1/play-with-alistair/web/play-with-alistair.m4a",
    "note": "Playing together with Alistair."
  }
]
```

### journeys.json

```json
[
  {
    "id": "newzealand",
    "date": "2024-05",
    "title": "South Island, New Zealand",
    "body": "Mountain roads, clear lakes, and Bella's southern island adventure.",
    "coordinates": [170.5, -44.0],
    "zoom": 5.5
  }
]
```

## Publishing Flow

Quarterly routine:

```text
1. Export favorites from Mac Photos.
2. Copy the export folder to the VPS import area.
3. Run the import script.
4. Review generated metadata.
5. Commit metadata/site changes.
6. Restart or redeploy the website.
```

Target command:

```bash
./scripts/import-media.sh 2026-Q1 play-with-alistair
```

The script should:

```text
- resize photos
- create thumbnails
- normalize filenames
- upload originals, web images, thumbnails, and audio to R2
- update metadata/albums.json
- update metadata/audio.json
- print a summary of uploaded files and changed metadata
```

## Privacy Model

Do not make the R2 bucket public.

Recommended request path:

```text
Browser
  -> Cloudflare Tunnel
  -> VPS server
  -> private R2 bucket
```

The VPS should check authentication before streaming private files from R2.

## Next Implementation Steps

1. Add local `metadata/` files.
2. Update the website to load gallery and voice entries from JSON.
3. Configure R2 access from the VPS.
4. Write the import script.
5. Move existing audio and images into the new structure.
