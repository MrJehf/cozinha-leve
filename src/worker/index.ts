/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope

// Handler de push notification
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json() as {
    title: string
    body: string
    url?: string
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: { url: data.url ?? '/' },
    })
  )
})

// Ao clicar na notificação, abre o app
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data as { url: string }).url

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => c.url.includes(url))
        if (existing) return existing.focus()
        return self.clients.openWindow(url)
      })
  )
})
