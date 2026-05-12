const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
    // Enable CORS
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

    const { email, lang } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // 1. Check if user already exists
        const { data: existingUser, error: checkError } = await supabase
            .from('subscribers')
            .select('email')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(200).json({ 
                success: true, 
                message: lang === 'fr' ? 'Vous êtes déjà inscrit à notre newsletter !' : 'You are already subscribed to our newsletter!' 
            });
        }

        // 2. Add to Supabase
        const { error: insertError } = await supabase
            .from('subscribers')
            .insert([{ email }]);

        if (insertError) throw insertError;

        // 3. Send Welcome Email via Resend
        const welcomeSubject = lang === 'fr' ? 'Bienvenue dans le Futur | Full Body VR' : 'Welcome to the Future | Full Body VR';
        
        // EDIT YOUR WELCOME MESSAGE BELOW
        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e17; color: white; padding: 40px; border: 1px solid #d500ff; border-radius: 12px;">
                <h1 style="color: #d500ff; text-align: center; font-size: 2rem;">CONNECTION ESTABLISHED</h1>
                <p style="font-size: 1.1rem; line-height: 1.6; color: #b899cf;">
                    ${lang === 'fr' 
                        ? "Merci de vous être inscrit à la newsletter Full Body VR. Vous faites maintenant partie de l'élite prête pour le déploiement." 
                        : "Thank you for enlisting in the Full Body VR newsletter. You are now part of the elite ready for deployment."}
                </p>
                <div style="background: rgba(213,0,255,0.1); padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #d500ff;">
                    <p style="margin: 0; color: white;"><strong>Upcoming Updates:</strong></p>
                    <ul style="color: #b899cf; padding-left: 20px;">
                        <li>Exclusive access to new hardware loadouts</li>
                        <li>Early bird promotion alerts</li>
                        <li>Behind-the-scenes look at our Canadian deployment zones</li>
                    </ul>
                </div>
                <p style="text-align: center; margin-top: 40px;">
                    <a href="https://www.fullbodyvr.ca" style="background: #d500ff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">VISIT COMMAND CENTER</a>
                </p>
                <p style="font-size: 0.8rem; color: #444; margin-top: 40px; text-align: center;">
                    &copy; 2026 FULL BODY VR. All rights reserved.
                </p>
            </div>
        `;

        const { data, error } = await resend.emails.send({
            from: 'Full Body VR <updates@fullbodyvr.ca>',
            to: email,
            subject: welcomeSubject,
            html: emailHtml
        });

        if (error) {
            console.error('Resend Error:', error);
            // If it's a domain verification issue, provide a hint
            if (error.message && error.message.includes('not verified')) {
                 return res.status(400).json({ 
                    success: false, 
                    error: 'Domain not verified. Please verify fullbodyvr.ca in Resend or use onboarding@resend.dev' 
                });
            }
            throw error;
        }

        res.status(200).json({ 
            success: true, 
            message: lang === 'fr' ? 'Inscription réussie ! Vérifiez votre boîte de réception.' : 'Subscription successful! Check your inbox.' 
        });

    } catch (err) {
        console.error('Newsletter Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
