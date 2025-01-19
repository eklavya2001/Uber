






import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, DirectionsRenderer, useLoadScript } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import socket from "../services/socket";
import api from "../services/api";
import RazorpayCheckout from "../components/RazorpayCheckout";

const libraries = ["places"];

const Ride = () => {
    const [details, setDetails] = useState(null);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [time, setTime] = useState(null);
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState("");
    const [orderData, setOrderData] = useState(null);
    const [showRazorpayModal, setShowRazorpayModal] = useState(false);
    const [paymentCompleted, setPaymentCompleted] = useState(false)

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: `${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`, // Replace with your API key
        libraries,
    });

    const isTestMode = true; // Set to false for Live Mode

    const navigate = useNavigate()

    const apiKey = isTestMode ? `${import.meta.env.VITE_RAZORPAY_TEST_API_KEY}` : "rzp_live_YOUR_LIVE_KEY"; // Switch keys based on environment

    useEffect(() => {
        const data = sessionStorage.getItem("data");
        if (data) {
            setDetails(JSON.parse(data));
        }

        socket.on("live-location", (data) => {
            const { latitude, longitude } = data;
            setLatitude(latitude);
            setLongitude(longitude);
        });

        return () => {
            socket.off("live-location");
        };
    }, []);

    useEffect(() => {


        socket.on("cancel-ride-captain", (data) => {
            const { isRideCancelled } = data
            if (isRideCancelled) {
                sessionStorage.removeItem('data')
                navigate('/userride')
            }


        });

        return () => {
            socket.off("cancel-ride-captain");
        };
    }, []);

    const calculateRoute = async () => {
        if (!latitude || !longitude || !details) return;

        const directionsService = new google.maps.DirectionsService();
        const result = await directionsService.route({
            origin: { lat: latitude, lng: longitude },
            destination: details.rideDetails.location.pickupPoint,
            travelMode: google.maps.TravelMode.DRIVING,
        });
        setDirectionsResponse(result);

        const distance = result.routes[0].legs[0].distance.value / 1000;
        setTime(distance * 4);
    };

    useEffect(() => {
        calculateRoute();
    }, [latitude]);

    const handleUnlockRide = async () => {
        const amount = Math.ceil(details.rideDetails.location.fare);
        try {
            const Data = await api.post('/api/order', { amount }, { withCredentials: true });
            console.log(Data);
            setOrderData(Data.data);
            localStorage.setItem('Data', Data.data.id);

            setShowRazorpayModal(true);
        } catch (err) {
            console.error("Error initializing payment:", err);
        }
    };

    const handlePaymentFailure = () => {
        setPaymentStatus("failure");
        setShowRazorpayModal(false);
        alert("Payment Failed. Please try again.");
    };

    const handleCancelRide = () => {
        const isRideCancelled = true
        const { userSocketId } = JSON.parse(sessionStorage.getItem('data'))
        socket.emit('cancel-ride-user', { isRideCancelled, userSocketId })

    }

    if (!isLoaded) return <div>Loading...</div>;

    return (
        <div className="flex flex-col items-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white min-h-screen p-6">
            <header className="w-full bg-transparent text-center py-4 animate__animated animate__fadeIn">
                <h1 className="text-3xl font-extrabold text-teal-400">
                    Your Ride is on its Way! 🚖
                </h1>
                <p className="text-md mt-2 font-light text-gray-300">
                    Estimated time of arrival: <strong className="text-teal-300">{time} minutes</strong>
                </p>
            </header>

            <section className="w-full max-w-md bg-gray-800 shadow-2xl rounded-xl p-6 mt-6 animate__animated animate__fadeIn">
                <h2 className="text-xl font-semibold mb-4 text-center text-teal-400">Driver Details</h2>
                <div className="space-y-2">
                    <p className="text-sm">
                        <span className="font-medium text-gray-400">Name: </span>
                        {details?.payload?.fullname?.firstname} {details?.payload?.fullname?.lastname}
                    </p>
                    <p className="text-sm">
                        <span className="font-medium text-gray-400">Phone: </span>
                        {details?.payload?.phone}
                    </p>
                    <p className="text-sm">
                        <span className="font-medium text-gray-400">Vehicle: </span>
                        {details?.payload?.vehicle?.vehicleName} ({details?.payload?.vehicle?.vehicleType})
                    </p>
                    <p className="text-sm">
                        <span className="font-medium text-gray-400">Plate No: </span>
                        {details?.payload?.vehicle?.plateNo}
                    </p>
                </div>
            </section>

            <section className="w-full max-w-md bg-gray-800 shadow-2xl rounded-xl p-6 mt-6 animate__animated animate__fadeIn">
                <h2 className="text-xl font-semibold mb-4 text-center text-teal-400">Ride Details</h2>
                <div className="space-y-2">
                    <p className="text-sm">
                        <span className="font-medium text-gray-400">Pickup: </span>
                        {details?.rideDetails?.location?.pickupPoint}
                    </p>
                    <p className="text-sm">
                        <span className="font-medium text-gray-400">Destination: </span>
                        {details?.rideDetails?.location.destination}
                    </p>
                    <p className="text-sm">
                        <span className="font-medium text-gray-400">Distance: </span>
                        {details?.rideDetails?.location.distance} km
                    </p>
                    <p className="text-sm">
                        <span className="font-medium text-gray-400">Fare: </span>
                        ₹{details?.rideDetails?.location.fare}
                    </p>
                </div>
            </section>

            <div className="w-full max-w-4xl h-96 bg-gray-700 rounded-lg overflow-hidden mt-6">
                {isLoaded && (
                    <GoogleMap
                        center={{ lat: latitude, lng: longitude }}
                        zoom={13}
                        mapContainerStyle={{ width: "100%", height: "100%" }}
                    >
                        <Marker
                            position={{ lat: latitude, lng: longitude }}
                            icon={{
                                url: "https://cdn-icons-png.flaticon.com/128/3097/3097182.png",
                                scaledSize: new window.google.maps.Size(60, 60),
                            }}
                        />
                        {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
                    </GoogleMap>
                )}
            </div>
            {showRazorpayModal && orderData && (
                <RazorpayCheckout
                    apiKey={apiKey}
                    amount={orderData.amount}
                    currency={orderData.currency}
                    name={"Ride Payment"}
                    description={"Pay for your ride"}
                    order_id={orderData.id}
                    callback={async (response) => {
                        setPaymentStatus("success");

                        console.log(orderData.id)
                        console.log(response)
                        // Notify backend about payment success
                        const res = await api.post('/api/complete', {

                            orderId: orderData.id,
                            paymentId: response.razorpay_payment_id,
                        }, { withCredentials: true })
                        console.log(res)
                        setPaymentCompleted(true)
                        // Show OTP after payment success
                        if (res.status) {
                            console.log('bhai', res)
                            setOtp(details.otp); // OTP received from backend
                            setShowOtp(true);
                            setShowRazorpayModal(false)

                        }
                    }}
                    onFailure={handlePaymentFailure}
                    paymentCompleted={paymentCompleted}
                />
            )}

            {showOtp ? (
                <section className="w-full max-w-md bg-gray-800 shadow-2xl rounded-xl p-6 mt-6 animate__animated animate__fadeIn">
                    <h2 className="text-lg font-semibold mb-4 text-center text-teal-400">Your OTP</h2>
                    <div className="flex justify-center flex-col">
                        <p className="text-white text-3xl font-bold bg-teal-500 rounded-lg px-4 py-2 flex justify-center">{otp}</p>
                        <button className="text-white text-xl font-bold bg-red-500 rounded-lg px-4 py-2 flex justify-center my-2">Cancel Ride</button>
                    </div>
                </section>
            ) : (<div className="flex flex-col">
                <button
                    onClick={handleUnlockRide}
                    className="bg-teal-600 hover:bg-teal-800 text-white py-3 px-6 rounded-full mt-6 transition-all duration-300 transform hover:scale-105"
                >
                    Unlock Ride 🚗
                </button>
                <button
                    onClick={handleCancelRide}
                    className="bg-red-400 hover:bg-teal-800 text-white py-3 px-6 rounded-full mt-6 transition-all duration-300 transform hover:scale-105 font-semibold"
                >
                    Cancel Ride ❌
                </button>

            </div>
            )}
            {paymentStatus === "failure" && (
                <p className="text-red-500 mt-4 text-center">Payment failed. Please try again.</p>
            )}
            <p className="text-white p-1 mt-3 ">Do Not Refresh or Close The Page</p>
        </div>
    );
};

export default Ride;
