import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webPush from 'npm:web-push@3'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:suporte@cozinhaleveapp.com.br'

webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

Deno.serve(async () => {
  const today = new Date()

  // Busca usuários com acesso expirando em 1, 3 ou 7 dias
  const targetDays = [1, 3, 7]

  for (const days of targetDays) {
    const targetDate = new Date(today)
    targetDate.setDate(targetDate.getDate() + days)

    const from = new Date(targetDate)
    from.setHours(0, 0, 0, 0)
    const to = new Date(targetDate)
    to.setHours(23, 59, 59, 999)

    // Busca profiles com expires_at no dia alvo
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .gte('expires_at', from.toISOString())
      .lte('expires_at', to.toISOString())

    if (!profiles?.length) continue

    const userIds = profiles.map((p) => p.id)

    // Busca subscriptions desses usuários
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .in('user_id', userIds)

    if (!subscriptions?.length) continue

    const payload = buildPayload(days)

    for (const sub of subscriptions) {
      try {
        await webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        )
      } catch (e) {
        console.error('Erro ao enviar push:', sub.endpoint, e)
      }
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

function buildPayload(days: number): { title: string; body: string; url: string } {
  if (days === 7) {
    return {
      title: 'Cozinha Leve 🌿',
      body: 'Seu acesso expira em 7 dias. Garanta o plano vitalício e continue transformando sua alimentação!',
      url: '/perfil',
    }
  }
  if (days === 3) {
    return {
      title: 'Cozinha Leve 🥗',
      body: 'Faltam apenas 3 dias para o seu acesso expirar. Renove agora e não perca nenhuma receita!',
      url: '/perfil',
    }
  }
  return {
    title: 'Cozinha Leve ⏰',
    body: 'Último dia! Seu acesso expira amanhã. Clique aqui para renovar e continuar com a gente.',
    url: '/perfil',
  }
}
