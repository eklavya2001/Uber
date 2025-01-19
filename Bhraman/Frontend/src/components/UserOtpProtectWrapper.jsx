import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
function UserOtpProtectWrapper({ children }) {
    const { isOtpSent } = useSelector(state => state.user)

    console.log(isOtpSent);


    if (!isOtpSent) {
        return <Navigate to='/signup' replace />
    }

    return (
        <>
            {children}
        </>
    )
}

export default UserOtpProtectWrapper