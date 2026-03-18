import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import RotinaUpsell from './RotinaUpsell'

export default async function RotinaPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('has_rotina, rotina_plano')
    .eq('id', user.id)
    .single()

  // Tem acesso e já tem plano → vai direto para o plano
  if (profile?.has_rotina && profile?.rotina_plano) {
    redirect('/rotina/plano')
  }

  // Tem acesso mas não tem plano → vai para o formulário
  if (profile?.has_rotina && !profile?.rotina_plano) {
    redirect('/rotina/formulario')
  }

  // Sem acesso → exibe upsell
  return <RotinaUpsell />
}
