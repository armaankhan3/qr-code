// For now just console.log, later integrate Twilio or Nodemailer
const sendAlert = async (contacts, message) => {
  contacts.forEach(contact => {
    console.log(`Sending alert to ${contact}: ${message}`);
  });
};

module.exports = sendAlert;
