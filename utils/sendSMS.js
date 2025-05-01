// utils/sendSMS.js
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = (medicine, reminderTime) => {
  const message = `Reminder: It's time to take your medicine "${medicine.name}" (${medicine.dosage}) at ${reminderTime}.`;

  client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: 'USER_PHONE_NUMBER', // You can fetch user's phone number here
  })
    .then(message => console.log('Reminder SMS sent:', message.sid))
    .catch(error => console.error('Error sending SMS:', error));
};

module.exports = sendSMS;
