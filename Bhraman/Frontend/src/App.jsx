
import { Suspense, lazy } from 'react';
import './App.css'
import { Route, Routes } from 'react-router-dom'
const Home = lazy(() => import('./pages/Home'));
const UserSignup = lazy(() => import('./pages/UserSignup'));
const CaptainLogin = lazy(() => import('./pages/CaptainLogin'));
const UserLogin = lazy(() => import('./pages/UserLogin'));
const CaptainSignup = lazy(() => import('./pages/CaptainSignup'));
const UserOtpAuth = lazy(() => import('./pages/UserOtpAuth'));

const CaptainOtpAuth = lazy(() => import('./pages/CaptainOtpAuth'));
const UserHome = lazy(() => import('./pages/UserHome'));
const UserHomeProtectWrapper = lazy(() => import('./components/UserHomeProtectWrapper'));
const UserOtpProtectWrapper = lazy(() => import('./components/UserOtpProtectWrapper'))
const UserRide = lazy(() => import('./pages/UserRide'))
const CaptainHome = lazy(() => import('./pages/CaptainHome'))
const CaptainHomeProtectWrapper = lazy(() => import('./components/CaptainHomeProtectWrapper'))
const CaptainOtpProtectWrapper = lazy(() => import('./components/CaptainOtpProtectWrapper'))
const Ride = lazy(() => import('./pages/Ride'))
function App() {


  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/signup" element={<UserSignup />} />
          <Route path="/captainlogin" element={<CaptainLogin />} />
          <Route path="/captain-signup" element={<CaptainSignup />} />
          <Route path="/otpAuth" element={<UserOtpProtectWrapper>  <UserOtpAuth /></UserOtpProtectWrapper>} />
          <Route path="/otpAuthCaptain" element={<CaptainOtpProtectWrapper><CaptainOtpAuth /></CaptainOtpProtectWrapper>} />
          <Route path="/userhome" element={<UserHomeProtectWrapper> <UserHome /> </UserHomeProtectWrapper>} />
          <Route path="/captainhome" element={<CaptainHomeProtectWrapper><CaptainHome /></CaptainHomeProtectWrapper>} />
          <Route path="/ride" element={<Ride />} />
          <Route path="/userride" element={<UserHomeProtectWrapper> <UserRide /> </UserHomeProtectWrapper>} />

        </Routes>
      </Suspense>
    </div>
  )
}

export default App
