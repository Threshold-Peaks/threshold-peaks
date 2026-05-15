import {defineField, defineType} from 'sanity'

export const comment = defineType({
  name: 'comment',
  title: 'Kommentar',
  type: 'document',
  fields: [
    defineField({
      name: 'approved',
      title: 'Freigegeben',
      type: 'boolean',
      initialValue: false,
      description: 'Nur freigegebene Kommentare werden auf der Website angezeigt.',
    }),
    defineField({
      name: 'targetType',
      title: 'Bereich',
      type: 'string',
      options: {
        list: [
          {title: 'Journal', value: 'journal'},
          {title: 'Galerie', value: 'gallery'},
          {title: 'Event', value: 'event'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'targetTitle',
      title: 'Zugehöriger Titel',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'targetSlug',
      title: 'Zugehöriger Slug',
      type: 'string',
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'body',
      title: 'Kommentar',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required().min(2).max(1200),
    }),
    defineField({
      name: 'createdAt',
      title: 'Erstellt am',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: 'Neueste zuerst',
      name: 'createdAtDesc',
      by: [{field: 'createdAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'targetTitle',
      body: 'body',
      approved: 'approved',
    },
    prepare({title, subtitle, body, approved}) {
      return {
        title: `${approved ? '✓' : '…'} ${title || 'Kommentar'}`,
        subtitle: subtitle || body,
      }
    },
  },
})
