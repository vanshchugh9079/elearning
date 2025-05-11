import React, { useEffect, useState } from 'react'
import NavigationBar from './layoutComponent/NavigationBar'
import { Outlet, useLocation } from 'react-router-dom'
import Footer from './layoutComponent/Footer'
import AddCourse from './model/AddCourse'
import { useSelector } from 'react-redux'

export default function Layout() {
    let { showAddModel } = useSelector(state => state.showAddModel)
    let [path, setPath] = useState([])
    const location = useLocation();
    useEffect(() => {
        setPath(location.pathname.split("/"))
        console.log(showAddModel);
    }, [showAddModel,location])
    return (
        <div className='min-vh-100'>

            {
                !path.includes("live") &&
                <NavigationBar />
            }
            <Outlet />
            {
                !path .includes("profile")  || !path.includes("live")   &&
                <Footer />
            }
            <AddCourse show={showAddModel} />
        </div>
    )
}
