const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const {
  UUID,
  apiKey,
  primaryKey,
  baseUrl,
  targetEnvironment,
} = require("../config/momoDisbursement");

async function getAccessToken() {
  const auth = Buffer.from(`${UUID}:${apiKey}`).toString("base64");

  const res = await axios.post(
    `${baseUrl}/token/`,
    {},
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Ocp-Apim-Subscription-Key": primaryKey,
      },
    }
  );
  return res.data.access_token;
}

async function sendMoney(
  toNumber,
  amount,
  currency = "EUR",
  reason = "Payout"
) {
  const token = await getAccessToken();
  const referenceId = uuidv4();

  await axios.post(
    `${baseUrl}/v1_0/transfer`,
    {
      amount,
      currency,
      externalId: referenceId,
      payee: {
        partyIdType: "MSISDN",
        partyId: toNumber,
      },
      payerMessage: reason,
      payeeNote: "Thank you for using our system!",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Reference-Id": referenceId,
        "X-Target-Environment": targetEnvironment,
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": primaryKey,
      },
    }
  );

  return referenceId;
}

module.exports = {
  sendMoney,
};
