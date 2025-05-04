import React from 'react'
import NavigationBar from './layoutComponent/NavigationBar'
import { Outlet } from 'react-router-dom'
import Footer from './layoutComponent/Footer'

export default function Layout() {
    return (
        <div className='min-vh-100'>
            <NavigationBar />
            <Outlet />
            <Footer />
        </div>
    )
}
