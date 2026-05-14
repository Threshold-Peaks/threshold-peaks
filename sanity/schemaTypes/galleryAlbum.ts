import {defineArrayMember, defineField, defineType} from 'sanity'

export const galleryAlbum = defineType({
  name: 'galleryAlbum',
  title: 'Galerie-Album',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Albumtitel',
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
    }),

    defineField({
      name: 'description',
      title: 'Kurzbeschreibung',
      type: 'text',
      rows: 3,
      description: 'Kurzer Text zum Album.',
    }),

    defineField({
      name: 'coverImage',
      title: 'Titelbild',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternativtext',
          type: 'string',
          description: 'Kurze Bildbeschreibung für SEO und Barrierefreiheit.',
        }),
      ],
    }),

    defineField({
      name: 'images',
      title: 'Bilder',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          title: 'Bild',
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: 'caption',
              title: 'Kurzer Satz zum Foto',
              type: 'text',
              rows: 2,
              description: 'Ein kurzer, persönlicher Satz zum Bild. Zum Beispiel: „Morgendliche Runde durch Verl.“',
            }),
            defineField({
              name: 'alt',
              title: 'Alternativtext',
              type: 'string',
              description: 'Kurze sachliche Bildbeschreibung für SEO und Barrierefreiheit.',
            }),
          ],
          preview: {
            select: {
              title: 'caption',
              subtitle: 'alt',
              media: 'asset',
            },
            prepare({title, subtitle, media}) {
              return {
                title: title || 'Galeriebild',
                subtitle: subtitle || 'Noch kein Alternativtext hinterlegt',
                media,
              }
            },
          },
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
      category: 'category',
      date: 'date',
      location: 'location',
      media: 'coverImage',
    },
    prepare({title, category, date, location, media}) {
      const details = [category, date, location].filter(Boolean).join(' · ')

      return {
        title,
        subtitle: details || 'Galerie-Album',
        media,
      }
    },
  },
})
