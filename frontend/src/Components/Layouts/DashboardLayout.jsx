import React, { useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { UserContext } from '../../Context/userContext'
import Navbar from './Navbar'
import CursorShadow from '../Cursor/CursorShadow'


const DashboardLayout = ({children}) => {
    const {user} = useContext(UserContext)
    const location = useLocation()

    const getCursorColor = () => {
      if (location.pathname === '/dashboard') return '#FF9324'
      if (location.pathname === '/profile') return '#6366f1'
      if (location.pathname.startsWith('/interview-prep')) return '#7dd3c0'
      return '#e99a4b'
    }

  return (
    <div className="min-h-screen">
        <CursorShadow color={getCursorColor()} shadowSize={150} blur={50} />
        <Navbar />

        {user && <div className='mx-2 md:mx-5 overflow-x-hidden'>{children}</div>}
    </div>
  )
}

export default DashboardLayout