// utils/paymentHelper.js
const axios = require("axios");

async function createQRISPayment(amount) {
  const orderId = `order-${Date.now()}`; // Generate unique order ID

  try {
    const response = await axios.post(
      process.env.MIDTRANS_ENV === "production"
        ? "https://api.midtrans.com/v2/charge"
        : "https://api.sandbox.midtrans.com/v2/charge",
      {
        payment_type: "qris",
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        qris: { acquirer: "gopay" },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            process.env.MIDTRANS_SERVER_KEY + ":"
          ).toString("base64")}`,
        },
      }
    );

    return { orderId, qrisUrl: response.data.actions[0].url };
  } catch (error) {
    console.error("Midtrans API Error:", error.response?.data || error.message);
    throw new Error("Failed to create QRIS payment");
  }
}

// Function to check payment status
async function checkPaymentStatus(orderId) {
  try {
    const response = await axios.get(
      `${
        process.env.MIDTRANS_ENV === "production"
          ? "https://api.midtrans.com"
          : "https://api.sandbox.midtrans.com"
      }/v2/${orderId}/status`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.MIDTRANS_SERVER_KEY + ":"
          ).toString("base64")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error checking payment status:", error);
    throw new Error("Failed to check payment status");
  }
}

module.exports = { createQRISPayment, checkPaymentStatus };
