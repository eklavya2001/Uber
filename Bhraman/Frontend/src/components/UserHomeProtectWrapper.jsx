import React from 'react'

import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'


function UserHomeProtectWrapper({ children }) {


    const { isAuthenticated } = useSelector((state) => state.user)

    if (isAuthenticated) {
        localStorage.setItem('isAuth', 'true')
    }

    console.log(isAuthenticated);

    if (!localStorage.getItem('isAuth')) {
        return <Navigate to='/login' replace />
    }

    return (
        <>
            {children}
        </>
    )
}

export default UserHomeProtectWrapper