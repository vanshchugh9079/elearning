import React from 'react'
import LoginForm from './pages/Login'
import RegisterForm from './pages/Register'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './component/Layout'
import Home from './pages/Home'
import Course from "./pages/Course"
import CourseShower from './pages/CourseShower'
import CoursePlayer from './pages/CoursePlayer'
import { useSelector } from 'react-redux'
import EditCourse from './pages/EditCourse'
import Profile from './pages/Profile'
import LiveClass from './pages/LiveClass'
import { Buffer } from 'buffer';
window.Buffer = Buffer;

if (typeof global === 'undefined') {
    var global = window;
  }
  

export default function App() {
    let { user, loggedIn } = useSelector((state) => state.user)
    let firstPath = loggedIn ? '/' : '/login'
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<RegisterForm />} path='/register'></Route>
                <Route element={<LoginForm />} path='/login'></Route>
                {
                    !loggedIn &&
                    <Route element={<LoginForm />} path='/'></Route>
                }
                {
                    loggedIn &&
                    <Route element={<Layout />} path='/'>
                        <Route element={<Home />} index />
                        <Route element={<Course />} path='course' />
                        <Route element={<CourseShower />} path='course/buy/:id' />
                        <Route element={<CoursePlayer />} path='course/:id/:lecture' />
                        <Route element={<CoursePlayer />} path='course/:id/' />
                        <Route element={<EditCourse/>} path='course/edit/:id'/>
                        <Route element={<Profile/>} path='profile'/>
                        <Route element={<LiveClass/>} path='course/live/:id'/>
                    </Route>
                }
            </Routes>
        </BrowserRouter>
    )
}
