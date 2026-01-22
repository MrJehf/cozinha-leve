'use client'

import { useState } from 'react'
import { UserPlus, Trash2, Edit, Key, X, Check } from 'lucide-react'
import { createUser, deleteUser, resetUserPassword, updateUser } from '@/app/actions/user-actions'

interface Profile {
  id: string
  full_name: string | null
  role: string | null // 'admin' | 'user'
  email?: string // Optional, as it might come from a join or be separate
}

interface UserListProps {
  initialProfiles: Profile[]
  hasServiceKey: boolean
}

export default function UserList({ initialProfiles, hasServiceKey }: UserListProps) {
  const [profiles, setProfiles] = useState(initialProfiles) // Optimistic UI could be used, but router.refresh in parent + prop update is easier
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Modal State
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [currentUser, setCurrentUser] = useState<Partial<Profile>>({})
  const [password, setPassword] = useState('') // Only for create

  // Handlers
  const handleOpenCreate = () => {
    setModalMode('create')
    setCurrentUser({})
    setPassword('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (profile: Profile) => {
    setModalMode('edit')
    setCurrentUser(profile)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) return
    
    setLoading(true)
    const res = await deleteUser(id)
    setLoading(false)

    if (res.success) {
      alert('Usuário excluído com sucesso')
      // Refresh handled by page revalidation usually, but we can also update local state if passed new props
      // For now, reload window or rely on parent re-render if using router.refresh() 
      window.location.reload() 
    } else {
      alert('Erro ao excluir: ' + res.error)
    }
  }

  const handleResetPassword = async (id: string) => {
    if (!confirm('Enviar email de redefinição de senha para este usuário?')) return
    
    setLoading(true)
    const res = await resetUserPassword(id)
    setLoading(false)

    if (res.success) {
      alert('Email de recuperação enviado!')
    } else {
      alert('Erro: ' + res.error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    let res
    if (modalMode === 'create') {
        if (!currentUser.full_name || !currentUser.email || !password) {
            alert("Preencha todos os campos")
            setLoading(false)
            return
        }
        res = await createUser(
            currentUser.full_name,
            currentUser.email,
            password,
            (currentUser.role as 'admin' | 'user') || 'user'
        )
    } else {
        if (!currentUser.id) return
        res = await updateUser(currentUser.id, {
            full_name: currentUser.full_name || undefined,
            role: (currentUser.role as 'admin' | 'user')
        })
    }

    setLoading(false)

    if (res.success) {
        setIsModalOpen(false)
        alert(modalMode === 'create' ? 'Usuário criado!' : 'Usuário atualizado!')
        window.location.reload()
    } else {
        alert('Erro: ' + res.error)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-cozinha-text">Gerenciar Usuários</h1>
        <button 
            onClick={handleOpenCreate}
            disabled={!hasServiceKey}
            className="flex items-center gap-2 rounded-lg bg-cozinha-cta px-4 py-2 text-white font-bold hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserPlus size={18} />
          Novo Usuário
        </button>
      </div>

       {/* Desktop View (Table) */}
       <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                    <th className="px-6 py-4 font-semibold text-gray-700">Nome / Email</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">ID</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Função</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-right">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {initialProfiles?.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                            <div className="text-sm font-bold text-gray-900">
                                {p.full_name || 'Sem Nome'}
                            </div>
                            <div className="text-xs text-gray-500">
                                {p.email || 'Email não disponível'}
                            </div>
                        </td>
                         <td className="px-6 py-4">
                            <div className="text-xs text-gray-500 font-mono">
                                {p.id.substring(0, 8)}...
                            </div>
                        </td>
                         <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                p.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                            }`}>
                                {p.role}
                            </span>
                        </td>
                         <td className="px-6 py-4 text-right flex justify-end gap-2">
                             <button
                                onClick={() => handleResetPassword(p.id)}
                                disabled={!hasServiceKey}
                                className="p-2 text-yellow-500 hover:bg-yellow-50 rounded transition disabled:opacity-30"
                                title="Resetar Senha (Email)"
                             >
                                <Key size={16} />
                             </button>
                            <button 
                                onClick={() => handleOpenEdit(p)}
                                disabled={!hasServiceKey}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded transition disabled:opacity-30" 
                                title="Editar"
                            >
                                <Edit size={16} />
                            </button>
                             <button 
                                onClick={() => handleDelete(p.id)}
                                disabled={!hasServiceKey}
                                className="p-2 text-red-500 hover:bg-red-50 rounded transition disabled:opacity-30" 
                                title="Excluir"
                            >
                                <Trash2 size={16} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
         </table>
        </div>

        {/* Mobile View (Cards) */}
        <div className="md:hidden space-y-4">
            {initialProfiles?.map((p) => (
                <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <div className="font-bold text-gray-900 text-lg">
                                {p.full_name || 'Sem Nome'}
                            </div>
                            <div className="text-sm text-gray-500 break-all">
                                {p.email || 'Email não disponível'}
                            </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            p.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                            {p.role}
                        </span>
                    </div>
                    
                    <div className="text-xs text-gray-400 font-mono mb-4">
                        ID: {p.id}
                    </div>

                    <div className="flex gap-2 border-t pt-3">
                         <button
                            onClick={() => handleResetPassword(p.id)}
                            disabled={!hasServiceKey}
                            className="flex-1 flex items-center justify-center gap-2 p-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition disabled:opacity-50"
                        >
                            <Key size={18} />
                            <span className="text-sm font-medium">Resetar</span>
                         </button>
                        <button 
                            onClick={() => handleOpenEdit(p)}
                            disabled={!hasServiceKey}
                            className="flex-1 flex items-center justify-center gap-2 p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition disabled:opacity-50" 
                        >
                            <Edit size={18} />
                            <span className="text-sm font-medium">Editar</span>
                        </button>
                         <button 
                            onClick={() => handleDelete(p.id)}
                            disabled={!hasServiceKey}
                            className="flex-1 flex items-center justify-center gap-2 p-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition disabled:opacity-50" 
                        >
                            <Trash2 size={18} />
                            <span className="text-sm font-medium">Excluir</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between border-b p-4">
                        <h3 className="text-lg font-bold text-gray-800">
                            {modalMode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
                        </h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                            <input 
                                type="text" 
                                required
                                className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-cozinha-cta focus:ring-1 focus:ring-cozinha-cta outline-none"
                                value={currentUser.full_name || ''}
                                onChange={e => setCurrentUser({...currentUser, full_name: e.target.value})}
                            />
                        </div>

                         {/* Email (Read only on edit for now to simplify) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input 
                                type="email" 
                                required
                                disabled={modalMode === 'edit'}
                                className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-cozinha-cta focus:ring-1 focus:ring-cozinha-cta outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                value={currentUser.email || ''}
                                onChange={e => setCurrentUser({...currentUser, email: e.target.value})}
                            />
                        </div>

                        {/* Password (Create only) */}
                        {modalMode === 'create' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Senha</label>
                                <input 
                                    type="password" 
                                    required
                                    minLength={6}
                                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-cozinha-cta focus:ring-1 focus:ring-cozinha-cta outline-none"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                            </div>
                        )}

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Função</label>
                            <select
                                className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-cozinha-cta focus:ring-1 focus:ring-cozinha-cta outline-none bg-white"
                                value={currentUser.role || 'user'}
                                onChange={e => setCurrentUser({...currentUser, role: e.target.value})}
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 rounded-lg bg-cozinha-cta py-2.5 text-sm font-bold text-white shadow-sm hover:bg-opacity-90 disabled:opacity-50"
                            >
                                {loading ? 'Salvando...' : 'Confirmar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  )
}
