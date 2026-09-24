import { Route, Routes } from 'react-router-dom'
import WelcomePage from './pages/WelcomePage'
import UploadPhotoPage from './pages/UploadPhotoPage'
import UploadVideoPage from './pages/UploadVideoPage'
import GalleryPage from './pages/GalleryPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminPage from './pages/AdminPage'
import QrPage from './pages/QrPage'
import RequireAdmin from './components/RequireAdmin'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/subir/foto" element={<UploadPhotoPage />} />
      <Route path="/subir/video" element={<UploadVideoPage />} />
      <Route path="/galeria" element={<GalleryPage />} />
      <Route path="/qr" element={<QrPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminPage />
          </RequireAdmin>
        }
      />
    </Routes>
  )
}
