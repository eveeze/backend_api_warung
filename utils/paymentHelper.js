// utils/paymentHelper.js
const axios = require("axios");

async function createQRISPayment(amount) {
  const response = await axios.post(
    "https://api.sandbox.midtrans.com/v2/charge",
    {
      payment_type: "qris",
      transaction_details: {
        order_id: `order-${Date.now()}`, // Unique order ID
        gross_amount: amount,
      },
      qris: { acquirer: "gopay" }, // QRIS type (you can adjust if needed)
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
  return { qrisUrl: response.data.actions[0].url };
}

module.exports = { createQRISPayment };
