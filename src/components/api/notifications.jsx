// Mock email sending function
const SendEmail = async (to, subject, body) => {
  console.log('Mock email sent:', { to, subject, body });
  return { success: true };
};

// Email notification system for booking lifecycle
export class NotificationAPI {
  constructor() {
    this.fromName = 'SydneyCharter';
    this.supportEmail = 'support@sydneycharter.com.au';
  }

  // Send booking request notification to boat owner
  async notifyOwnerBookingRequest(ownerEmail, bookingData) {
    try {
      const { customerName, boatName, startDate, startTime, endTime, guests, totalAmount } = bookingData;
      
      const subject = `New Booking Request - ${boatName}`;
      const body = `
Hello,

You have received a new booking request for your boat "${boatName}".

Booking Details:
• Customer: ${customerName}
• Date: ${startDate}
• Time: ${startTime} - ${endTime}
• Guests: ${guests}
• Total Amount: $${totalAmount}

Please log into your dashboard to review and confirm this booking:
${window.location.origin}/owner-dashboard

You have 24 hours to respond to this request.

Best regards,
SydneyCharter Team
      `;

      await SendEmail({
        to: ownerEmail,
        subject: subject,
        body: body,
        from_name: this.fromName
      });

      return { success: true };
    } catch (error) {
      console.error('Owner notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send booking confirmation to customer
  async notifyCustomerBookingConfirmed(customerEmail, bookingData) {
    try {
      const { customerName, boatName, startDate, startTime, endTime, guests, totalAmount, bookingId } = bookingData;
      
      const subject = `Booking Confirmed - ${boatName}`;
      const body = `
Hi ${customerName},

Great news! Your booking has been confirmed.

Booking Details:
• Boat: ${boatName}
• Date: ${startDate}
• Time: ${startTime} - ${endTime}
• Guests: ${guests}
• Total Amount: $${totalAmount}
• Booking Reference: #${bookingId.slice(-8).toUpperCase()}

You can view your booking details here:
${window.location.origin}/booking-confirmation?id=${bookingId}

We're excited for your Sydney Harbour adventure!

Best regards,
SydneyCharter Team
      `;

      await SendEmail({
        to: customerEmail,
        subject: subject,
        body: body,
        from_name: this.fromName
      });

      return { success: true };
    } catch (error) {
      console.error('Customer confirmation error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send booking cancellation notification
  async notifyBookingCancelled(customerEmail, ownerEmail, bookingData) {
    try {
      const { customerName, boatName, startDate, reason } = bookingData;
      
      // Notify customer
      const customerSubject = `Booking Cancelled - ${boatName}`;
      const customerBody = `
Hi ${customerName},

We regret to inform you that your booking for "${boatName}" on ${startDate} has been cancelled.

${reason ? `Reason: ${reason}` : ''}

Any payments made will be refunded within 5-7 business days.

If you have any questions, please contact us at ${this.supportEmail}.

Best regards,
SydneyCharter Team
      `;

      await SendEmail({
        to: customerEmail,
        subject: customerSubject,
        body: customerBody,
        from_name: this.fromName
      });

      return { success: true };
    } catch (error) {
      console.error('Cancellation notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send payment failure alert to admin
  async notifyPaymentFailure(bookingData, errorDetails) {
    try {
      const { bookingId, customerName, boatName, totalAmount } = bookingData;
      
      const subject = `Payment Failure Alert - Booking #${bookingId.slice(-8)}`;
      const body = `
Payment Failure Alert

A payment has failed for the following booking:

• Booking ID: ${bookingId}
• Customer: ${customerName}
• Boat: ${boatName}
• Amount: $${totalAmount}
• Error: ${errorDetails}

Please investigate and take appropriate action.

Admin Dashboard: ${window.location.origin}/admin
      `;

      await SendEmail({
        to: this.supportEmail,
        subject: subject,
        body: body,
        from_name: this.fromName
      });

      return { success: true };
    } catch (error) {
      console.error('Payment failure notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send booking reminder (24 hours before)
  async notifyBookingReminder(customerEmail, bookingData) {
    try {
      const { customerName, boatName, startDate, startTime, location, ownerContact } = bookingData;
      
      const subject = `Booking Reminder - Tomorrow at ${startTime}`;
      const body = `
Hi ${customerName},

This is a friendly reminder that your boat charter is tomorrow!

Booking Details:
• Boat: ${boatName}
• Date: ${startDate}
• Time: ${startTime}
• Location: ${location}

${ownerContact ? `Contact your boat operator: ${ownerContact}` : ''}

We hope you have an amazing time on Sydney Harbour!

Best regards,
SydneyCharter Team
      `;

      await SendEmail({
        to: customerEmail,
        subject: subject,
        body: body,
        from_name: this.fromName
      });

      return { success: true };
    } catch (error) {
      console.error('Booking reminder error:', error);
      return { success: false, error: error.message };
    }
  }
}

export const notifications = new NotificationAPI();