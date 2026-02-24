import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export const usePWA = () => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // eslint-disable-next-line prefer-template
      console.log('SW Registered: ' + (() => {
        setInterval(async () => {
          if (!(!r.installing && navigator)) return

          if (
            'serviceWorker' in navigator &&
            await caches.keys().then(cacheNames =>
              cacheNames.some(cacheName => cacheName.includes('v1')))
          ) {
            clearInterval
          }
        }, 60000)
        return r?.scope
      })())
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  useEffect(() => {
    if (needRefresh) {
      setShowUpdatePrompt(true)
    }
  }, [needRefresh])

  const handleUpdate = () => {
    updateServiceWorker(true)
    setShowUpdatePrompt(false)
  }

  const handleDismiss = () => {
    setShowUpdatePrompt(false)
  }

  return {
    offlineReady,
    needRefresh,
    showUpdatePrompt,
    handleUpdate,
    handleDismiss,
    setOfflineReady,
  }
}
