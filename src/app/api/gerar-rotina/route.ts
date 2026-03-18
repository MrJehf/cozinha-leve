import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // Busca perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('has_rotina, rotina_plano, full_name')
    .eq('id', user.id)
    .single()

  if (!profile?.has_rotina) {
    return NextResponse.json({ error: 'Sem acesso à Rotina' }, { status: 403 })
  }

  if (profile.rotina_plano) {
    return NextResponse.json({ error: 'Plano já gerado' }, { status: 403 })
  }

  let formData: Record<string, unknown>
  try {
    formData = await request.json()
  } catch {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const userPrompt = montarPromptUsuario(formData)

  let plano: unknown
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: `Você é uma nutricionista especializada em alimentação saudável e emagrecimento. Gere um plano alimentar completo, personalizado e realista com base nos dados fornecidos. O plano deve ser cientificamente embasado, respeitar todas as restrições informadas, ser prático para o dia a dia brasileiro e conter alimentos acessíveis. NUNCA gere um plano genérico — cada refeição deve fazer sentido para o perfil específico desta pessoa. Responda APENAS com JSON válido, sem markdown, sem texto antes ou depois.`,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Resposta inválida da IA')
    }

    plano = JSON.parse(content.text)
  } catch (e) {
    console.error('Erro ao chamar Anthropic:', e)
    return NextResponse.json({ error: 'Erro ao gerar plano alimentar' }, { status: 500 })
  }

  // Salva na tabela rotina_planos (usa admin para bypass RLS no insert server-side)
  const admin = createAdminClient()

  const { error: insertError } = await admin.from('rotina_planos').insert({
    user_id: user.id,
    form_data: formData,
    plano,
  })

  if (insertError) {
    console.error('Erro ao salvar rotina_planos:', insertError)
    return NextResponse.json({ error: 'Erro ao salvar plano' }, { status: 500 })
  }

  // Atualiza perfil
  const { error: updateError } = await admin
    .from('profiles')
    .update({
      rotina_form_data: formData,
      rotina_plano: plano,
      rotina_gerada_em: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (updateError) {
    console.error('Erro ao atualizar profile:', updateError)
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 })
  }

  return NextResponse.json({ plano })
}

function montarPromptUsuario(data: Record<string, unknown>): string {
  const restricoes = Array.isArray(data.restricoes) ? (data.restricoes as string[]).join(', ') : 'Nenhuma'

  return `Gere um plano alimentar semanal completo (7 dias, Segunda a Domingo) para a seguinte pessoa:

**Dados físicos:**
- Peso atual: ${data.peso} kg
- Altura: ${data.altura} cm
- Idade: ${data.idade} anos

**Objetivo:** ${data.objetivo}
**Nível de atividade:** ${data.nivel_atividade}
**Refeições por dia:** ${data.refeicoes_por_dia}
**Restrições alimentares:** ${restricoes}
**Alimentos que não gosta:** ${data.alimentos_nao_gosta || 'Nenhum informado'}
**Tempo disponível para cozinhar por dia:** ${data.tempo_cozinhar}

Responda APENAS com JSON válido no seguinte formato (sem markdown, sem texto adicional):
{
  "resumo_perfil": "string — resumo do perfil nutricional",
  "calorias_diarias": number,
  "distribuicao_macros": {
    "proteinas_pct": number,
    "carboidratos_pct": number,
    "gorduras_pct": number
  },
  "dias": [
    {
      "dia": "Segunda-feira",
      "refeicoes": [
        {
          "nome": "Café da manhã",
          "horario_sugerido": "07:00",
          "alimentos": ["item 1", "item 2"],
          "porcoes": ["quantidade 1", "quantidade 2"],
          "calorias_aproximadas": number,
          "dica": "string curta opcional"
        }
      ]
    }
  ],
  "orientacoes_gerais": ["dica 1", "dica 2", "dica 3"],
  "alimentos_evitar": ["alimento 1", "alimento 2"]
}

Gere exatamente 7 dias (Segunda-feira a Domingo). O número de refeições por dia deve corresponder ao informado. Seja específico, prático e use alimentos do dia a dia brasileiro.`
}
