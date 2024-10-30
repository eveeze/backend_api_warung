// utils/midtransHelpers.js
const crypto = require("crypto");

// Helper untuk verifikasi webhook signature
function createNotificationSignature(data) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const orderId = data.order_id;
  const statusCode = data.status_code;
  const grossAmount = data.gross_amount;

  const signatureString = orderId + statusCode + grossAmount + serverKey;
  return crypto.createHash("sha256").update(signatureString).digest("hex");
}

// Helper untuk memvalidasi webhook request
function validateWebhookRequest(requestBody) {
  try {
    const receivedSignature = requestBody.signature_key;
    const calculatedSignature = createNotificationSignature(requestBody);

    return receivedSignature === calculatedSignature;
  } catch (error) {
    console.error("Error validating webhook:", error);
    return false;
  }
}

module.exports = {
  createNotificationSignature,
  validateWebhookRequest,
};
