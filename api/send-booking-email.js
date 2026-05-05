const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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

    const { bookingDetails } = req.body;

    if (!bookingDetails) {
        return res.status(400).json({ error: 'Missing booking details' });
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Full Body VR <notifications@fullbodyvr.ca>',
            to: 'info@fullbodyvr.ca',
            subject: `New Booking [${bookingDetails.booking_hash}]`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e17; color: white; padding: 20px; border: 1px solid #d500ff;">
                    <h1 style="color: #d500ff; border-bottom: 1px solid #d500ff; padding-bottom: 10px;">New Booking Received</h1>
                    <p>A new booking has been successfully processed.</p>
                    
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
                        <h2 style="color: #d500ff; font-size: 1.2rem;">Customer Information</h2>
                        <p><strong>Name:</strong> ${bookingDetails.name}</p>
                        <p><strong>Email:</strong> ${bookingDetails.email}</p>
                        <p><strong>Phone:</strong> ${bookingDetails.phone}</p>
                        <p><strong>Guests:</strong> ${bookingDetails.guests}</p>
                    </div>

                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-top: 15px;">
                        <h2 style="color: #d500ff; font-size: 1.2rem;">Deployment Logistics</h2>
                        <p><strong>Date:</strong> ${bookingDetails.date}</p>
                        <p><strong>Start Hour:</strong> ${bookingDetails.start_hour}:00</p>
                        <p><strong>Duration:</strong> ${bookingDetails.duration} hours</p>
                        <p><strong>Address:</strong> ${bookingDetails.address}</p>
                    </div>

                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-top: 15px;">
                        <h2 style="color: #d500ff; font-size: 1.2rem;">Financial Details</h2>
                        <p><strong>Reference Hash:</strong> ${bookingDetails.booking_hash}</p>
                        <p><strong>Total Charged:</strong> $${parseFloat(bookingDetails.charge).toFixed(2)}</p>
                    </div>

                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-top: 15px;">
                        <h2 style="color: #d500ff; font-size: 1.2rem;">Special Requests</h2>
                        <p>${bookingDetails.comments || 'None'}</p>
                    </div>

                    <p style="font-size: 0.8rem; color: #888; margin-top: 20px;">
                        This is an automated notification from the Full Body VR Booking System.
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error('Resend Error:', error);
            return res.status(400).json({ error });
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
