import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import PWARegister from './components/PWARegister'
import BackHandler from './components/BackHandler'
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

function App() {
  return (
    <BrowserRouter>
      <PWARegister />
      <BackHandler />
      <Routes>
        <Route element={<Layout />}>
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
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
