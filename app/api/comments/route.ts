import {NextResponse} from 'next/server'
import {createClient} from 'next-sanity'

import {apiVersion, dataset, projectId} from '@/sanity/env'

const readClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const allowedTargetTypes = ['journal', 'gallery', 'event'] as const

function isAllowedTargetType(value: unknown) {
  return (
    typeof value === 'string' &&
    allowedTargetTypes.includes(value as (typeof allowedTargetTypes)[number])
  )
}

function normalizeText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return ''

  return value.trim().slice(0, maxLength)
}

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url)
  const targetType = searchParams.get('targetType')
  const targetSlug = searchParams.get('targetSlug')

  if (!isAllowedTargetType(targetType) || !targetSlug) {
    return NextResponse.json({comments: []}, {status: 200})
  }

  const comments = await readClient.fetch(
    `*[
      _type == "comment" &&
      approved == true &&
      targetType == $targetType &&
      targetSlug == $targetSlug
    ] | order(createdAt asc) {
      _id,
      name,
      body,
      createdAt
    }`,
    {
      targetType,
      targetSlug,
    },
  )

  return NextResponse.json({comments})
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null)

  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({error: 'Ungültige Anfrage.'}, {status: 400})
  }

  const data = payload as Record<string, unknown>
  const company = normalizeText(data.company, 200)

  // Honeypot gegen simple Bots: echte Nutzer sehen dieses Feld nicht.
  if (company) {
    return NextResponse.json({ok: true})
  }

  const targetType = data.targetType
  const targetSlug = normalizeText(data.targetSlug, 140)
  const targetTitle = normalizeText(data.targetTitle, 160)
  const name = normalizeText(data.name, 80)
  const body = normalizeText(data.body, 1200)

  if (!isAllowedTargetType(targetType)) {
    return NextResponse.json({error: 'Ungültiger Kommentarbereich.'}, {status: 400})
  }

  if (!targetSlug || !name || !body) {
    return NextResponse.json(
      {error: 'Bitte Name und Kommentar ausfüllen.'},
      {status: 400},
    )
  }

  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return NextResponse.json(
      {error: 'Kommentar-Speicherung ist noch nicht konfiguriert.'},
      {status: 500},
    )
  }

  await writeClient.create({
    _type: 'comment',
    approved: false,
    targetType,
    targetSlug,
    targetTitle,
    name,
    body,
    createdAt: new Date().toISOString(),
  })

  return NextResponse.json({ok: true})
}
