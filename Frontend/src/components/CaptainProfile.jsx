import React from 'react'

function CaptainProfile({ onClose }) {

    const captain = JSON.parse(sessionStorage.getItem('captain'))

    return (
        <div className=' flex flex-col justify-center items-center w-auto h-auto bg-gradient-to-b from-orange-200 via-blue-100 to-red-200 space-y-4 rounded-2xl '>
            <h1 className='p-2 mt-3 text-xl font-semibold '>{captain.fullname.firstname} {captain.fullname.lastname}</h1>
            <div className='flex flex-col justify-center items-center space-y-2'>

                <h2 className='text-lg font-semibold'>Email: {captain.email}</h2>
                <h2 className='text-lg font-semibold'>Phone: {captain.phone}</h2>
                <h2 className='text-lg font-semibold'>Vehicle Name : {captain.vehicle.vehicleName}</h2>
                <h2 className='text-lg font-semibold'>Vehicle Color: {captain.vehicle.color}</h2>
                <h2 className='text-lg font-semibold'>Vehicle Number: {captain.vehicle.plateNo}</h2>


            </div>
            <button onClick={onClose} className='flex flex-col justify-center items-center h-12 w-12 ' ><img src="https://cdn-icons-png.freepik.com/256/8778/8778023.png?ga=GA1.1.274021499.1736281266&semt=ais_hybrid" alt="close" /></button>
        </div>
    )
}

export default CaptainProfile