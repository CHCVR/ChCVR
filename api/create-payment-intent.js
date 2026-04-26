const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    // Enable CORS for localhost testing and vercel domains
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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

        console.log("=== NEW BOOKING INTERCEPTED (SERVERLESS) ===");
        console.dir(bookingDetails, { depth: null });

        const holdAmount = 1000;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), 
            currency: currency || 'cad',
            setup_future_usage: 'off_session', 
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

        res.status(200).json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        res.status(500).json({ error: error.message });
    }
};
