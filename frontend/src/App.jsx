import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import PWARegister from './components/PWARegister'
import BackHandler from './components/BackHandler'
import Login from './pages/Login'
import Register from './pages/Register'
import { UserAuthProvider } from './context/UserAuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Uza from './pages/Uza'
import Bidhaa from './pages/Bidhaa'
import Wateja from './pages/Wateja'
import MtejaDetail from './pages/MtejaDetail'
import Madeni from './pages/Madeni'
import Mauzo from './pages/Mauzo'
import Zaidi from './pages/Zaidi'
import Settings from './pages/Settings'
import Expenses from './pages/Expenses'
import Amana from './pages/Amana'
import Suppliers from './pages/Suppliers'
import SupplierDetail from './pages/SupplierDetail'
import Profile from './pages/Profile'
import Returns from './pages/Returns'

// Admin
import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import AdminDashboard from './admin/AdminDashboard'
import AdminShops from './admin/AdminShops'
import AdminShopDetail from './admin/AdminShopDetail'
import AdminPending from './admin/AdminPending'
import AdminAnalytics from './admin/AdminAnalytics'
import AdminData from './admin/AdminData'
import AdminSuppliers from './admin/AdminSuppliers'
import AdminSupplierDetail from './admin/AdminSupplierDetail'
import AdminUsers from './admin/AdminUsers'
import AdminSettings from './admin/AdminSettings'

function App() {
  return (
    <BrowserRouter>
      <UserAuthProvider>
        <PWARegister />
        <BackHandler />
        <Routes>
          {/* Duka */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Home />} />
            <Route path="/uza" element={<Uza />} />
            <Route path="/bidhaa" element={<Bidhaa />} />
            <Route path="/wateja" element={<Wateja />} />
            <Route path="/wateja/:id" element={<MtejaDetail />} />
            <Route path="/madeni" element={<Madeni />} />
            <Route path="/mauzo" element={<Mauzo />} />
            <Route path="/zaidi" element={<Zaidi />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/amana" element={<Amana />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/suppliers/:id" element={<SupplierDetail />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="shops" element={<AdminShops />} />
            <Route path="shops/:id" element={<AdminShopDetail />} />
            <Route path="pending" element={<AdminPending />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="data" element={<AdminData />} />
            <Route path="suppliers" element={<AdminSuppliers />} />
            <Route path="suppliers/:id" element={<AdminSupplierDetail />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </UserAuthProvider>
    </BrowserRouter>
  )
}

export default App
