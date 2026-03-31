require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Serve the frontend static files
app.use(express.static(path.join(__dirname, '')));
app.use(express.json());

// Main Secure Checkout Endpoint
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency, bookingDetails } = req.body;

        // Backend Hard Limits: 10 PM Cutoff Validator
        if (bookingDetails.time && bookingDetails.duration) {
            const startHour = parseInt(bookingDetails.time);
            const duration = parseInt(bookingDetails.duration);
            if (startHour + duration > 22) {
                return res.status(400).json({ error: "Booking exceeds strict 10:00 PM cutoff limit. No overnight deployments allowed." });
            }
            if (startHour < 8) {
                return res.status(400).json({ error: "Booking cannot start before 8:00 AM operating hours." });
            }
        }

        // Logging backend data interception. 
        // In a Production Server, this should WRITE to MongoDB or SQL Database.
        console.log("=== NEW BOOKING INTERCEPTED ===");
        console.dir(bookingDetails, { depth: null });

        // Generate the secure Stripe Session Intent Payload matching the $1000 Hold Requirement
        const holdAmount = 1000;
        const totalAuthorization = amount + holdAmount;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAuthorization * 100), // Base Charge + $1000 Hardware Hold
            currency: currency || 'cad',
            capture_method: 'manual', // Enforces pre-authorization without capturing funds
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                guestName: bookingDetails.name,
                guestEmail: bookingDetails.email,
                phone: bookingDetails.phone,
                address: bookingDetails.address,
                locationType: bookingDetails.locationType,
                mode: bookingDetails.mode,
                bookingId: bookingDetails.bookingId,
                clientIp: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                timestamp: new Date().toISOString(),
                signature: bookingDetails.signature,
                baseCharge: amount,
                securityHold: holdAmount
            }
        });

        // Transmit the Client Secret back to the Checkout.html frontend
        res.json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Booting Sequence
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
    console.log(`[FULL BODY VR] Backend Core Online`);
    console.log(`Stripe Terminal running securely on Port ${PORT}`);
});
