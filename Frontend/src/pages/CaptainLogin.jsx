import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from "../assets/logo3.png"
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '../features/profile/captainSlice'


function CaptainLogin() {

    const [email, setemail] = useState('')
    const [password, setpassword] = useState('')
    const navigate = useNavigate()
    const dispatch = useDispatch()


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {


            const response = await api.post(`/captain/login`, { email, password }, { withCredentials: true })
            if (response.status == 200) {
                const payload = {
                    fullname: {
                        firstname: response.data.payload.fullname.firstname,
                        lastname: response.data.payload.fullname.lastname
                    },
                    email: response.data.payload.email,
                    phone: response.data.payload.phone,
                    vehicle: {
                        vehicleName: response.data.payload.vehicle.vehicleName,
                        color: response.data.payload.vehicle.color,
                        plateNo: response.data.payload.vehicle.plateNo,
                        vehicleType: response.data.payload.vehicle.vehicleType

                    },
                    isAuthenticated: response.data.isAuthenticated,
                    _id: response.data.payload._id

                }
                sessionStorage.setItem('captain', JSON.stringify(payload));
                localStorage.setItem('_id', response.data.payload._id)
                // Array ko stringify karke localStorage me store karo
                const libraries = ['places'];
                localStorage.setItem('googleLibraries', JSON.stringify(libraries));


                dispatch(loginSuccess(payload))

                navigate('/captainhome')
            }
        }
        catch (error) {
            console.error("error", error)
        }


    }
    return (

        <div className='bg-gradient-to-b from-indigo-600 via-red-300 to-yellow-300 h-screen flex flex-col items-center justify-center'>
            <div className='w-64 mb-0 mt-2'>
                <img src={logo} alt="" />
            </div>
            <h3 className='text-lg font-semibold'>Welcome Captain!</h3>
            <div className=' py-3   '>
                <form action="" onSubmit={handleSubmit} className='flex flex-col'>
                    <h3 className='text-2xl font-semibold mx-2 my-2 px-2'>What's your Email ? </h3>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setemail(e.target.value)}
                        required
                        placeholder='email@example.com'
                        className='bg-gray-200 my- mx-2 py-3 px-5 rounded placeholder:text-gray-600 border-s-gray-500' />
                    <h3 className='text-2xl font-semibold mx-2 my-2 px-2' >Enter your Password</h3>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setpassword(e.target.value)}
                        placeholder='password'
                        required
                        className='bg-gray-200 my- mx-2 py-3 px-5 rounded placeholder:text-gray-600 ' />
                    <button

                        className='bg-black text-white text-x font-semibold my-4 mx-2 px-2 py-3 flex justify-center items-center rounded'
                    >Continue</button>

                </form>
                <div className='mx-10'>--------------------- or -------------------</div>
                <h4 className='mx-5 my-2 text-lg' >Don't have an account?</h4>
                <Link to='/captain-signup' className='bg-black  text-white text-x font-semibold my-4 mx-3 mr-3 px-2 py-3 flex justify-center items-center rounded'>Sign Up</Link>
                <div className='mx-10'>--------------------- or -------------------</div>
                <Link to='/login' className='bg-black  text-white text-x font-semibold my-4 mx-3 mr-3 px-2 py-3 flex justify-center items-center rounded'>Go Back</Link>
            </div>
        </div>

    )
}

export default CaptainLogin