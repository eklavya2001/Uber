import React, { useState, } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import logo from "../assets/logo3.png"

import api from '../services/api'
import { loginSuccess } from '../features/profile/userSlice'
import { useDispatch } from 'react-redux'




function UserLogin() {

    const [email, setemail] = useState('')
    const [password, setpassword] = useState('')
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {


            const response = await api.post(`/user/login`, { email, password }, { withCredentials: true })
            const payload = {
                fullname: {
                    firstname: response.data.payload.fullname.firstname,
                    lastname: response.data.payload.fullname.lastname
                },
                phone: response.data.payload.phone,
                email: response.data.payload.email,
                isAuthenticated: response.data.success,
                _id: response.data.payload._id

            }
            if (response.status == 200) {
                console.log(response.data.msg)
                localStorage.setItem('user', JSON.stringify(payload));
                dispatch(loginSuccess(payload))
                navigate('/userhome')

            }

        }
        catch (error) {
            console.error("error", error)
        }


    }


    return (
        <div className='bg-gradient-to-b from-gray-300 via-slate-300 to-gray-800 h-screen flex flex-col items-center justify-center'>
            <div className='w-64 mb-0 mt-2'>
                <img src={logo} alt="" />
            </div>
            <h3 className='text-lg font-semibold'>Welcome User!</h3>
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
                        type='submit'
                        className='bg-black text-white text-x font-semibold my-4 mx-2 px-2 py-3 flex justify-center items-center rounded'
                    >Continue</button>

                </form>
                <div className='mx-10'>--------------------- or -------------------</div>
                <Link to='/signup' className='bg-black  text-white text-x font-semibold my-4 mx-3 mr-3 px-2 py-3 flex justify-center items-center rounded'>Sign Up</Link>
                <div className='mx-10'>--------------------- or -------------------</div>
                <Link to='/captainlogin' className='bg-black  text-white text-x font-semibold my-4 mx-3 mr-3 px-2 py-3 flex justify-center items-center rounded'>I am a Captain</Link>
            </div>
        </div>
    )
}

export default UserLogin

// import React from "react";
// import { Link } from "react-router-dom";

// function UserLogin() {
//     return (
//         <div className="bg-gradient-to-b from-indigo-600 via-red-300 to-yellow-300 h-screen flex items-center justify-center">
//             <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
//                 <form action="" className="flex flex-col">
//                     <h3 className="text-2xl font-semibold mb-4">What's your Email?</h3>
//                     <input
//                         type="email"
//                         placeholder="email@example.com"
//                         className="bg-gray-200 mb-4 p-3 rounded placeholder:text-gray-600 border border-gray-300"
//                     />

//                     <h3 className="text-2xl font-semibold mb-4">Enter your Password</h3>
//                     <input
//                         type="password"
//                         placeholder="password"
//                         className="bg-gray-200 mb-4 p-3 rounded placeholder:text-gray-600 border border-gray-300"
//                     />

//                     <button className="bg-black text-white text-lg font-semibold py-3 rounded hover:bg-gray-800">
//                         Continue
//                     </button>
//                 </form>

//                 <div className="text-center my-4 text-gray-600">or</div>

//                 <Link
//                     to="/signup"
//                     className="bg-black text-white text-lg font-semibold py-3 rounded block text-center hover:bg-gray-800"
//                 >
//                     Sign Up
//                 </Link>

//                 <div className="text-center my-4 text-gray-600">or</div>

//                 <Link
//                     to="/captain-login"
//                     className="bg-black text-white text-lg font-semibold py-3 rounded block text-center hover:bg-gray-800"
//                 >
//                     I am a Captain
//                 </Link>
//             </div>
//         </div>
//     );
// }

// export default UserLogin;

