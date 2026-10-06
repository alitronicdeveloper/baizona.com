import { createContext, useContext, useState } from 'react'

const UserAuthContext = createContext()

export function UserAuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('baizona_user_token'))
  const [shopId, setShopId] = useState(localStorage.getItem('baizona_shop_id'))
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('baizona_user')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  const login = (data) => {
    localStorage.setItem('baizona_user_token', data.token)
    localStorage.setItem('baizona_shop_id', data.shop_id)
    localStorage.setItem('baizona_user', JSON.stringify(data))
    setToken(data.token)
    setShopId(data.shop_id)
    setUser(data)
  }

  const logout = () => {
    localStorage.removeItem('baizona_user_token')
    localStorage.removeItem('baizona_shop_id')
    localStorage.removeItem('baizona_user')
    setToken(null)
    setShopId(null)
    setUser(null)
  }

  return (
    <UserAuthContext.Provider value={{ token, shopId, user, login, logout, isLoggedIn: !!token }}>
      {children}
    </UserAuthContext.Provider>
  )
}

export function useUserAuth() {
  return useContext(UserAuthContext)
}
