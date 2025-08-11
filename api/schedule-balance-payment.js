import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      bookingId, 
      boatId, 
      customerEmail, 
      customerName, 
      balanceAmount, 
      dueDate, 
      connectedAccountId 
    } = req.body;

    // Validate required fields
    if (!bookingId || !boatId || !customerEmail || !balanceAmount || !dueDate || !connectedAccountId) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    console.log('📅 Scheduling balance payment:', {
      bookingId,
      boatId,
      customerEmail,
      balanceAmount,
      dueDate,
      connectedAccountId
    });

    // Calculate the balance amount in cents
    const balanceAmountInCents = Math.round(balanceAmount * 100);

    // Create a PaymentIntent for the balance (scheduled for future)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: balanceAmountInCents,
      currency: 'usd',
      transfer_data: {
        destination: connectedAccountId,
      },
      metadata: {
        bookingId,
        boatId,
        customerEmail,
        customerName,
        type: 'balance_payment',
        dueDate
      },
      receipt_email: customerEmail,
      description: `Balance payment for boat booking`,
      statement_descriptor: 'HARBOUR LUX',
      statement_descriptor_suffix: 'BALANCE'
    });

    // Create a payment link for the customer
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Boat Booking Balance Payment',
            description: `Balance payment for your upcoming boat booking`,
          },
          unit_amount: balanceAmountInCents,
        },
        quantity: 1,
      }],
      after_completion: { type: 'redirect', redirect: { url: `${process.env.APP_URL}/payment-success?booking_id=${bookingId}` }},
      metadata: {
        bookingId,
        boatId,
        customerEmail,
        type: 'balance_payment'
      }
    });

    // Schedule the payment reminder (you could use a cron job or Stripe's webhooks)
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - 1); // Send reminder 1 day before due

    console.log('✅ Balance payment scheduled:', {
      paymentIntentId: paymentIntent.id,
      paymentLink: paymentLink.url,
      reminderDate: reminderDate.toISOString(),
      dueDate: dueDate
    });

    // In production, you would:
    // 1. Store the payment intent ID in your database
    // 2. Set up a cron job to send payment reminders
    // 3. Use Stripe webhooks to track payment status
    // 4. Send automated emails with payment links

    return res.status(200).json({
      success: true,
      paymentIntentId: paymentIntent.id,
      paymentLink: paymentLink.url,
      balanceAmount: balanceAmountInCents,
      dueDate: dueDate,
      message: 'Balance payment scheduled successfully'
    });

  } catch (error) {
    console.error('❌ Error scheduling balance payment:', error);
    
    return res.status(500).json({ 
      error: 'Failed to schedule balance payment',
      details: error.message 
    });
  }
} 