import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import RotinaPlan from './RotinaPlan'

interface Refeicao {
  nome: string
  horario_sugerido: string
  alimentos: string[]
  porcoes: string[]
  calorias_aproximadas: number
  dica?: string
}

interface Dia {
  dia: string
  refeicoes: Refeicao[]
}

interface Plano {
  resumo_perfil: string
  calorias_diarias: number
  distribuicao_macros: {
    proteinas_pct: number
    carboidratos_pct: number
    gorduras_pct: number
  }
  dias: Dia[]
  orientacoes_gerais: string[]
  alimentos_evitar: string[]
}

export default async function RotinaPlanoPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('has_rotina, rotina_plano, rotina_gerada_em, full_name')
    .eq('id', user.id)
    .single()

  if (!profile?.has_rotina) redirect('/rotina')
  if (!profile?.rotina_plano) redirect('/rotina/formulario')

  const plano = profile.rotina_plano as Plano
  const geradaEm = profile.rotina_gerada_em as string
  const nome = (profile.full_name as string | null) ?? user.email ?? 'você'

  return <RotinaPlan plano={plano} geradaEm={geradaEm} nome={nome} />
}
