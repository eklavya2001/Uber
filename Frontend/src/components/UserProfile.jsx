import React from 'react'

function UserProfile({ onClose }) {

    const user = JSON.parse(localStorage.getItem('user'))

    return (
        <div className=' flex flex-col justify-center items-center w-auto h-auto bg-gradient-to-b from-gray-300 via-blue-200 to-gray-300 space-y-4 rounded-2xl '>
            <h1 className='p-2 mt-3 text-xl font-semibold '>{user.fullname.firstname} {user.fullname.lastname}</h1>
            <div className='flex flex-col justify-center items-cente space-y-2'>

                <h2 className='text-lg font-semibold'>Email: {user.email}</h2>
                <h2 className='text-lg font-semibold'>Phone: {user.phone}</h2>

            </div>
            <button onClick={onClose} className='flex flex-col justify-center items-center h-12 w-12 ' ><img src="https://cdn-icons-png.freepik.com/256/8778/8778023.png?ga=GA1.1.274021499.1736281266&semt=ais_hybrid" alt="close" /></button>
        </div>
    )
}

export default UserProfile