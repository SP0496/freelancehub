import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar isPortal={false} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
