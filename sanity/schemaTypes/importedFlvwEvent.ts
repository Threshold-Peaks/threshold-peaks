import {defineArrayMember, defineField, defineType} from 'sanity'

export const importedFlvwEvent = defineType({
  name: 'importedFlvwEvent',
  title: 'FLVW Laufkalender',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'URL-Name',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'date',
      title: 'Datum',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'time',
      title: 'Uhrzeit',
      type: 'string',
      description: 'Optional, zum Beispiel 10:00 Uhr oder ganztägig.',
    }),

    defineField({
      name: 'location',
      title: 'Ort / Adresse',
      type: 'string',
    }),

    defineField({
      name: 'postalCode',
      title: 'PLZ',
      type: 'string',
    }),

    defineField({
      name: 'city',
      title: 'Stadt',
      type: 'string',
    }),

    defineField({
      name: 'region',
      title: 'Region / Kreis',
      type: 'string',
      description: 'Zum Beispiel FLVW-Kreis oder Kreis-/Regionsangabe aus der Quelle.',
    }),

    defineField({
      name: 'district',
      title: 'FLVW-Kreis',
      type: 'string',
      readOnly: true,
      description: 'Originaler FLVW-Kreis aus dem Import. Wird für interne Filter und Kontrolle mitgeführt.',
    }),

    defineField({
      name: 'organizer',
      title: 'Ausrichter',
      type: 'string',
    }),

    defineField({
      name: 'category',
      title: 'Kategorie',
      type: 'string',
    }),

    defineField({
      name: 'distances',
      title: 'Strecken',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {
        layout: 'tags',
      },
    }),

    defineField({
      name: 'geo',
      title: 'Koordinaten',
      type: 'geopoint',
      description: 'Optional für Umkreisfilter. Kann später manuell gepflegt oder automatisch ergänzt werden.',
    }),

    defineField({
      name: 'needsGeoCheck',
      title: 'Koordinaten prüfen',
      type: 'boolean',
      initialValue: true,
      description: 'Bleibt aktiv, solange keine Koordinaten vorhanden sind.',
    }),

    defineField({
      name: 'externalUrl',
      title: 'Veranstalter-Website',
      type: 'url',
    }),

    defineField({
      name: 'calendarUrl',
      title: 'Kalender-Datei (vCal)',
      type: 'url',
      description: 'Direkter Link zur Kalenderdatei aus dem FLVW Laufkalender.',
      readOnly: true,
    }),

    defineField({
      name: 'sourceName',
      title: 'Quelle',
      type: 'string',
      initialValue: 'FLVW Laufkalender',
      readOnly: true,
    }),

    defineField({
      name: 'sourceUrl',
      title: 'FLVW-Quelle',
      type: 'url',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'sourceId',
      title: 'FLVW-ID',
      type: 'string',
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),

    defineField({
      name: 'dlvNumber',
      title: 'DLV-Veranstaltungsnummer',
      type: 'string',
    }),

    defineField({
      name: 'flvwNumber',
      title: 'FLVW-Veranstaltungsnummer',
      type: 'string',
    }),

    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Ungeprüft', value: 'ungeprueft'},
          {title: 'Geprüft', value: 'geprueft'},
          {title: 'Interessant', value: 'interessant'},
          {title: 'Archiv', value: 'archiv'},
        ],
        layout: 'radio',
      },
      initialValue: 'ungeprueft',
    }),

    defineField({
      name: 'hidden',
      title: 'Auf Website ausblenden',
      type: 'boolean',
      initialValue: false,
    }),

    defineField({
      name: 'featured',
      title: 'Hervorheben',
      type: 'boolean',
      initialValue: false,
    }),

    defineField({
      name: 'notes',
      title: 'Interne Notizen',
      type: 'text',
      rows: 3,
    }),

    defineField({
      name: 'importedAt',
      title: 'Importiert am',
      type: 'datetime',
      readOnly: true,
    }),

    defineField({
      name: 'lastSyncedAt',
      title: 'Zuletzt synchronisiert',
      type: 'datetime',
      readOnly: true,
    }),
  ],

  preview: {
    select: {
      title: 'title',
      date: 'date',
      city: 'city',
      region: 'region',
      hidden: 'hidden',
    },
    prepare({title, date, city, region, hidden}) {
      return {
        title: hidden ? `${title} · ausgeblendet` : title,
        subtitle: [date, city, region].filter(Boolean).join(' · '),
      }
    },
  },
})
