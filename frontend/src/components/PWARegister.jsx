import { useEffect } from 'react'

function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.ready.then((registration) => {
          console.log('✅ Service Worker ipo tayari:', registration.scope)
        })

        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('🔄 Service Worker imebadilika — refresh inahitajika')
        })
      })
    }
  }, [])

  return null
}

export default PWARegister
