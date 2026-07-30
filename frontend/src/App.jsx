import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import RutaProtegida from './components/common/RutaProtegida'
import LayoutInterno from './components/layout/LayoutInterno'

import Login from './pages/publico/Login'
import Registro from './pages/publico/Registro'
import VerificacionCorreo from './pages/publico/VerificacionCorreo'
import RecuperarContrasena from './pages/publico/RecuperarContrasena'
import RestablecerContrasena from './pages/publico/RestablecerContrasena'

import Inicio from './pages/viajero/Inicio'
import Explorar from './pages/viajero/Explorar'
import DetalleDestino from './pages/viajero/DetalleDestino'
import MisViajes from './pages/viajero/MisViajes'
import NuevoViaje from './pages/viajero/NuevoViaje'
import DetalleViaje from './pages/viajero/DetalleViaje'
import Favoritos from './pages/viajero/Favoritos'
import Configuracion from './pages/viajero/Configuracion'

import GestionDestinos from './pages/agente/GestionDestinos'
import GestionCategorias from './pages/agente/GestionCategorias'

import Estadisticas from './pages/admin/Estadisticas'
import Usuarios from './pages/admin/Usuarios'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* --- Rutas públicas --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/verificar-correo" element={<VerificacionCorreo />} />
          <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
          <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />

          {/* --- Rutas internas: comparten el Sidebar + Navbar --- */}
          <Route
            element={
              <RutaProtegida>
                <LayoutInterno />
              </RutaProtegida>
            }
          >
            {/* Cualquier usuario autenticado */}
            <Route path="/" element={<Inicio />} />
            <Route path="/configuracion" element={<Configuracion />} />

            {/* Solo rol viajero (aunque protegemos por si acaso, el
                Sidebar ya ni les muestra estos links a otros roles) */}
            <Route path="/explorar" element={<RutaProtegida rolesPermitidos={['viajero']}><Explorar /></RutaProtegida>} />
            <Route path="/explorar/:id" element={<RutaProtegida rolesPermitidos={['viajero']}><DetalleDestino /></RutaProtegida>} />
            <Route path="/mis-viajes" element={<RutaProtegida rolesPermitidos={['viajero']}><MisViajes /></RutaProtegida>} />
            <Route path="/mis-viajes/:id" element={<RutaProtegida rolesPermitidos={['viajero']}><DetalleViaje /></RutaProtegida>} />
            <Route path="/nuevo-viaje" element={<RutaProtegida rolesPermitidos={['viajero']}><NuevoViaje /></RutaProtegida>} />
            <Route path="/favoritos" element={<RutaProtegida rolesPermitidos={['viajero']}><Favoritos /></RutaProtegida>} />

            {/* Solo rol agente */}
            <Route path="/agente/destinos" element={<RutaProtegida rolesPermitidos={['agente', 'administrador']}><GestionDestinos /></RutaProtegida>} />
            <Route path="/agente/categorias" element={<RutaProtegida rolesPermitidos={['agente', 'administrador']}><GestionCategorias /></RutaProtegida>} />

            {/* Solo rol administrador */}
            <Route path="/admin/estadisticas" element={<RutaProtegida rolesPermitidos={['administrador']}><Estadisticas /></RutaProtegida>} />
            <Route path="/admin/usuarios" element={<RutaProtegida rolesPermitidos={['administrador']}><Usuarios /></RutaProtegida>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
