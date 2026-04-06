import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // 1. Permitir acesso público à página de login e callback de auth
  if (path === '/auth/callback') {
    return supabaseResponse
  }

  if (path === '/login') {
    if (user) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return supabaseResponse
  }

  // 2. Bloquear não autenticados
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. Lógica para usuários autenticados

  // Busca perfil com campos de plano
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, plan, expires_at')
    .eq('id', user.id)
    .single()

  // Verificação de expiração (apenas usuários não-admin)
  if (profile?.role !== 'admin' && !path.startsWith('/acesso-expirado')) {
    if (profile?.expires_at) {
      const expired = new Date(profile.expires_at) < new Date()
      if (expired) {
        return NextResponse.redirect(new URL('/acesso-expirado', request.url))
      }
    }
  }

  // Redirect da raiz
  if (path === '/') {
    if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    } else {
      return NextResponse.redirect(new URL('/receita', request.url))
    }
  }

  // Proteção de rotas admin
  if (path.startsWith('/admin')) {
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}
