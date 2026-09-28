import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function BackHandler() {
  const location = useLocation()
  const navigate = useNavigate()
  const historyRef = useRef([location.pathname])

  useEffect(() => {
    // Ongeza history entry ya kwanza
    window.history.pushState({ internal: true }, '')

    const handlePopState = (e) => {
      // Kama ni internal navigation, rudi hatua moja
      if (historyRef.current.length > 1) {
        historyRef.current.pop()
        const prev = historyRef.current[historyRef.current.length - 1]
        navigate(prev, { replace: true })
        window.history.pushState({ internal: true }, '')
      } else {
        // Kama ni home, acha browser ifunge
        window.history.back()
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [navigate])

  useEffect(() => {
    // Track navigation history
    const current = location.pathname
    const last = historyRef.current[historyRef.current.length - 1]

    if (current !== last) {
      historyRef.current.push(current)
      // Keep max 20 entries
      if (historyRef.current.length > 20) {
        historyRef.current.shift()
      }
    }
  }, [location.pathname])

  return null
}

export default BackHandler
