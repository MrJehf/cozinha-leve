'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

export default function PushNotifications() {
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setSupported(true)
      checkSubscription()
    }
  }, [])

  async function checkSubscription() {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    setSubscribed(!!sub)
  }

  async function subscribe() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      const json = sub.toJSON() as {
        endpoint: string
        keys: { p256dh: string; auth: string }
      }

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      })

      setSubscribed(true)
    } catch (e) {
      console.error('Erro ao ativar notificações:', e)
    } finally {
      setLoading(false)
    }
  }

  async function unsubscribe() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setSubscribed(false)
    } catch (e) {
      console.error('Erro ao desativar notificações:', e)
    } finally {
      setLoading(false)
    }
  }

  if (!supported) return null

  return (
    <div>
      <p className="text-xs text-cozinha-text-secondary uppercase tracking-wider mb-1">
        Notificações
      </p>
      <button
        onClick={subscribed ? unsubscribe : subscribe}
        disabled={loading}
        className="flex items-center justify-between w-full rounded-xl border border-gray-200 px-4 py-3 transition hover:bg-gray-50 group"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg bg-cozinha-cta/10 p-2">
            {subscribed ? (
              <Bell size={18} className="text-cozinha-cta" />
            ) : (
              <BellOff size={18} className="text-cozinha-text-secondary" />
            )}
          </div>
          <div className="text-left">
            <span className="font-medium text-cozinha-text block">
              {subscribed ? 'Notificações ativas' : 'Ativar notificações'}
            </span>
            <span className="text-xs text-cozinha-text-secondary">
              {subscribed
                ? 'Você receberá lembretes de expiração'
                : 'Receba lembretes antes do acesso expirar'}
            </span>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${subscribed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {loading ? '...' : subscribed ? 'Ativo' : 'Inativo'}
        </span>
      </button>
    </div>
  )
}
