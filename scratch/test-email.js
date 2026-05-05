require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function runTest() {
    console.log("Initializing Test Transmission...");
    
    const bookingDetails = {
        booking_hash: "FBVR-TEST-TRANSMISSION",
        name: "Test Commander",
        email: "commander@fullbodyvr.ca",
        phone: "(555) 999-0000",
        guests: "4",
        date: "2026-05-20",
        start_hour: "18",
        duration: "4",
        address: "123 Simulation Way, Brampton, ON",
        charge: "495.00",
        comments: "This is a verification test for the automated notification system."
    };

    try {
        const { data, error } = await resend.emails.send({
            from: 'Full Body VR <onboarding@resend.dev>',
            to: 'dajohndowiechin@gmail.com',
            subject: `TEST: New Booking [${bookingDetails.booking_hash}]`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e17; color: white; padding: 20px; border: 1px solid #d500ff;">
                    <h1 style="color: #d500ff; border-bottom: 1px solid #d500ff; padding-bottom: 10px;">TEST NOTIFICATION</h1>
                    <p>This is a verification email for your new automated booking system.</p>
                    
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
                        <h2 style="color: #d500ff; font-size: 1.2rem;">Customer Information</h2>
                        <p><strong>Name:</strong> ${bookingDetails.name}</p>
                        <p><strong>Email:</strong> ${bookingDetails.email}</p>
                        <p><strong>Phone:</strong> ${bookingDetails.phone}</p>
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
                        <p><strong>Total Charged:</strong> $${bookingDetails.charge}</p>
                    </div>

                    <p style="font-size: 0.8rem; color: #888; margin-top: 20px;">
                        Verification Code: <b>SYSTEM_GO_PROD</b>
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error('Transmission Failed:', error);
        } else {
            console.log('Transmission Successful! ID:', data.id);
        }
    } catch (err) {
        console.error('System Error:', err);
    }
}

runTest();
