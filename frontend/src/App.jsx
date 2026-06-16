import React from 'react'
import {BrowserRouter as Router,Routes,Route, Navigate} from "react-router-dom"
import {Toaster} from "react-hot-toast"
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Home/Dashboard'
import InterviewPrep from './pages/InterviewPrep/InterviewPrep'
import Profile from './pages/Profile/Profile'
import Pricing from './pages/Pricing'
import UserProvider from './Context/userContext'
import ProtectedRoute from './Components/ProtectedRoute'


const App = () => {
  return (
    <UserProvider>
    <div>
      <Router>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route 
            path='/dashboard' 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/pricing' 
            element={<Pricing />}
          />
          <Route 
            path='/profile' 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/interview-prep/:sessionId' 
            element={
              <ProtectedRoute>
                <InterviewPrep />
              </ProtectedRoute>
            } 
          />
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

    <Toaster
      toastOptions={{
        className : "",
        style : {
          fontSize : " 13px",

        },
      }}
    />

    </div>
    </UserProvider>
  )
}

export default App
