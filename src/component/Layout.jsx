import React, { useEffect, useState } from 'react'
import NavigationBar from './layoutComponent/NavigationBar'
import { Outlet, useLocation } from 'react-router-dom'
import Footer from './layoutComponent/Footer'
import AddCourse from './model/AddCourse'
import { useSelector } from 'react-redux'
import "../css/layout.css"
export default function Layout() {
    let { showAddModel } = useSelector(state => state.showAddModel)
    let [path, setPath] = useState([])
    const location = useLocation();
    useEffect(() => {
        setPath(location.pathname.split("/"))
    }, [showAddModel,location])
    return (
        <div className=' full-height'>

            {
                !path.includes("live")&& !path.includes("create") &&
                <NavigationBar />
            }
            <Outlet />
            {
                !path .includes("profile")  && !path.includes("live") && !path.includes("create")  &&
                <Footer />
            }
        </div>
    )
}
