import React from 'react'
import { useState } from 'react';
import { Link } from 'react-router-dom'
import logo from "../assets/logo3.png"
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signupSuccess } from '../features/profile/userSlice';

function UserSignup() {

    const [firstname, setfirstname] = useState('')
    const [lastname, setlastname] = useState('')
    const [email, setemail] = useState('')
    const [phone, setphone] = useState('')
    const [password, setpassword] = useState('')

    const navigate = useNavigate()
    const dispatch = useDispatch()


    const handlesubmit = async (e) => {

        e.preventDefault();



        try {

            const response = await api.post('/user/register', { firstname, lastname, email, phone, password })
            if (response.status == 201) {
                alert(response.data.msg)
                const payload = {
                    isOtpSent: response.data.otpsent
                }

                dispatch(signupSuccess(payload))
                navigate('/otpAuth')

            }
        } catch (error) {
            console.error('error', error)
        }

    }

    return (
        <div className=''>
            <div className='bg-gradient-to-b from-gray-300 via-slate-300 to-gray-800 overflow-y-auto  relative h-screen  custom:flex custom:flex-col custom:justify-center custom:items-center '>
                <div className='w-64 mb-0 mt-2'>
                    <img src={logo} alt="" />
                </div>
                <form action="" onSubmit={handlesubmit} className='flex flex-col py-3 custom:bg-gradient-to-b from-gray-300 via-slate-300 to-gray-700  custom:rounded-xl custom:w-3/6 custom:px-16 '>

                    <label htmlFor="Firstname" className='text-2xl font-semibold mx-3 '>First Name</label>
                    <input
                        id="firstname"
                        value={firstname}
                        onChange={(e) => setfirstname(e.target.value)}
                        type="text"
                        name="firstname"
                        className="border rounded px-3 py-2  mx-3 my-3 placeholder:text-gray-600 placeholder:font-semibold "
                        placeholder="Enter your first name"
                        required
                    />
                    <label htmlFor="lastname" className='text-2xl font-semibold mx-3'>Last Name</label>
                    <input
                        id="lastname"
                        value={lastname}
                        onChange={(e) => setlastname(e.target.value)}
                        type="text"
                        name="lastname"
                        className="border rounded px-3 py-2 mx-3 my-3 placeholder:text-gray-600 placeholder:font-semibold "
                        placeholder="Enter your last name"
                        required
                    />
                    <label htmlFor="email" className='text-2xl font-semibold mx-3'>Email</label>
                    <input
                        id="email"
                        value={email}
                        onChange={(e) => setemail(e.target.value)}
                        type="email"
                        name="email"
                        className="border rounded px-4 py-2 mx-3 my-3 placeholder:text-gray-600 placeholder:font-semibold "
                        placeholder="Enter your email"
                        required
                    />
                    <label htmlFor="phone" className='text-2xl font-semibold mx-3'>Mobile No</label>
                    <input
                        id="phone"
                        value={phone}
                        onChange={(e) => setphone(e.target.value)}
                        type="text"
                        name="phone"
                        className="border rounded px-4 py-2 mx-3 my-3 placeholder:text-gray-600 placeholder:font-semibold "
                        placeholder="Enter your Mobile Number"
                        required
                    />
                    <label htmlFor="password" className='text-2xl font-semibold mx-3'>Password</label>
                    <input
                        id="password"
                        value={password}
                        onChange={(e) => setpassword(e.target.value)}
                        type="password"
                        name="password"
                        className="border rounded px-4 py-2 mx-3 my-3 placeholder:text-gray-600 placeholder:font-semibold "
                        placeholder="Enter your Password"
                        required
                    />
                    <button
                        type='submit'
                        className='text-2xl font-semibold mx-3 rounded py-2 my-5 text-white bg-black '>
                        Sign Up
                    </button>
                    <Link to='/login' className='bg-black  text-white text-xl font-semibold custom:w-full custom:mr-3  mb-2 mx-3 mr-3 px-2 py-3 flex justify-center items-center rounded'>Go Back</Link>
                </form>
                {/* <div className='mx-1'>--------------------- or -------------------</div> */}

                <div className='absolute custom:bottom-5 '>
                    <h4 className='text-sm px-3 text-gray-200 items-center mt-6' >By proceeding, you consent to get calls, WhatsApp or SMS messages, including by automated dialer, from Bhraman and its affiliates to the number provided.</h4>
                </div>

            </div>

        </div>
    )
}

export default UserSignup