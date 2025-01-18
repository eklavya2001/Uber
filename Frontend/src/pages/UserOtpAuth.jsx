import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import logo3 from "../assets/logo3.png"
import api from '../services/api';

function UserOtpAuth() {

    const [minute, setminute] = useState(4)
    const [second, setsecond] = useState(59)

    const [otp, setOtp] = useState(["", "", "", "", "", ""]); // Array for 6 digits
    const inputRefs = useRef([]); // Ref array to manage input focus

    const navigate = useNavigate()
    useEffect(() => {
        const timerInterval = setInterval(() => {
            setsecond((prevSecond) => {
                if (prevSecond === 0) {
                    if (minute === 0) {
                        clearInterval(timerInterval); // Stop timer when time is up
                        return 0;
                    } else {
                        setminute((prevMinute) => prevMinute - 1); // Decrease minute
                        return 59; // Reset seconds to 59
                    }
                }
                return prevSecond - 1; // Decrease second
            });
        }, 1000);

        return () => clearInterval(timerInterval); // Cleanup interval
    }, [minute]);

    // Handle OTP Input
    const handleChange = (e, index) => {
        const value = e.target.value;

        // Allow only digits
        if (!/^\d*$/.test(value)) return;

        // Update OTP array
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Focus next input box
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    // Handle Backspace
    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    // Submit OTP
    const handleSubmit = async () => {
        // console.log("aabb");

        const otpValue = otp.join(""); // Combine all inputs into one string

        const response2 = await api.post(`/user/register/otpauth`, { otp: otpValue })

        console.log(response2.data.msg)


        if (response2.status == 200) {
            alert("Welcome Aboard , Please login to continue")
            navigate("/login")
        }

        console.log("OTP Submitted:", otpValue); // Send this to backend
        // Add your backend submission logic here
    };



    return (
        <div className='bg-gradient-to-b from-slate-200 via-gray-200 gray-500 h-screen lg:flex flex-col justify-center items-center' >
            <img src={logo3} alt="" />
            <h2 className='text-2xl font-semibold font-mono flex justify-center rounded-md my-5'>Enter Your OTP : </h2>
            <div className='flex flex-row w-full justify-center'>
                {otp.map((_, index) => (
                    <input
                        key={index}
                        type="text"
                        maxLength="1" // Restrict to one digit
                        className="my-1 mx-1 py-2  w-12 text-center text-lg font-semibold rounded-md border border-gray-300"
                        value={otp[index]}
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        ref={(el) => (inputRefs.current[index] = el)} // Assign ref to input
                    />
                ))}

            </div>
            <div className='flex justify-center ' >
                <button type='submit' onClick={handleSubmit} className='bg-black text-white my-2 px-4 py-2 rounded' >Verify</button>
            </div>
            <h2 className='flex justify-center my-5 text-md font-semibold'>OTP is valid only for {minute}:{second} minutes</h2>
        </div>
    )
}

export default UserOtpAuth