import {defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'liveSetsIsOnline',
      title: 'Live Sets online',
      type: 'boolean',
      description: 'Steuert den roten/grünen Statuspunkt bei Live Sets auf der Website.',
      initialValue: false,
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
        subtitle: 'Globale Einstellungen für Threshold Peaks',
      }
    },
  },
})
