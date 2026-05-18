# FLVW Punkt-ID-Strecken retten

Dieses Script kopiert/vereinigt Strecken aus alten FLVW-Dokumenten mit Punkt-IDs:

`importedFlvwEvent.flvw.21650`

in die neuen öffentlichen Dokumente mit Bindestrich-IDs:

`importedFlvwEvent-flvw-21650`

Es löscht keine Dokumente.

## Dry Run

```bash
node scripts/rescue-flvw-dot-id-distances.mjs --dry-run
```

## Echt ausführen

```bash
node scripts/rescue-flvw-dot-id-distances.mjs
```

Danach in Sanity Vision prüfen, z. B.:

```groq
*[_type == "importedFlvwEvent" && sourceId == "21650"]{
  _id,
  title,
  sourceId,
  distances
}
```

Erst wenn die neuen Bindestrich-ID-Dokumente korrekt sind, die alten Punkt-ID-Dokumente löschen.
