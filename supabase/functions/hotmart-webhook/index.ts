import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const HOTMART_HOTTOK = Deno.env.get('HOTMART_HOTTOK') ?? ''
const PRODUCT_ID_LOW = Deno.env.get('PRODUCT_ID_LOW')!
const PRODUCT_ID_LIFETIME = Deno.env.get('PRODUCT_ID_LIFETIME')!
const PRODUCT_ID_KIDS_PDF = Deno.env.get('PRODUCT_ID_KIDS_PDF')!
const VOXUY_WEBHOOK_URL = Deno.env.get('VOXUY_WEBHOOK_URL')!
const VOXUY_TOKEN = Deno.env.get('VOXUY_TOKEN')!

// Email via Resend (comentado até o domínio ser verificado)
// const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
// const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  // Verificação do hottok da Hotmart
  const hottok =
    req.headers.get('x-hotmart-hottok') ??
    (body.hottok as string | undefined) ??
    ''

  if (HOTMART_HOTTOK && hottok !== HOTMART_HOTTOK) {
    console.error('Hottok inválido:', hottok)
    return new Response('Unauthorized', { status: 401 })
  }

  const event = body.event as string

  // Ignorar eventos que não sejam de compra aprovada
  if (event !== 'PURCHASE_APPROVED' && event !== 'PURCHASE_COMPLETE') {
    return new Response(JSON.stringify({ ok: true, message: 'Evento ignorado' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const data = body.data as Record<string, unknown>
  const product = data?.product as Record<string, unknown>
  const buyer = data?.buyer as Record<string, unknown>

  const productId = String(product?.id ?? '')
  const email = (buyer?.email as string | undefined) ?? ''
  const name = (buyer?.name as string | undefined) ?? (buyer?.first_name as string | undefined) ?? ''
  const phone = (buyer?.phone as string | undefined) ?? ''

  if (!email) {
    return new Response('Email do comprador ausente', { status: 400 })
  }

  // --- Mapeamento de produto → ação ---

  // Order bump Kids PDF
  if (productId === PRODUCT_ID_KIDS_PDF) {
    await handleKidsPdf({ email, name, phone })
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Plano low_15 ou lifetime
  let plan: 'low_15' | 'lifetime'
  let expiresAt: string | null

  if (productId === PRODUCT_ID_LOW) {
    plan = 'low_15'
    const expires = new Date()
    expires.setDate(expires.getDate() + 15)
    expiresAt = expires.toISOString()
  } else if (productId === PRODUCT_ID_LIFETIME) {
    plan = 'lifetime'
    expiresAt = null
  } else {
    console.log('Produto não mapeado:', productId)
    return new Response(JSON.stringify({ ok: true, message: 'Produto não mapeado' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Cria ou atualiza usuário
  const userId = await upsertUser({ email, name, plan, expiresAt })
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Falha ao criar usuário' }), { status: 500 })
  }

  // Gera magic link
  const magicLink = await generateMagicLink(email)

  // Notifica via Voxuy (WhatsApp)
  await notifyVoxuy({ name, phone, email, plan, magicLink })

  // E-mail via Resend (descomentado quando o domínio estiver verificado)
  // await sendEmail({ name, email, plan, magicLink })

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})

// ─── Handlers ────────────────────────────────────────────────────────────────

async function handleKidsPdf({
  email,
  name,
  phone,
}: {
  email: string
  name: string
  phone: string
}) {
  // Busca usuário pelo email
  const { data: list } = await supabase.auth.admin.listUsers()
  const user = list?.users?.find((u) => u.email === email)

  if (user) {
    await supabase
      .from('profiles')
      .update({ has_kids_pdf: true })
      .eq('id', user.id)
  }

  await notifyVoxuy({ name, phone, email, plan: 'kids_pdf', magicLink: null })

  // await sendEmail({ name, email, plan: 'kids_pdf', magicLink: null })
}

async function upsertUser({
  email,
  name,
  plan,
  expiresAt,
}: {
  email: string
  name: string
  plan: 'low_15' | 'lifetime'
  expiresAt: string | null
}): Promise<string | null> {
  const { data: list } = await supabase.auth.admin.listUsers()
  const existing = list?.users?.find((u) => u.email === email)

  if (existing) {
    await supabase
      .from('profiles')
      .update({ plan, expires_at: expiresAt })
      .eq('id', existing.id)
    return existing.id
  }

  // Cria novo usuário
  const { data: created, error } = await supabase.auth.admin.createUser({
    email,
    password: crypto.randomUUID(),
    email_confirm: true,
    user_metadata: { name },
  })

  if (error || !created?.user) {
    console.error('Erro ao criar usuário:', error)
    return null
  }

  await supabase.from('profiles').upsert({
    id: created.user.id,
    role: 'user',
    plan,
    expires_at: expiresAt,
    has_kids_pdf: false,
  })

  return created.user.id
}

async function generateMagicLink(email: string): Promise<string | null> {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })

  if (error) {
    console.error('Erro ao gerar magic link:', error)
    return null
  }

  return data?.properties?.action_link ?? null
}

// ─── Integrações externas ────────────────────────────────────────────────────

async function notifyVoxuy({
  name,
  phone,
  email,
  plan,
  magicLink,
}: {
  name: string
  phone: string
  email: string
  plan: string
  magicLink: string | null
}) {
  try {
    const res = await fetch(VOXUY_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${VOXUY_TOKEN}`,
      },
      body: JSON.stringify({
        name,
        phone,
        email,
        plan,
        magic_link: magicLink ?? '',
      }),
    })
    if (!res.ok) {
      console.error('Voxuy erro:', await res.text())
    }
  } catch (e) {
    console.error('Voxuy falhou:', e)
  }
}

/*
async function sendEmail({
  name,
  email,
  plan,
  magicLink,
}: {
  name: string
  email: string
  plan: string
  magicLink: string | null
}) {
  const subject =
    plan === 'kids_pdf'
      ? 'Seu Módulo Kids chegou! 🥗'
      : 'Seu acesso ao Cozinha Leve está pronto! 🥗'

  const body = `
    <p>Oi, ${name}! 👋</p>
    <p>${
      plan === 'kids_pdf'
        ? 'Seu PDF do Módulo Kids está disponível!'
        : 'Seu acesso ao app Cozinha Leve está liberado!'
    }</p>
    ${magicLink ? `<p><a href="${magicLink}">Clique aqui para acessar</a></p>` : ''}
  `

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: \`Bearer ${RESEND_API_KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: email,
      subject,
      html: body,
    }),
  })
}
*/
