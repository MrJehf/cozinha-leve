import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import RotinaFormulario from './RotinaFormulario'

export default async function RotinaFormularioPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('has_rotina, rotina_plano')
    .eq('id', user.id)
    .single()

  if (!profile?.has_rotina) redirect('/rotina')
  if (profile?.rotina_plano) redirect('/rotina/plano')

  return <RotinaFormulario />
}
