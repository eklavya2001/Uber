import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
function CaptainOtpProtectWrapper({ children }) {
    const { isOtpSent } = useSelector(state => state.captain)

    console.log(isOtpSent);


    if (!isOtpSent) {
        return <Navigate to='/captain-signup' replace />
    }

    return (
        <>
            {children}
        </>
    )
}

export default CaptainOtpProtectWrapper