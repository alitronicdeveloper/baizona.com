import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const PAGES = ['/', '/wateja', '/mauzo', '/madeni']

function SwipeNav({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const touchStart = useRef(null)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const isMobile = window.innerWidth <= 768
    if (!isMobile) return

    const currentIndex = PAGES.indexOf(location.pathname)
    if (currentIndex === -1) return

    const onStart = (e) => {
      touchStart.current = e.touches[0].clientX
      setDragging(true)
    }

    const onMove = (e) => {
      if (touchStart.current === null) return
      const diff = touchStart.current - e.touches[0].clientX

      // Resist at edges
      let limited = diff
      if (diff > 0 && currentIndex === PAGES.length - 1) limited = diff * 0.2
      if (diff < 0 && currentIndex === 0) limited = diff * 0.2

      setDragX(-limited)
    }

    const onEnd = (e) => {
      setDragging(false)
      if (touchStart.current === null) {
        setDragX(0)
        return
      }

      const endX = e.changedTouches[0].clientX
      const diff = touchStart.current - endX
      const threshold = 60

      touchStart.current = null

      if (diff > threshold && currentIndex < PAGES.length - 1) {
        // Slide out to left, then navigate
        setDragX(-window.innerWidth)
        setTimeout(() => {
          navigate(PAGES[currentIndex + 1])
          setDragX(window.innerWidth)
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setDragX(0)
            })
          })
        }, 220)
      } else if (diff < -threshold && currentIndex > 0) {
        setDragX(window.innerWidth)
        setTimeout(() => {
          navigate(PAGES[currentIndex - 1])
          setDragX(-window.innerWidth)
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setDragX(0)
            })
          })
        }, 220)
      } else {
        setDragX(0)
      }
    }

    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('touchend', onEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
    }
  }, [location.pathname, navigate])

  return (
    <div
      style={{
        transform: `translateX(${dragX}px)`,
        transition: dragging ? 'none' : 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'transform',
        minHeight: '100vh',
        background: 'var(--bg)',
      }}
    >
      {children}
    </div>
  )
}

export default SwipeNav
