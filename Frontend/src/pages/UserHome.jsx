import React, { useState, useCallback, useEffect } from 'react';
import { lazy } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import logo from '../assets/logo3.png';
import taxi from '../assets/taxi-solid.svg';
import bike from '../assets/motorcycle-solid.svg';
import { useLoadScript } from '@react-google-maps/api';
import { getLocation } from '../features/profile/userSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
const UserProfile = lazy(() => import('../components/UserProfile'))
const libraries = ['places']

function UserHome() {
    const [pickUpLocation, setPickUpLocation] = useState('');
    const [dropLocation, setDropLocation] = useState('');
    // const [vehicle, setVehicle] = useState('');
    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [dropSuggestions, setDropSuggestions] = useState([]);
    const [autocompleteService, setAutocompleteService] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('user'))

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: `${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`, // Replace with your API key
        libraries,
    });

    // Initialize Google Maps Places Autocomplete service once the script is loaded
    useEffect(() => {
        if (window.google && window.google.maps) {
            const service = new window.google.maps.places.AutocompleteService();
            setAutocompleteService(service);
        }
    }, []);

    // Fetch suggestions using Google Places API
    const fetchSuggestions = async (input, setSuggestions) => {
        if (!input || !autocompleteService) {
            setSuggestions([]);
            return;
        }

        const request = {
            input: input,
            types: ['geocode'], // Multiple types to get all kinds of suggestions
        };

        autocompleteService.getPlacePredictions(request, (predictions, status) => {
            console.log('API Status:', status); // Debugging line to see what status is returned
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                setSuggestions(predictions);
            } else {
                setSuggestions([]);
                console.error('Error fetching suggestions:', status); // Error logging
            }
        });
    };
    const debouncedFetchSuggestions = useCallback(
        debounce((input, setSuggestions) => {
            fetchSuggestions(input, setSuggestions);
        }, 1000), [autocompleteService]
    );

    const handlePickupChange = (e) => {
        const input = e.target.value;
        setPickUpLocation(input);
        debouncedFetchSuggestions(input, setPickupSuggestions);
    };

    const handleDropChange = (e) => {
        const input = e.target.value;
        setDropLocation(input);
        debouncedFetchSuggestions(input, setDropSuggestions);
    };

    const handleSuggestionClick = (suggestion, setLocation, setSuggestions) => {
        setLocation(suggestion.description);
        setSuggestions([]);
    };

    const handleLogOut = () => {
        localStorage.removeItem('user')
        localStorage.removeItem('isAuth')
        navigate('/login')
    }
    const handleUseLocation = (setLocation) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;

                    // Create a new geocoder using Google Maps API
                    const geocoder = new window.google.maps.Geocoder();

                    geocoder.geocode(
                        { location: { lat: latitude, lng: longitude } },
                        (results, status) => {
                            if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
                                setLocation(results[0].formatted_address);
                            } else {
                                alert("Unable to retrieve location details.");
                            }
                        }
                    );
                },

                (error) => {
                    console.error('Error getting location:', error);
                    alert('Unable to retrieve your location.');
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    };
    const handleProfileClick = () => {
        setIsProfileOpen(true)
    }
    const handleCloseProfile = () => {
        setIsProfileOpen(false)
    }



    const handleSubmit = async (e) => {
        e.preventDefault()

        const geocoder = new window.google.maps.Geocoder();

        geocoder.geocode({ address: pickUpLocation }, async (results, status) => {
            if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
                const { lat, lng } = results[0].geometry.location;
                const payload = {
                    location: {
                        latitude: lat(),
                        longitude: lng(),
                        address: {
                            userLocation: pickUpLocation,
                            destination: dropLocation
                        }
                    }
                }

                dispatch(getLocation(payload))
                localStorage.setItem('location', JSON.stringify(payload))

                navigate('/userride')

            } else {
                alert("Geocoding failed: " + status);
            }
        })
    }


    return (
        <div className='min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center p-5'>
            <div className="w-full max-w-lg  bg-gradient-to-r from-blue-100 via-violet-100 to-green-100 rounded-2xl shadow-xl p-2 space-y-10 h-screen custom:h-auto">
                <div className="flex  justify-between items-center px-4">
                    {/* Left Button */}
                    <button onClick={handleProfileClick} className="flex justify-center flex-col items-center sm:w-14 sm:h-14 w-12 h-12 hover:bg-gray-200 rounded-full text-sm font-semibold ">
                        <img
                            src="https://cdn-icons-png.freepik.com/256/16854/16854440.png?ga=GA1.1.274021499.1736281266&semt=ais_hybrid"
                            alt=""
                            className="sm:h-12 sm:w-12 h-10 w-10 object-contain"
                        />Profile
                    </button>

                    {/* Logo */}
                    <img
                        src={logo}
                        alt="Logo"
                        className="sm:h-36 h-28 object-contain mx-4"
                    />

                    {/* Right Button */}
                    <button onClick={handleLogOut} className="flex  justify-center flex-col items-center sm:w-18 sm:h-8 w-10 h-10 hover:bg-gray-200 rounded-full text-sm font-semibold">
                        <img
                            src="https://cdn-icons-png.freepik.com/256/14441/14441860.png?ga=GA1.1.274021499.1736281266&semt=ais_hybrid"
                            alt=""
                            className="sm:h-12 sm:w-12 h-10 w-10 object-contain"
                        />Logout
                    </button>
                </div>
                {isProfileOpen && <UserProfile onClose={handleCloseProfile} />}

                <h2 className='flex justify-center text-gray-700 text-xl font-semibold'> Welcome back,  {user.fullname.firstname} </h2>

                <form className='space-y-4' onSubmit={handleSubmit}>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Pick Up location"
                            value={pickUpLocation}
                            onChange={handlePickupChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-gray-700"
                        />
                        {pickUpLocation === '' && (
                            <button
                                type="button"
                                onClick={() => handleUseLocation(setPickUpLocation)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-600"
                            >
                                Use Your Location
                            </button>
                        )}
                        {pickupSuggestions.length > 0 && (
                            <ul className="absolute z-10 bg-white bg-opacity-90 border border-gray-200 w-full mt-1 rounded-lg shadow-lg">
                                {pickupSuggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => handleSuggestionClick(suggestion, setPickUpLocation, setPickupSuggestions)}
                                    >
                                        {suggestion.description}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Drop Off location"
                            value={dropLocation}
                            onChange={handleDropChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-gray-700"
                        />
                        {dropLocation === '' && (
                            <button
                                type="button"
                                onClick={() => handleUseLocation(setDropLocation)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-600"
                            >
                                Use Your Location
                            </button>)}
                        {dropSuggestions.length > 0 && (
                            <ul className="absolute z-10 bg-white bg-opacity-90 border border-gray-200 w-full mt-1 rounded-lg shadow-lg">
                                {dropSuggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => handleSuggestionClick(suggestion, setDropLocation, setDropSuggestions)}
                                    >
                                        {suggestion.description}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* <div className="flex justify-center gap-6">
                        <div
                            className={`p-4 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${vehicle === 'cab'
                                ? 'bg-blue-50 border-2 border-blue-500 shadow-md'
                                : 'border-2 border-gray-200 hover:border-blue-300'
                                }`}
                            onClick={() => setVehicle('cab')}
                        >
                            <img src={taxi} alt="Cab" className="w-16 h-16" />
                            <p className="text-center mt-2 font-medium text-gray-700">Cab</p>
                        </div>

                        <div
                            className={`p-4 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${vehicle === 'motorcycle'
                                ? 'bg-blue-50 border-2 border-blue-500 shadow-md'
                                : 'border-2 border-gray-200 hover:border-blue-300'
                                }`}
                            onClick={() => setVehicle('motorcycle')}
                        >
                            <img src={bike} alt="Motorcycle" className="w-16 h-16" />
                            <p className="text-center mt-2 font-medium text-gray-700">Motorcycle</p>
                        </div>
                    </div> */}

                    <button
                        type='submit'
                        className='w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md'
                    >
                        Select Vehicle
                    </button>
                </form>
                <div className="bg-blue-50 text-gray-700 p-4 rounded-lg mt-4 text-center shadow-sm">
                    <h2 className="text-lg font-semibold mb-2">Limited Service Availability</h2>
                    <p className="text-sm">
                        Currently, our services are operational in specific locations only. We are actively expanding to serve more areas soon.
                        Please note, due to limited vehicle availability during peak hours, finding a ride might take longer than usual. We appreciate your patience and understanding.
                    </p>
                </div>

            </div>
        </div>
    );
}

export default UserHome;

//AIzaSyBIMu30aXjtViiw4UhAzGe5uFORgW8NSew