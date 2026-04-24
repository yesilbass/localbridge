import stripeRoutes from './routes/stripe.js';
import express from 'express';
import Stripe from 'stripe';
app.use('/api/stripe', stripeRoutes);

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
    try {
        const { planName, price } = req.body;

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${planName} Plan`,
                            description: 'Bridge payment simulation',
                        },
                        unit_amount: price * 100,
                    },
                    quantity: 1,
                },
            ],
            success_url: `${process.env.CLIENT_URL}/pricing?payment=success`,
            cancel_url: `${process.env.CLIENT_URL}/pricing?payment=cancelled`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        res.status(500).json({ error: 'Payment simulation failed' });
    }
});
router.post('/create-booking-session', async (req, res) => {
    try {
        const { mentorName, sessionPrice, sessionType } = req.body;

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Session with ${mentorName}`,
                            description: `${sessionType} mentor booking`,
                        },
                        unit_amount: sessionPrice * 100,
                    },
                    quantity: 1,
                },
            ],
            success_url: `${process.env.CLIENT_URL}/mentors?booking=success`,
            cancel_url: `${process.env.CLIENT_URL}/mentors?booking=cancelled`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Booking payment error:', error);
        res.status(500).json({ error: 'Booking payment simulation failed' });
    }
});

export default router;