// backend/utils/fonnte.js
const axios = require("axios");

const sendWhatsAppOTP = async (phone, otp) => {
  try {
    // Format the message
    const message = `Your OTP code is: ${otp}. This code will expire in 5 minutes.`;

    // Prepare the phone number (ensure the number is in international format)
    const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;

    // Send WhatsApp message using Fonnte
    const response = await axios.post(
      "https://api.fonnte.com/send",
      {
        target: formattedPhone,
        message: message,
        countryCode: "", // You can leave it empty if the phone number includes the country code
      },
      {
        headers: {
          Authorization: process.env.FONNTE_API_KEY, // Your Fonnte API key
        },
      }
    );

    console.log("WhatsApp message sent successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending WhatsApp OTP via Fonnte:", error);
    throw new Error("Failed to send OTP");
  }
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  sendWhatsAppOTP,
  generateOTP,
};
