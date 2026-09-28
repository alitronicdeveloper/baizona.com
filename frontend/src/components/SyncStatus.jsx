import { useEffect, useState } from 'react'
import { countUnsynced } from '../db/dexie'
import { isOnline, syncAll, startAutoSync } from '../db/sync'

function SyncStatus() {
  const [online, setOnline] = useState(navigator.onLine)
  const [unsynced, setUnsynced] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(null)

  const refresh = async () => {
    const count = await countUnsynced()
    setUnsynced(count)
  }

  const handleSync = async () => {
    if (!online) return
    setSyncing(true)
    const result = await syncAll()
    setSyncing(false)
    setLastSync(new Date().toLocaleTimeString())
    refresh()
  }

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 5000)

    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    startAutoSync()

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const getStatus = () => {
    if (!online) return { color: '#dc2626', text: 'Bila intaneti', icon: '⚠️' }
    if (syncing) return { color: '#f59e0b', text: 'Inasawazisha...', icon: '🔄' }
    if (unsynced > 0) return { color: '#f59e0b', text: `${unsynced} hazijasawazishwa`, icon: '⏳' }
    return { color: '#16a34a', text: 'Imesawazishwa', icon: '✅' }
  }

  const status = getStatus()

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 12px',
      background: `${status.color}15`,
      border: `1px solid ${status.color}40`,
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      color: status.color,
      cursor: online && unsynced > 0 ? 'pointer' : 'default',
    }}
      onClick={online && unsynced > 0 ? handleSync : undefined}
      title={lastSync ? `Sync ya mwisho: ${lastSync}` : 'Bado hakuna sync'}
    >
      <span>{status.icon}</span>
      <span>{status.text}</span>
    </div>
  )
}

export default SyncStatus
