import {defineArrayMember, defineField, defineType} from 'sanity'

export const journalPost = defineType({
  name: 'journalPost',
  title: 'Journal-Beitrag',
  type: 'document',
  fields: [
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
  validation: (Rule) => Rule.required(),
}),

    defineField({
      name: 'publishedAt',
      title: 'Datum',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),

        defineField({
      name: 'excerpt',
      title: 'Kurzbeschreibung',
      type: 'text',
      rows: 3,
      description: 'Kurzer Teaser für Übersichten und Vorschauen.',
    }),

    defineField({
      name: 'mainImage',
      title: 'Hauptbild',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternativtext',
          type: 'string',
          description: 'Kurze Beschreibung des Bildes für SEO und Barrierefreiheit.',
        }),
      ],
    }),

    defineField({
      name: 'body',
      title: 'Beitragstext',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
        }),
      ],
    }),

    defineField({
      name: 'stravaUrl',
      title: 'Strava-Link',
      type: 'url',
    }),

    defineField({
      name: 'soundcloudUrl',
      title: 'SoundCloud-Link',
      type: 'url',
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
      subtitle: 'category',
      media: 'mainImage',
    },
  },
})