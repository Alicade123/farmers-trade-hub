const axios = require("axios");
const base64 = require("base-64");

const getAccessToken = async () => {
  const auth = base64.encode(
    `${process.env.MOMO_API_USER}:${process.env.MOMO_API_KEY}`
  );
  const res = await axios.post(
    `${process.env.MOMO_BASE_URL}/collection/token/`,
    null,
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Ocp-Apim-Subscription-Key": process.env.MOMO_SUBSCRIPTION_KEY,
      },
    }
  );
  return res.data.access_token;
};

module.exports = {
  getAccessToken,
};
