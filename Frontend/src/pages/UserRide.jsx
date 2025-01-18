


import React, { useEffect, useState, } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, useLoadScript } from '@react-google-maps/api';
import { useSelector } from 'react-redux';
import api from '../services/api';
import socket from '../services/socket';
const libraries = ['places']
import { useNavigate } from 'react-router-dom';
function UserRide() {
    const { location } = useSelector((state) => state.user);
    const [map, setMap] = useState(null);
    const [directions, setDirections] = useState(null);
    const [from, setFrom] = useState(() => localStorage.getItem('from') || location.address.userLocation);
    const [to, setTo] = useState(() => localStorage.getItem('to') || location.address.destination);
    const [nearbyDrivers, setNearbyDrivers] = useState(() => JSON.parse(localStorage.getItem('nearbyDrivers')) || []);
    const [rideDetails, setRideDetails] = useState(() => JSON.parse(localStorage.getItem('rideDetails')) || null);
    const [latitude, setLatitude] = useState(location.latitude);
    const [longitude, setLongitude] = useState(location.longitude);
    const [loading, setLoading] = useState(false);
    const [vehicle, setVehicle] = useState('');
    const [timeUp, setTimeUp] = useState(false)
    const [isSearching, setIsSearching] = useState(false)

    // const [riderFound, setRiderFound] = useState(false)
    const navigate = useNavigate()
    window.onbeforeunload = function () {
        return "Are you sure you want to leave this page?";
    };


    const { isLoaded } = useLoadScript({
        googleMapsApiKey: `${import.meta.env.GOOGLE_MAPS_API_KEY}`, // Replace with your API key
        libraries,
    });
    useEffect(() => {
        if (window.google && window.google.maps) {
            console.log('Google Maps script loaded.');
        } else {
            console.error('Google Maps script not loaded.');
        }
    }, [isLoaded]); // Re-run when isLoaded changes




    useEffect(() => {
        localStorage.setItem('from', from);
        localStorage.setItem('to', to);
        localStorage.setItem('nearbyDrivers', JSON.stringify(nearbyDrivers));
        localStorage.setItem('rideDetails', JSON.stringify(rideDetails));
    }, [from, to, nearbyDrivers, rideDetails]);



    useEffect(() => {
        try {


            calculateRoute()
        } catch (error) {
            console.error("error", error)

        }

    }

        , [])


    const calculateRoute = async () => {
        if (!from || !to) return;

        const directionsService = new google.maps.DirectionsService();
        const result = await directionsService.route({
            origin: from,
            destination: to,
            travelMode: google.maps.TravelMode.DRIVING,
        });
        setDirections(result);

        const distance = result.routes[0].legs[0].distance.value / 1000;
        const carFare = distance * 17;
        const bikeFare = distance * 9;
        setRideDetails({ distance, carFare, bikeFare });
    };

    const updateRide = async (e) => {
        e.preventDefault();
        setLoading(true); // Start spinner




        await calculateRoute();
        setLoading(false); // Stop spinner
    };

    const handleCabSelection = async (e) => {
        e.preventDefault();
        setIsSearching(true)
        setTimeUp(false)
        setTimeout(() => {
            setIsSearching(false)
            setTimeUp(true)
        }, 10000);
        setVehicle('car');
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: from }, async (results, status) => {
            if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
                const { lat, lng } = results[0].geometry.location;
                setLatitude(lat());
                setLongitude(lng());
                const payload = {
                    location: {
                        latitude: lat(),
                        longitude: lng(),
                    },
                    vehicle: vehicle
                };


                const response = await api.post(`/user/updatelocation`, payload, { withCredentials: true });
                if (response.status === 200) {
                    socket.emit("ride-request", {
                        location: {
                            latitude: latitude,
                            longitude: longitude,
                            vehicle: "car",
                            pickupPoint: from,
                            destination: to,
                            fare: rideDetails.carFare,
                            distance: rideDetails.distance

                        },
                        user: JSON.parse(localStorage.getItem('user'))
                    })
                    setNearbyDrivers(response.data.nearbyDrivers);
                    // alert(`Found ${response.data.nearbyDrivers.length} drivers nearby!`)
                    // socket.off('ride-request')
                }
            } else {
                alert('Geocoding failed: ' + status);
            }
        });

    }

    const handleBikeSelection = async (e) => {
        e.preventDefault();
        setIsSearching(true)
        setTimeUp(false)
        setTimeout(() => {
            setIsSearching(false)
            setTimeUp(true)
        }, 10000);
        setVehicle('motorcycle');
        setTimeUp(false)
        setIsSearching(true)
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: from }, async (results, status) => {
            if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
                const { lat, lng } = results[0].geometry.location;
                setLatitude(lat());
                setLongitude(lng());
                const payload = {
                    location: {
                        latitude: lat(),
                        longitude: lng(),
                    },
                    vehicle: vehicle
                };


                const response = await api.post(`/user/updatelocation`, payload, { withCredentials: true });
                if (response.status === 200) {
                    socket.emit("ride-request", {
                        location: {
                            latitude: latitude,
                            longitude: longitude,
                            vehicle: "motorcycle",
                            pickupPoint: from,
                            destination: to,
                            fare: rideDetails.carFare,
                            distance: rideDetails.distance

                        },
                        user: JSON.parse(localStorage.getItem('user'))
                    })
                    setNearbyDrivers(response.data.nearbyDrivers);
                    // socket.off('ride-request')
                    // alert(`Found ${response.data.nearbyDrivers.length} drivers nearby!`)
                }
            } else {
                alert('Geocoding failed: ' + status);
            }
        });
    }

    useEffect(() => {
        const rideAcceptedHandler = (data) => {
            // console.log("Ride accepted data:", data);
            const details = JSON.stringify(data)
            sessionStorage.setItem('data', details)
            setIsSearching(false)
            navigate("/ride");
        };



        socket.on("ride-accepted", rideAcceptedHandler);
        // socket.on('ride-rejected',rideRejectHandler)

        return () => {
            socket.off("ride-accepted", rideAcceptedHandler);
            // socket.off('ride-rejected',rideRejectHandler)
        };
    }, []);


    // if (!isLoaded) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 flex flex-col items-center py-6">
            <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-3xl transform hover:scale-105 transition-transform duration-300 ease-out">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center tracking-wide">
                    🚖 Plan Your Ride
                </h1>
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                    <input
                        className="border border-gray-300 rounded-xl px-6 py-3 w-full focus:outline-none focus:ring-4 focus:ring-blue-400 shadow-sm transition duration-200 ease-in-out"
                        placeholder="From"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                    />
                    <input
                        className="border border-gray-300 rounded-xl px-6 py-3 w-full focus:outline-none focus:ring-4 focus:ring-green-400 shadow-sm transition duration-200 ease-in-out"
                        placeholder="To"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                    />
                </div>
                <button
                    onClick={updateRide}
                    className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold rounded-full px-8 py-3 shadow-lg hover:shadow-2xl transform hover:scale-110 transition duration-300 ease-out"
                >
                    Update Ride 🚀
                </button>

                {/* Spinner */}
                {loading && (
                    <div className="flex justify-center items-center my-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
                        <p className="ml-4 text-lg font-semibold text-gray-700">
                            Searching for drivers...
                        </p>
                    </div>
                )}

                {/* Map and Drivers */}
                {!loading && isLoaded && (
                    <div className="my-8 shadow-lg rounded-xl overflow-hidden">
                        <GoogleMap
                            center={{ lat: latitude, lng: longitude }}
                            zoom={14}
                            mapContainerStyle={{ width: '100%', height: '400px' }}
                            onLoad={(mapInstance) => setMap(mapInstance)}
                        >
                            {isLoaded &&
                                nearbyDrivers.map((driver, index) => (
                                    <Marker
                                        key={index}
                                        position={{
                                            lat: driver.location.coordinates[1],
                                            lng: driver.location.coordinates[0],
                                        }}
                                        icon={{
                                            url:
                                                driver.vehicle.vehicleType === 'car'
                                                    ? 'https://cdn-icons-png.flaticon.com/128/3097/3097182.png'
                                                    : 'https://cdn-icons-png.flaticon.com/128/3149/3149029.png',
                                            scaledSize: new window.google.maps.Size(40, 40),
                                        }}
                                    />
                                ))}
                            {directions && isLoaded && <DirectionsRenderer directions={directions} />}
                        </GoogleMap>
                    </div>
                )}

                {/* Ride Details */}
                {rideDetails && (
                    <div
                        className="mt-6 p-4 bg-gradient-to-r from-green-50 to-white border border-gray-300 shadow-md rounded-lg hover:scale-105 transition-transform duration-300"
                        onClick={handleCabSelection}
                    >
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Bhraman GO</h2>
                        <video
                            src="https://cdn-icons-mp4.freepik.com/128/17357/17357400.mp4?ga=GA1.1.274021499.1736281266&semt=ais_hybrid"
                            autoPlay
                            loop
                            muted
                            className="rounded-lg w-full h-32 mb-2 "
                        ></video>
                        <div className="text-sm text-gray-700">
                            <p>Distance: {rideDetails.distance} km</p>
                            <p>Fare: ₹{rideDetails.carFare}</p>
                        </div>
                    </div>
                )}

                {rideDetails && (
                    <div
                        className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-white border border-gray-300 shadow-md rounded-lg hover:scale-105 transition-transform duration-300"
                        onClick={handleBikeSelection}
                    >
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Bhraman Moto</h2>
                        <video
                            src="https://cdn-icons-mp4.freepik.com/128/14951/14951503.mp4?ga=GA1.1.274021499.1736281266&semt=ais_hybrid"
                            autoPlay
                            loop
                            muted
                            className="rounded-lg w-full h-32 mb-2 "
                        ></video>
                        <div className="text-sm text-gray-700">
                            <p>Distance: {rideDetails.distance} km</p>
                            <p>Fare: ₹{rideDetails.bikeFare}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>


    )
}

export default UserRide;
