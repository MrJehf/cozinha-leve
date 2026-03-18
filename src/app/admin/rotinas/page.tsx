import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import AdminRotinasClient from './AdminRotinasClient'

interface RotinasRow {
  user_id: string
  email: string
  full_name: string | null
  rotina_plano: unknown
  rotina_form_data: unknown
  rotina_gerada_em: string | null
}

export default async function AdminRotinasPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  // Busca todos os usuários com has_rotina = true
  const admin = createAdminClient()

  const { data: profiles } = await admin
    .from('profiles')
    .select('id, full_name, rotina_plano, rotina_form_data, rotina_gerada_em')
    .eq('has_rotina', true)
    .order('rotina_gerada_em', { ascending: false, nullsFirst: false })

  // Busca emails via auth admin
  const { data: authList } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const emailMap: Record<string, string> = {}
  for (const u of authList?.users ?? []) {
    emailMap[u.id] = u.email ?? ''
  }

  const rows: RotinasRow[] = (profiles ?? []).map((p) => ({
    user_id: p.id,
    email: emailMap[p.id] ?? '',
    full_name: p.full_name,
    rotina_plano: p.rotina_plano,
    rotina_form_data: p.rotina_form_data,
    rotina_gerada_em: p.rotina_gerada_em,
  }))

  return <AdminRotinasClient rows={rows} />
}
