import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from "../assets/logo3.png"
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useDispatch } from 'react-redux'
import { signupSuccess } from '../features/profile/captainSlice'
function CaptainSignup() {

    const [firstname, setfirstname] = useState('')
    const [lastname, setlastname] = useState('')
    const [email, setemail] = useState('')
    const [phone, setphone] = useState('')
    const [password, setpassword] = useState('')
    const [vehicleName, setvehicleName] = useState('')
    const [vehicleType, setvehicleType] = useState('')
    const [color, setcolor] = useState('')
    const [capacity, setcapacity] = useState('')
    const [plateNo, setplateNo] = useState('')




    const navigate = useNavigate()
    const dispatch = useDispatch()
    const handlesubmit = async (e) => {

        e.preventDefault();



        try {

            const response = await api.post('/captain/register', { firstname, lastname, email, phone, password, vehicleName, vehicleType, color, capacity, plateNo })
            if (response.status == 200) {
                alert(response.data.msg)
                const payload = {
                    isOtpSent: response.data.isOtpSent
                }
                dispatch(signupSuccess(payload))
                navigate('/otpAuthCaptain')

            }
        } catch (error) {
            console.log('error', error)
        }
    }
    return (
        <div className='bg-gradient-to-b from-blue-400 via-yellow-200 to-gray-600'>
            <div className='bg-gradient-to-b from-gray-400 via-yellow-200 to-gray-600 overflow-y-auto relative h-screen    custom:flex custom:flex-col custom:justify-end custom:items-center custom:h-full '>
                <div className='w-64 mb-0 mt-2'>
                    <img src={logo} alt="" />
                </div>
                <form action="" onSubmit={handlesubmit} className='flex flex-col py-3 mx-3 mt-5 custom:bg-gradient-to-b from-gray-300 via-yellow-100 to-gray-300  custom:rounded-xl custom:w-auto custom:px-16 '>

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

                    <label htmlFor="vehicleName" className='text-2xl font-semibold mx-3'>Vehicle Name</label>
                    <input
                        id="vehicleName"
                        value={vehicleName}
                        onChange={(e) => setvehicleName(e.target.value)}
                        type="text"
                        name="vehicleName"
                        className="border rounded px-4 py-2 mx-3 my-3 placeholder:text-gray-600 placeholder:font-semibold "
                        placeholder="Enter your Vehicle Name.."
                        required
                    />
                    <label htmlFor="vehicleType" className='text-2xl font-semibold mx-3'>Vehicle Type</label>
                    <input
                        id="vehicleType"
                        value={vehicleType}
                        onChange={(e) => setvehicleType(e.target.value)}
                        type="text"
                        name="vehicleType"
                        className="border rounded px-4 py-2 mx-3 my-3 placeholder:text-gray-600 placeholder:font-semibold "
                        placeholder="Motorcycle/Car/Auto"
                        required
                    />
                    <label htmlFor="color" className='text-2xl font-semibold mx-3'>Vehicle Color</label>
                    <input
                        id="color"
                        value={color}
                        onChange={(e) => setcolor(e.target.value)}
                        type="text"
                        name="color"
                        className="border rounded px-4 py-2 mx-3 my-3 placeholder:text-gray-600 placeholder:font-semibold "
                        placeholder="Blue/Red/........"
                        required
                    />
                    <label htmlFor="capacity" className='text-2xl font-semibold mx-3'>Seat Capacity</label>
                    <input
                        id="capacity"
                        value={capacity}
                        onChange={(e) => setcapacity(e.target.value)}
                        type="Number"
                        name="capacity"
                        className="border rounded px-4 py-2 mx-3 my-3 placeholder:text-gray-600 placeholder:font-semibold "
                        placeholder="1/3/4"
                        required
                    />
                    <label htmlFor="plateNo" className='text-2xl font-semibold mx-3'>Plate Number</label>
                    <input
                        id="plateNo"
                        value={plateNo}
                        onChange={(e) => setplateNo(e.target.value)}
                        type="text"
                        name="plateNo"
                        className="border rounded px-4 py-2 mx-3 my-3 placeholder:text-gray-600 placeholder:font-semibold "
                        placeholder="xx-00-xx-0000"
                        required
                    />




                    <button
                        className='text-2xl font-semibold mx-3 rounded py-2 my-5 text-white bg-black '>
                        Sign Up
                    </button>
                    <Link to='/login' className='bg-black  text-white text-xl font-semibold custom:w-60 custom:mt-  mb-2 mx-3 mr-3 px-2 py-3 flex justify-center items-center rounded'>Go Back</Link>
                </form>


                <div className=' custom:py-10 '>
                    <h4 className='text-sm px-3 text-gray-200 items-center mt-6' >By proceeding, you consent to get calls, WhatsApp or SMS messages, including by automated dialer, from Bhraman and its affiliates to the number provided.</h4>
                </div>

            </div>

        </div>
    )
}

export default CaptainSignup


