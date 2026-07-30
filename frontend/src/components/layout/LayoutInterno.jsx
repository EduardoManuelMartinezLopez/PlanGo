import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

// Este layout envuelve TODAS las pantallas internas (después de
// iniciar sesión), así el sidebar y el navbar se comparten en toda
// la app en vez de repetirlos en cada página.
export default function LayoutInterno() {
  return (
    <div className="layout-app">
      <Sidebar />
      <div className="contenido-principal">
        <Navbar />
        <Outlet />
      </div>
    </div>
  )
}
