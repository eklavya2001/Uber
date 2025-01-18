import React, { useState, useEffect } from "react";

const RazorpayCheckout = ({
    apiKey,
    amount,
    currency,
    name,
    description,
    order_id,
    callback,
    onFailure,

}) => {
    const [loading, setLoading] = useState(false); // To handle loading state
    const [paymentDone, setPaymentDone] = useState(false)
    useEffect(() => {
        if (!window.Razorpay) {
            const script = document.createElement("script");
            script.src = `${import.meta.env.VITE_Razorpay_SCRIPT_URL}`;
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);



    const handleCheckout = () => {
        setLoading(true);


        // Define Razorpay options
        const options = {
            key: apiKey, // Your Razorpay Key (from Razorpay Dashboard)
            amount: amount * 100, // Razorpay accepts amount in paise (1 INR = 100 paise)
            currency: currency,
            name: name,
            description: description,
            order_id: order_id,
            handler: function (response) {
                setLoading(false);

                callback(response); // Call the success callback after successful payment

            },
            prefill: {
                name: "Test User", // You can replace this with user details if available
                email: "test@user.com", // User email (if available)
            },
            notes: {
                address: "Test Address", // You can replace with user address if needed
            },
            theme: {
                color: "#F37254", // Custom color for the Razorpay modal (you can change this)
            },
        };



        try {
            const rzp1 = new window.Razorpay(options); // Create Razorpay instance
            rzp1.open(); // Open the Razorpay modal

        } catch (error) {
            setLoading(false);
            console.error("Error opening Razorpay checkout:", error);
            onFailure(); // Call failure callback if an error occurs
        }
    };

    return (
        <div className="flex justify-center items-center">
            <button
                onClick={handleCheckout}
                disabled={loading}
                className={`${loading ? "bg-gray-500" : "bg-green-500 hover:bg-green-700"
                    } text-white py-2 px-4 rounded mt-4`}
            >
                {loading ? "Processing..." : "Pay Now"}

            </button>
        </div>
    );
};

export default RazorpayCheckout;
