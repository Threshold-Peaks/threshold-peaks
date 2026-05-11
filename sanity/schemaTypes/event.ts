import {defineField, defineType} from 'sanity'

export const event = defineType({
  name: 'event',
  title: 'Termin',
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
      description: 'Optional, zum Beispiel 18:30 Uhr oder ganztägig.',
    }),

    defineField({
      name: 'location',
      title: 'Ort',
      type: 'string',
    }),

    defineField({
      name: 'category',
      title: 'Kategorie',
      type: 'string',
      options: {
        list: [
          {title: 'Running', value: 'running'},
          {title: 'Cycling', value: 'cycling'},
          {title: 'Music', value: 'music'},
          {title: 'Lifestyle', value: 'lifestyle'},
          {title: 'Event', value: 'event'},
        ],
        layout: 'radio',
      },
      initialValue: 'running',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Geplant', value: 'geplant'},
          {title: 'Angemeldet', value: 'angemeldet'},
          {title: 'Offen', value: 'offen'},
          {title: 'Erledigt', value: 'erledigt'},
          {title: 'Rückblick', value: 'rueckblick'},
          {title: 'Folgt', value: 'folgt'},
        ],
        layout: 'radio',
      },
      initialValue: 'geplant',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'description',
      title: 'Kurzbeschreibung',
      type: 'text',
      rows: 4,
    }),

    defineField({
      name: 'externalUrl',
      title: 'Externer Link',
      type: 'url',
      description: 'Optional, zum Beispiel Veranstalterseite, Anmeldung oder SoundCloud-Link.',
    }),

    defineField({
      name: 'image',
      title: 'Bild',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternativtext',
          type: 'string',
        }),
      ],
    }),

    defineField({
      name: 'featured',
      title: 'Auf Startseite hervorheben',
      type: 'boolean',
      initialValue: false,
    }),
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'date',
      media: 'image',
    },
  },
})