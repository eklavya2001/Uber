import React from 'react';


const RideInfo = ({ rideRequest, onClose }) => {
    if (!rideRequest) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                <h2 className="text-2xl font-bold mb-4 text-center">Ride Details</h2>
                <div className="space-y-2">
                    <p><strong>Pickup Point:</strong> {rideRequest.location.pickupPoint}</p>
                    <p><strong>Destination:</strong> {rideRequest.location.destination}</p>
                    <p><strong>Fare:</strong> ₹{rideRequest.location.fare}</p>
                    <p><strong>Distance:</strong> {rideRequest.location.distance} km</p>
                </div>
                <div className="flex justify-end mt-6">
                    <button
                        className="bg-red-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-600"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};



export default RideInfo;