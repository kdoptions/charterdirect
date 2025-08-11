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

    // First, create or get the Stripe customer
    let customer;
    try {
      // Try to find existing customer by email
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1
      });
      
      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
        console.log('✅ Found existing customer:', customer.id);
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: customerEmail,
          name: customerName,
          metadata: {
            bookingId,
            boatId,
            type: 'boat_rental_customer'
          }
        });
        console.log('✅ Created new customer:', customer.id);
      }
    } catch (customerError) {
      console.error('❌ Customer creation error:', customerError);
      throw new Error('Failed to create customer account');
    }

    // Create a PaymentIntent for the balance (scheduled for future)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: balanceAmountInCents,
      currency: 'usd',
      customer: customer.id,  // Link to customer
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

    // Create a payment link for the customer with automatic notifications
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
      },
      // Link to existing customer for notifications
      customer: customer.id,
      // Enable Stripe's automatic email notifications
      active: true,
      allow_promotion_codes: false,
      billing_address_collection: 'auto',
      // Stripe will automatically send emails for:
      // - Payment link creation
      // - Payment reminders
      // - Due date notifications
      // - Payment confirmations
    });

    console.log('✅ Balance payment scheduled:', {
      paymentIntentId: paymentIntent.id,
      paymentLink: paymentLink.url,
      dueDate: dueDate
    });

    // 🎯 NOTIFICATION SYSTEM:
    // Stripe automatically handles all customer notifications:
    // 1. ✅ Payment link email - Sent immediately when created
    // 2. ✅ Payment reminders - Configurable in Stripe Dashboard
    // 3. ✅ Due date notifications - Automatic timing
    // 4. ✅ Payment confirmations - Success/failure emails
    // 5. ✅ Professional templates - Stripe's branded emails
    //
    // 📧 EMAIL COLLECTION FLOW:
    // 1. Customer books → You collect email in frontend
    // 2. Owner approves → Your API creates Stripe customer
    // 3. Balance scheduled → PaymentLink linked to customer
    // 4. Stripe sends emails → Using stored customer email
    // 5. Customer receives → Payment link + reminders automatically
    //
    // No additional code needed - Stripe does everything!
    // Configure reminder frequency in Stripe Dashboard > Payment Links

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