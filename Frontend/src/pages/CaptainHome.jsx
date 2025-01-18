import React, { lazy, useEffect, useState, useRef } from 'react'
import { GoogleMap, Marker, DirectionsRenderer, useLoadScript } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import socket from '../services/socket';
import RideInfo from '../components/RideInfo';
import CaptainProfile from '../components/CaptainProfile';
import RideRequestPopup from '../components/RideRequestPopup';
const library = ['places']



// const CaptainProfile = lazy(() => import('../components/CaptainProfile'))
// const RideRequestPopup = lazy(() => import('../components/RideRequestPopup'))
// const RideInfo = lazy(() => import("../components/RideInfo"))
function CaptainHome() {
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [captainOnline, setCaptainOnline] = useState(false)
    const [latitude, setLatitude] = useState('')
    const [longitude, setLongitude] = useState('')
    const [directions, setDirections] = useState('')
    const [map, setMap] = useState(null)
    const navigate = useNavigate()
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const [rideRequest, setRideRequest] = useState(null);

    const [isAvailable, setIsAvailable] = useState(true)
    const [rideDetails, setRideDetails] = useState(null)
    const [showRideDetails, setShowRideDetails] = useState(false)
    const [otp, setOtp] = useState('')
    const [time, setTime] = useState('')





    useEffect(() => {
        if (isAvailable) {
            socket.on("ride-request", (data) => {
                setRideRequest({
                    location: {
                        pickupPoint: data.location.pickupPoint,
                        destination: data.location.destination,
                    },
                    fare: data.location.fare,
                    distance: data.location.distance
                });
                setRideDetails({
                    location: {
                        pickupPoint: data.location.pickupPoint,
                        destination: data.location.destination,
                        fare: data.location.fare,
                        distance: data.location.distance,
                        userSocketId: data.userSocketId

                    },

                })
            });
        }

        return () => socket.off("ride-request");
    });

    useEffect(() => {
        if (!isAvailable) {
            console.log(socket.id)
            console.log('ka ho solve hua')
            socket.on('cancel-ride-user', (data) => {

                console.log(data)
                const { isRideCancelled } = data
                if (isRideCancelled) {
                    setDirections('')
                    setOtp('')
                }

            })
        }


        return () => socket.off("cancel-ride-user");
    });

    const calculateRoute = async () => {


        const directionsService = new google.maps.DirectionsService();
        const result = await directionsService.route({
            origin: { lat: latitude, lng: longitude },
            destination: rideRequest.location.pickupPoint,
            travelMode: google.maps.TravelMode.DRIVING,
        });
        setDirections(result);

        const distance = result.routes[0].legs[0].distance.value / 1000;
        setTime(distance * 4);

        // setRideDetails({ distance, carFare, bikeFare });
    };

    const handleAccept = () => {
        // Emit an accept event with captain's ID
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setOtp(otp)

        const payload = JSON.parse(sessionStorage.getItem('captain'))

        const userSocketId = rideDetails.location.userSocketId
        console.log(userSocketId)

        // socket.emit("ride-accepted", { rideDetails, payload });
        // alert("Ride accepted!");
        calculateRoute()
        socket.emit("ride-accepted", { rideDetails, payload, otp, userSocketId, time });
        setIsAvailable(false)
        setRideRequest(null);

    };

    const handleReject = () => {
        // Emit a reject event with captain's ID
        socket.emit("ride-rejected", { captainId: "your-captain-id" });
        alert("Ride rejected!");
        setRideRequest(null);
    };

    const handleCancelRide = () => {
        setDirections('')
        setOtp('')
        const userSocketId = rideDetails.location.userSocketId
        socket.emit('cancel-ride-captain', { userSocketId })
        setRideRequest(null);
        setIsAvailable(true)
    }



    window.onbeforeunload = function () {
        return "Are you sure you want to leave this page?";
    };

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: `${import.meta.env.GOOGLE_MAPS_API_KEY}`, // Replace with your API key
        library
    });//react lifecycle padho

    const captain = JSON.parse(sessionStorage.getItem('captain'))

    useEffect(() => {
        let watchId;

        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLatitude(latitude);
                    setLongitude(longitude);
                    console.log(`Updated Location: ${latitude}, ${longitude}`);
                    socket.emit('live-location', { latitude, longitude, userSocketId: rideDetails.location.userSocketId })
                },
                (error) => console.error("Error watching position: ", error),
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,           // Do not use cached positions
                    timeout: Infinity,       // Wait as long as needed for updates
                }
            );
        }



        // Cleanup: Stop watching location when component unmounts
        return () => {
            if (navigator.geolocation && watchId) {
                navigator.geolocation.clearWatch(watchId);
                console.log("Location tracking stopped.");
            }
        };
    },); // Empty dependency array -> run only once
    //-------------------------------------------------


    const handleCaptainOnline = async () => {
        setCaptainOnline((prev) => !prev)
        const captain = JSON.parse(sessionStorage.getItem('captain'))
        const payload = {
            _id: localStorage.getItem('_id'),
            latitude: latitude,
            longitude: longitude
        };
        const response = await api.post('/captain/updatelocation', { payload }); // Remove `{ payload }` extra object wrapping
        console.log('Location updated successfully:', response.data);
        socket.emit('captain-online', {
            captainId: captain._id,
            location: { latitude: latitude, longitude: longitude },
            vehicleType: captain.vehicle.vehicleType
        })
    }


    const handleCaptainOffline = async () => {
        setCaptainOnline((prev) => !prev)
        const payload = {
            _id: localStorage.getItem('_id'),
        }
        const response = await api.post('/captain/deletelocation', payload)
        socket.emit('captain-offline')



    }

    const handleOpenProfile = () => {
        setIsProfileOpen(true)
    }
    const handleCloseProfile = () => {
        setIsProfileOpen(false)
    }
    const handleCloseRide = () => {
        setShowRideDetails(false)
    }
    const handleRideDetails = () => {
        setShowRideDetails(true)

    }
    const handleRefresh = () => {
        setLatitude('')
        setLongitude('')
    }

    const handleLogout = () => {
        localStorage.removeItem('isAuth')
        localStorage.removeItem('_id')
        sessionStorage.removeItem('captain')
        navigate('/captainlogin')
    }











    return (
        <div className='min-h-screen bg-black flex flex-col items-center justify-center p-1 '>

            <div className="bg-gray-700 shadow-md rounded-lg  border-2 border-white custom:p-6 p-2 h-full w-full max-w-3xl custom:h-auto">
                <div className='bg-gray-300 flex  border-2 border-white justify-between p-1 rounded-xl '>
                    <button className='bg-blue-600  border-2 border-white text-white font-semibold p-2 m-1 rounded-xl' onClick={handleOpenProfile} >Profile</button>
                    <h2 className='flex justify-center items-center text-lg font-semibold '> Welcome, {captain.fullname.firstname} </h2>
                    <button className='bg-red-600 text-white  border-2 border-white font-semibold p-2 rounded-xl m-1' onClick={handleLogout}> logout</button>
                </div>
                {isProfileOpen && <CaptainProfile onClose={handleCloseProfile} />}
                {showRideDetails && <RideInfo rideRequest={rideDetails} onClose={handleCloseRide} />}
                <RideRequestPopup rideRequest={rideRequest} onAccept={handleAccept} onReject={handleReject} />
                {isLoaded && <div className="my-3  border-2 border-white">

                    <GoogleMap
                        center={{ lat: latitude, lng: longitude }}

                        zoom={14}
                        mapContainerStyle={{ width: '100%', height: '600px' }}
                        onLoad={(mapInstance) => {
                            mapRef.current = mapInstance;
                            setMap(mapInstance); // Persist map instance in state if needed elsewhere
                        }}
                    >

                        {isLoaded && <Marker

                            position={{ lat: latitude, lng: longitude }}
                            icon={{
                                url: 'https://cdn-icons-png.flaticon.com/128/3097/3097182.png',

                                scaledSize: new window.google.maps.Size(60, 60),
                            }}
                            onLoad={(markerInstance) => {
                                markerRef.current = markerInstance;
                            }}
                        />}
                        {latitude && <DirectionsRenderer directions={directions} />}

                    </GoogleMap>
                </div>}
                <div className="flex justify-center items-center flex-col">
                    {otp ? <div className='bg-gradient-to-r from-blue-300 to-orange-200 text-black rounded-xl flex justify-center items-center w-1/2 h-12 font-semibold' >Status : busy otp:  {otp} </div> : ''}
                    <button onClick={handleRefresh} className='flex flex-end bg-blue-600 text-white font-semibold p-2 m-2 rounded-xl w-full justify-center border-2 border-white '>Refresh</button>
                    {!captainOnline ? (
                        // Captain is offline
                        <button
                            className="w-full bg-green-600 text-white rounded-2xl font-semibold  border-2 border-white text-lg m-2 p-2"
                            onClick={handleCaptainOnline}
                        >
                            Go Live
                        </button>
                    ) : !isAvailable ? (
                        // Captain is online but not available (handling a ride)
                        <button
                            className="w-full bg-orange-500 text-white  border-2 border-white rounded-2xl font-semibold text-lg m-2 p-2"
                            onClick={handleCancelRide}
                        >
                            Cancel Ride
                        </button>
                    ) : (
                        // Captain is online and available
                        <button
                            className="w-full bg-red-600 text-white  border-2 border-white rounded-2xl font-semibold text-lg m-2 p-2"
                            onClick={handleCaptainOffline}
                        >
                            Go Offline
                        </button>
                    )}

                    {/* Ride History Button */}

                    {isAvailable ? <button className="w-full bg-gradient-to-r from-gray-400 via-blue-300 to-white  border-2 border-white text-white rounded-2xl font-semibold text-lg m-1 p-2">
                        Ride History
                    </button> : <button onClick={handleRideDetails} className="w-full bg-blue-400  border-2 border-white text-white rounded-2xl font-semibold text-lg m-2 p-2">
                        Ride Details
                    </button>}

                </div>

            </div>

        </div>
    )
}

export default CaptainHome


