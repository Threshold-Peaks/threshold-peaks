import {defineField, defineType} from 'sanity'

const targetTypeLabels: Record<string, string> = {
  journal: 'Journal',
  gallery: 'Galerie',
  event: 'Event',
}

function shortenText(text?: string, maxLength = 90) {
  if (!text) return ''

  const normalized = text.replace(/\s+/g, ' ').trim()

  if (normalized.length <= maxLength) return normalized

  return `${normalized.slice(0, maxLength).trim()}…`
}

export const comment = defineType({
  name: 'comment',
  title: 'Kommentare',
  type: 'document',
  groups: [
    {
      name: 'moderation',
      title: 'Moderation',
      default: true,
    },
    {
      name: 'content',
      title: 'Kommentar',
    },
    {
      name: 'target',
      title: 'Zuordnung',
    },
  ],
  initialValue: () => ({
    approved: false,
    createdAt: new Date().toISOString(),
  }),
  fields: [
    defineField({
      name: 'approved',
      title: 'Freigegeben',
      type: 'boolean',
      group: 'moderation',
      initialValue: false,
      description:
        'Nur freigegebene Kommentare werden auf der Website angezeigt.',
    }),
    defineField({
      name: 'createdAt',
      title: 'Erstellt am',
      type: 'datetime',
      group: 'moderation',
      readOnly: true,
      description:
        'Wird automatisch gesetzt, wenn ein Kommentar über die Website eingeht.',
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'body',
      title: 'Kommentar',
      type: 'text',
      group: 'content',
      rows: 5,
      validation: (Rule) => Rule.required().min(2).max(1200),
    }),
    defineField({
      name: 'targetType',
      title: 'Bereich',
      type: 'string',
      group: 'target',
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
      group: 'target',
      readOnly: true,
      description: 'Titel des Beitrags, Albums oder Events.',
    }),
    defineField({
      name: 'targetSlug',
      title: 'Zugehöriger Slug',
      type: 'string',
      group: 'target',
      readOnly: true,
      validation: (Rule) => Rule.required(),
      description: 'Technische Zuordnung zur Website-Seite.',
    }),
  ],
  orderings: [
    {
      title: 'Wartende zuerst',
      name: 'pendingFirst',
      by: [
        {field: 'approved', direction: 'asc'},
        {field: 'createdAt', direction: 'desc'},
      ],
    },
    {
      title: 'Neueste zuerst',
      name: 'createdAtDesc',
      by: [{field: 'createdAt', direction: 'desc'}],
    },
    {
      title: 'Freigegebene zuerst',
      name: 'approvedFirst',
      by: [
        {field: 'approved', direction: 'desc'},
        {field: 'createdAt', direction: 'desc'},
      ],
    },
  ],
  preview: {
    select: {
      name: 'name',
      targetTitle: 'targetTitle',
      targetType: 'targetType',
      body: 'body',
      approved: 'approved',
      createdAt: 'createdAt',
    },
    prepare({name, targetTitle, targetType, body, approved, createdAt}) {
      const status = approved ? '✓ Freigegeben' : '⏳ Wartet auf Freigabe'
      const targetLabel = targetTypeLabels[targetType] || 'Bereich'
      const date = createdAt
        ? new Intl.DateTimeFormat('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date(createdAt))
        : 'ohne Datum'

      return {
        title: `${status} · ${name || 'Ohne Name'}`,
        subtitle: `${targetLabel}${targetTitle ? ` · ${targetTitle}` : ''} · ${date} · ${shortenText(body)}`,
      }
    },
  },
})
