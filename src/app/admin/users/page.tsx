import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import UserList from '@/components/UserList'

export default async function UsersPage() {
  const supabase = await createClient()

  // 1. Verify Admin Access (Security)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  // 2. Fetch Users Data (Privileged)
  let users: any[] = []
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

  if (hasServiceKey) {
    const supabaseAdmin = createAdminClient()
    
    // Fetch Auth Users (to get emails)
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
        perPage: 1000 // Simple MVP limit
    })

    // Fetch Profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
    
    if (authUsers && profiles) {
        // Merge data
        users = authUsers.map(u => {
            const p = profiles.find(p => p.id === u.id)
            return {
                id: u.id,
                email: u.email,
                full_name: p?.full_name || u.user_metadata?.full_name || 'Sem Nome',
                role: p?.role || 'user',
                created_at: u.created_at
            }
        })
    }
  } else {
     // Fallback if something is wrong with key, though user said they added it.
     // Just fetch profiles as before
     const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
     
     users = profiles?.map(p => ({
         id: p.id,
         full_name: p.full_name,
         role: p.role || 'user',
         email: 'Email oculto (falta chave admin)'
     })) || []
  }

  // Sort by creation or name
  users.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Link href="/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-cozinha-cta transition">
        <ArrowLeft size={16} /> Voltar para Dashboard
      </Link>
      
      <UserList initialProfiles={users} hasServiceKey={hasServiceKey} />
    </div>
  )
}
