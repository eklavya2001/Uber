import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
function CaptainHomeProtectWrapper({ children }) {

    const { isAuthenticated } = useSelector((state) => state.captain)


    if (isAuthenticated) {
        localStorage.setItem('isAuth', true)

    }

    if (!localStorage.getItem('isAuth')) {
        return <Navigate to='/captainlogin' replace />
    }

    return (
        <>
            {children}
        </>
    )
}

export default CaptainHomeProtectWrapper