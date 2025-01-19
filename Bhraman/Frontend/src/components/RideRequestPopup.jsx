import React, { useState, useEffect } from "react";
import { gsap } from "gsap";

const RideRequestPopup = ({ rideRequest, onAccept, onReject }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10); // 10 seconds countdown
    const animationRef = React.useRef(null);

    useEffect(() => {
        if (rideRequest) {
            setShowPopup(true);

            // Start a countdown for 10 seconds
            const countdownInterval = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime === 0) {
                        clearInterval(countdownInterval);
                        handleReject(); // Automatically reject after 10 seconds
                    }
                    return prevTime - 1;
                });
            }, 1000); // Update every second

            // Border animation (width and color change)
            animationRef.current = gsap.to(".ride-popup-border", {
                scaleX: 0,
                duration: 10,
                ease: "linear",
                backgroundColor: "red", // Change color to red as the time runs out
            });

            // Popup animation
            gsap.fromTo(
                ".ride-popup",
                { y: -50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
            );

            return () => {
                clearInterval(countdownInterval);
                animationRef.current?.kill();
            };
        }
    }, [rideRequest]);

    const handleReject = () => {
        animationRef.current?.kill();
        setShowPopup(false);
        onReject();
    };

    const handleAccept = () => {
        animationRef.current?.kill();
        setShowPopup(false);
        onAccept();
    };

    if (!showPopup || !rideRequest) return null;

    // Dynamically set the border color based on timeLeft
    const borderColor = `rgb(${255 - (timeLeft * 25)}, ${timeLeft * 25}, 0)`; // Green to Red gradient

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="ride-popup bg-white rounded-lg shadow-lg w-96 p-6 relative overflow-hidden">
                {/* Border animation */}
                <div
                    className="ride-popup-border absolute top-0 left-0 h-1"
                    style={{
                        transformOrigin: "left",
                        width: `${(timeLeft / 10) * 100}%`, // Adjust width based on time
                        backgroundColor: borderColor, // Transition color
                    }}
                ></div>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    Ride Request
                </h2>
                <div className="mb-4">
                    <p className="text-gray-700">
                        <strong>Pickup:</strong> {rideRequest.location.pickupPoint}
                    </p>
                    <p className="text-gray-700">
                        <strong>Destination:</strong> {rideRequest.location.destination}
                    </p>
                    <p className="text-gray-700">
                        <strong>Fare:</strong> ₹{rideRequest.fare}
                    </p>
                    <p className="text-gray-700">
                        <strong>Distance:</strong> {rideRequest.distance} km
                    </p>
                </div>
                <div className="flex justify-end space-x-4">
                    <button
                        className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                        onClick={handleReject}
                    >
                        Reject
                    </button>
                    <button
                        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                        onClick={handleAccept}
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RideRequestPopup;
