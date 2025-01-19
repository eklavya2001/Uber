import React from 'react'
import logo3 from "../assets/logo3.png"
import { Link } from 'react-router-dom'

function Home() {
    return (
        <div >
            <div className='bg-cover bg-center bg-small-screen custom:bg-large-screen h-screen pt-2  flex justify-between flex-col w-full bg-red-400 '>
                <img className='w-64 pr-3 ' src={logo3} alt="" />
                <div className='bg-white py-2 px-2 pb-2 '>
                    <h2 className='text-3xl font-bold px-3 ml-'>Get Started with Bhraman</h2>
                    <Link to='/login' className=' flex justify-center items-center w-ful bg-black text-white py-3 rounded mt-5'>Continue</Link>
                </div>
            </div>
        </div>
    )
}

export default Home
