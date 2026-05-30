import {defineArrayMember, defineField, defineType} from 'sanity'

const categoryOptions = [
  {title: 'Running', value: 'running'},
  {title: 'Cycling', value: 'cycling'},
  {title: 'Music', value: 'music'},
  {title: 'Story', value: 'story'},
  {title: 'Gear', value: 'gear'},
  {title: 'Event Recap', value: 'event'},
]

const imageFormatOptions = [
  {title: 'Automatisch', value: 'auto'},
  {title: 'Hochkant 4:5', value: 'portrait'},
  {title: 'Extra hoch 2:3', value: 'tall'},
  {title: 'Quadrat', value: 'square'},
  {title: 'Querformat 5:4', value: 'landscape'},
  {title: 'Breit 4:3', value: 'wide'},
]

const categoryTitles: Record<string, string> = {
  running: 'Running',
  cycling: 'Cycling',
  music: 'Music',
  story: 'Story',
  lifestyle: 'Lifestyle',
  gear: 'Gear',
  event: 'Event Recap',
}

export const journalPost = defineType({
  name: 'journalPost',
  title: 'Journal-Beitrag',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: (Rule) => Rule.required().min(3).max(120),
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
      name: 'publishedAt',
      title: 'Datum',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'category',
      title: 'Kategorie',
      type: 'string',
      options: {
        list: categoryOptions,
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'excerpt',
      title: 'Kurzbeschreibung / Teaser',
      type: 'text',
      rows: 3,
      description: 'Kurzer Einstieg für Übersichten und Vorschauen. Ein bis zwei Sätze reichen völlig.',
      validation: (Rule) => Rule.max(220).warning('Der Teaser wirkt ab etwa 220 Zeichen schnell zu lang.'),
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
          description: 'Sachliche Bildbeschreibung für Barrierefreiheit und SEO.',
          validation: (Rule) => Rule.max(160),
        }),
        defineField({
          name: 'caption',
          title: 'Kurzer Satz zum Bild',
          type: 'text',
          rows: 2,
          description: 'Optionaler persönlicher Satz zum Titelbild.',
          validation: (Rule) => Rule.max(180).warning('Kurze Bildsätze wirken meistens stärker.'),
        }),
        defineField({
          name: 'imageFormat',
          title: 'Bildformat',
          type: 'string',
          description: 'Steuert, wie das Hauptbild auf der Website zugeschnitten wird.',
          options: {
            list: imageFormatOptions,
            layout: 'radio',
          },
          initialValue: 'auto',
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
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'Überschrift', value: 'h2'},
            {title: 'Zwischenüberschrift', value: 'h3'},
            {title: 'Zitat', value: 'blockquote'},
          ],
          lists: [
            {title: 'Aufzählung', value: 'bullet'},
            {title: 'Nummeriert', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Fett', value: 'strong'},
              {title: 'Kursiv', value: 'em'},
            ],
            annotations: [
              defineArrayMember({
                name: 'link',
                title: 'Link',
                type: 'object',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    validation: (Rule) => Rule.uri({scheme: ['http', 'https', 'mailto', 'tel']}),
                  }),
                ],
              }),
            ],
          },
        }),
      ],
    }),

    defineField({
      name: 'linkedGalleryAlbums',
      title: 'Verknüpfte Galerie-Alben',
      type: 'array',
      description:
        'Wähle Galerie-Alben aus, die zu diesem Journal-Beitrag gehören. So bleiben Bilder zentral in der Galerie gepflegt.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'galleryAlbum'}],
        }),
      ],
    }),

    defineField({
      name: 'stravaUrl',
      title: 'Strava-Link',
      type: 'url',
      description: 'Optionaler normaler Link zu einer Strava-Aktivität. Die Website baut daraus automatisch die Einbettung/Karte.',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}).warning(),
    }),

    defineField({
      name: 'stravaActivityUrl',
      title: 'Strava-Aktivitätslink für automatische Karte',
      type: 'url',
      description:
        'Optional. Wenn gesetzt, nutzt der Webhook diesen Link für die automatische Route-Map. Sonst wird der normale Strava-Link verwendet.',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}).warning(),
    }),

    defineField({
      name: 'stravaActivityId',
      title: 'Strava Activity ID',
      type: 'string',
      description:
        'Optional. Wird automatisch aus dem Link gesetzt; kann auch direkt gepflegt werden.',
      validation: (Rule) => Rule.regex(/^\d+$/).warning('Bitte nur die numerische Strava Activity ID eintragen.'),
    }),

    defineField({
      name: 'routeMapImage',
      title: 'Automatisch erzeugte Route-Map',
      type: 'image',
      description:
        'Wird vom Strava-Route-Map-Webhook erzeugt und als Sanity Asset gespeichert.',
      readOnly: true,
      options: {
        hotspot: false,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternativtext',
          type: 'string',
          readOnly: true,
          validation: (Rule) => Rule.max(160),
        }),
      ],
    }),

    defineField({
      name: 'routeMapStatus',
      title: 'Route-Map-Status',
      type: 'string',
      readOnly: true,
      options: {
        list: [
          {title: 'Wird erzeugt', value: 'generating'},
          {title: 'Fertig', value: 'ready'},
          {title: 'Fehlgeschlagen', value: 'failed'},
        ],
        layout: 'radio',
      },
    }),

    defineField({
      name: 'routeMapGeneratedAt',
      title: 'Route-Map erzeugt am',
      type: 'datetime',
      readOnly: true,
    }),

    defineField({
      name: 'routeMapError',
      title: 'Route-Map Fehler',
      type: 'text',
      rows: 3,
      readOnly: true,
      description: 'Nur sichtbar, wenn die automatische Kartenerzeugung fehlgeschlagen ist.',
      hidden: ({document}) => document?.routeMapStatus !== 'failed',
    }),

    defineField({
      name: 'stravaActivity',
      title: 'Manuelle Strava-Daten',
      type: 'object',
      description:
        'Optionaler Bereich für manuelle Strava-Daten. Normalerweise reicht der Strava-Link oben. Nur öffnen, wenn du Werte oder ein eigenes Kartenbild überschreiben möchtest.',
      options: {
        collapsible: true,
        collapsed: true,
      },
      fields: [
        defineField({
          name: 'title',
          title: 'Aktivitätstitel',
          type: 'string',
          description: 'Zum Beispiel: Fahrt am Nachmittag, Long Run, Bahntraining.',
          validation: (Rule) => Rule.max(100),
        }),
        defineField({
          name: 'sportType',
          title: 'Sportart',
          type: 'string',
          options: {
            list: [
              {title: 'Running', value: 'running'},
              {title: 'Cycling', value: 'cycling'},
              {title: 'Gravel', value: 'gravel'},
              {title: 'Workout', value: 'workout'},
              {title: 'Other', value: 'other'},
            ],
            layout: 'radio',
          },
        }),
        defineField({
          name: 'dateLabel',
          title: 'Datumsanzeige',
          type: 'string',
          description: 'Zum Beispiel: Gestern, Heute oder 15. Mai 2026.',
          validation: (Rule) => Rule.max(40),
        }),
        defineField({
          name: 'distance',
          title: 'Distanz',
          type: 'string',
          description: 'Zum Beispiel: 61,5 km.',
          validation: (Rule) => Rule.max(30),
        }),
        defineField({
          name: 'elevation',
          title: 'Höhenmeter',
          type: 'string',
          description: 'Zum Beispiel: 55 m.',
          validation: (Rule) => Rule.max(30),
        }),
        defineField({
          name: 'duration',
          title: 'Zeit',
          type: 'string',
          description: 'Zum Beispiel: 2 Std. 8 Min.',
          validation: (Rule) => Rule.max(40),
        }),
        defineField({
          name: 'kudos',
          title: 'Kudos',
          type: 'number',
          validation: (Rule) => Rule.min(0),
        }),
        defineField({
          name: 'mapImage',
          title: 'Kartenbild / Route',
          type: 'image',
          description:
            'Optionaler Screenshot der Strava-Karte oder eine selbst gestaltete Route.',
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alternativtext',
              type: 'string',
              validation: (Rule) => Rule.max(160),
            }),
          ],
        }),
      ],
    }),

    defineField({
      name: 'soundcloudUrl',
      title: 'SoundCloud-Link',
      type: 'url',
      description: 'Optionaler Link zu einem SoundCloud-Set oder Track.',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}).warning(),
    }),

    defineField({
      name: 'location',
      title: 'Ort / Strecke',
      type: 'string',
      description: 'Optional, zum Beispiel Verl, Bahntraining, Teuto, Gravelrunde oder Wettkampfort.',
      validation: (Rule) => Rule.max(80),
    }),

    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      description: 'Optional. Kleine Stichworte wie Intervall, Wettkampf, Gravel, Techno oder Recovery.',
      of: [defineArrayMember({type: 'string'})],
      options: {
        layout: 'tags',
      },
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
      category: 'category',
      publishedAt: 'publishedAt',
      location: 'location',
      media: 'mainImage',
    },
    prepare({title, category, publishedAt, location, media}) {
      const formattedDate = publishedAt
        ? new Intl.DateTimeFormat('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }).format(new Date(publishedAt))
        : 'Ohne Datum'

      const categoryTitle = category ? categoryTitles[category] ?? category : 'Ohne Kategorie'
      const subtitleParts = [categoryTitle, formattedDate, location].filter(Boolean)

      return {
        title: title || 'Unbenannter Journal-Beitrag',
        subtitle: subtitleParts.join(' · '),
        media,
      }
    },
  },
})
