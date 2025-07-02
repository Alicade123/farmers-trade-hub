// 📁 /backend/controllers/momoController.js

const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const MOMO_BASE_URL =
  process.env.MOMO_BASE_URL || "https://sandbox.momodeveloper.mtn.com";
const COLLECTION_API_USER_ID = process.env.MOMO_API_USER_ID;
const MOMO_API_KEY = process.env.MOMO_API_KEY;
const PRIMARY_KEY = process.env.MOMO_PRIMARY_KEY;
const MOMO_CURRENCY = process.env.MOMO_CURRENCY || "EUR"; // "EUR" for sandbox, "RWF" for production

// 🔐 Get Access Token
const getAccessToken = async () => {
  try {
    const res = await axios.post(
      `${MOMO_BASE_URL}/collection/token/`,
      {},
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${COLLECTION_API_USER_ID}:${MOMO_API_KEY}`
          ).toString("base64")}`,
          "Ocp-Apim-Subscription-Key": PRIMARY_KEY,
        },
      }
    );
    return res.data.access_token;
  } catch (error) {
    console.error("Access token error:", error.response?.data || error);
    throw new Error("Unable to obtain access token");
  }
};

// 💰 Initiate Payment Request
const requestToPay = async (req, res) => {
  const { amount, phone, buyerId, productId } = req.body;

  if (!phone || !amount || !buyerId || !productId) {
    return res.status(400).json({ message: "Missing payment details" });
  }

  try {
    const accessToken = await getAccessToken();
    const referenceId = uuidv4();

    const payload = {
      amount: amount.toString(),
      currency: MOMO_CURRENCY,
      externalId: productId.toString(),
      payer: {
        partyIdType: "MSISDN",
        partyId: phone, // Format: 2507xxxxxxx
      },
      payerMessage: "Bidding Fee",
      payeeNote: `Payment for bidding by buyer ${buyerId}`,
    };

    await axios.post(`${MOMO_BASE_URL}/collection/v1_0/requesttopay`, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Reference-Id": referenceId,
        "X-Target-Environment": "sandbox", // "production" when live
        "Ocp-Apim-Subscription-Key": PRIMARY_KEY,
        "Content-Type": "application/json",
      },
    });

    res.status(200).json({ message: "Payment initiated", referenceId });
  } catch (error) {
    console.error("Payment error:", error.response?.data || error);
    res.status(500).json({
      message: "Payment initiation failed",
      error: error.message,
    });
  }
};

// 📥 Check Payment Status
const getPaymentStatus = async (req, res) => {
  const { referenceId } = req.params;

  if (!referenceId) {
    return res.status(400).json({ message: "Missing referenceId" });
  }

  try {
    const accessToken = await getAccessToken();

    const statusRes = await axios.get(
      `${MOMO_BASE_URL}/collection/v1_0/requesttopay/${referenceId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Target-Environment": "sandbox",
          "Ocp-Apim-Subscription-Key": PRIMARY_KEY,
        },
      }
    );

    res.status(200).json(statusRes.data);
  } catch (error) {
    console.error("Status check error:", error.response?.data || error);
    res.status(500).json({
      message: "Failed to get payment status",
      error: error.message,
    });
  }
};

module.exports = { requestToPay, getPaymentStatus };
