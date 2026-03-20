// Netlify serverless function — Brevo (Sendinblue) newsletter signup
// Adds contact to waitlist list and sends notification email

exports.handler = async (event) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ success: false, message: 'Method not allowed' }),
        };
    }

    // Parse body
    let body;
    try {
        body = JSON.parse(event.body);
    } catch {
        return {
            statusCode: 400,
            body: JSON.stringify({ success: false, message: 'Invalid request body' }),
        };
    }

    const { email, gdprConsent } = body;

    // Validate GDPR consent
    if (!gdprConsent) {
        return {
            statusCode: 400,
            body: JSON.stringify({ success: false, message: 'GDPR consent is required.' }),
        };
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ success: false, message: 'Please provide a valid email address.' }),
        };
    }

    // Environment variables
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    const BREVO_LIST_ID = parseInt(process.env.BREVO_LIST_ID || '2', 10);
    const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'info@harpagaming.com';
    const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'cronereal@gmail.com';
    const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'HARPA Gaming';

    if (!BREVO_API_KEY) {
        console.error('BREVO_API_KEY is not configured');
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: 'Server configuration error.' }),
        };
    }

    const headers = {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': BREVO_API_KEY,
    };

    try {
        // ─── Step 1: Create or update contact in Brevo ─────────────
        const contactRes = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                email: email.toLowerCase().trim(),
                listIds: [BREVO_LIST_ID],
                updateEnabled: true,
                attributes: {
                    SIGNUP_SOURCE: 'HARPA Gaming Waitlist',
                    GDPR_CONSENT: true,
                    SIGNUP_DATE: new Date().toISOString(),
                },
            }),
        });

        // 201 = created, 204 = updated — both are fine
        if (!contactRes.ok && contactRes.status !== 204) {
            const errorData = await contactRes.json().catch(() => ({}));

            // "Contact already exist" is acceptable (duplicate signup)
            if (errorData.code === 'duplicate_parameter') {
                console.log(`Duplicate contact: ${email} — already on list`);
            } else {
                console.error('Brevo contact error:', JSON.stringify(errorData));
                return {
                    statusCode: 500,
                    body: JSON.stringify({ success: false, message: 'Something went wrong. Try again.' }),
                };
            }
        }

        // ─── Step 2: Send notification email to admin ──────────────
        const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                sender: {
                    name: SENDER_NAME,
                    email: SENDER_EMAIL,
                },
                to: [{ email: NOTIFICATION_EMAIL }],
                subject: 'New waitlist signup',
                textContent: `New waitlist signup: ${email}`,
                htmlContent: `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: #fff; padding: 40px; border: 1px solid #222;">
                        <div style="border-bottom: 2px solid #D1FF19; padding-bottom: 20px; margin-bottom: 30px;">
                            <h1 style="margin: 0; font-size: 18px; letter-spacing: 0.2em; color: #D1FF19;">HARPA GAMING</h1>
                            <p style="margin: 8px 0 0; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.15em;">New Waitlist Signup</p>
                        </div>
                        <p style="font-size: 14px; color: #ccc; line-height: 1.8;">
                            A new user has signed up for the HARPA Gaming waitlist:
                        </p>
                        <p style="font-size: 16px; color: #D1FF19; font-weight: 700; margin: 16px 0;">
                            ${email}
                        </p>
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #222; font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 0.1em;">
                            HARPA Gaming Waitlist Notification
                        </div>
                    </div>
                `,
            }),
        });

        if (!emailRes.ok) {
            // Log but don't fail — the contact was already added
            const emailError = await emailRes.json().catch(() => ({}));
            console.error('Brevo notification email error:', JSON.stringify(emailError));
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true }),
        };

    } catch (error) {
        console.error('Newsletter signup error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: 'Something went wrong. Try again.' }),
        };
    }
};
