const express = require("express");
const bizSdk = require("facebook-nodejs-business-sdk");
const config = require("./config.json");

const port = process.env.PORT || 8010;
const FacebookAdsApi = bizSdk.FacebookAdsApi.init(config.access_token);
const AdAccount = bizSdk.AdAccount;
const Campaign = bizSdk.Campaign;
const account = new AdAccount(config.accountId);

const app = express();

app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const response = await account.getCampaigns([Campaign.Fields.name]);
    const data = response.map(campaign => campaign._data);
    res.send(data);
  } catch (e) {
    res.send(e);
  }
});

app.get("/:id", async (req, res) => {
  try {
    const campaign = new Campaign(req.params.id);
    const response = await campaign.read([Campaign.Fields.name]);
    res.send(response._data);
  } catch (e) {
    res.send(e);
  }
});

app.post("/", async (req, res) => {
  if (!req.body.name) return res.status(400).send();
  account
    .createCampaign([Campaign.Fields.name], {
      objective: "PAGE_LIKES",
      status: "PAUSED",
      name: req.body.name,
      special_ad_category: "NONE"
    })
    .then(camapign => {
      res.send(camapign._data);
    })
    .catch(error => res.send(error));
});

app.put("/:id", async (req, res) => {
  try {
    const allowedUpdates = ["name"];
    Object.keys(req.body).forEach(key => {
      if (!allowedUpdates.includes(key)) return res.status(400).send();
    });
    const camapign = new Campaign(req.params.id, {
      [Campaign.Fields.id]: req.params.id,
      ...req.body
    });
    await camapign.update();
    res.send(camapign._data);
  } catch (e) {
    res.send(e);
  }
});

app.delete("/:id", async (req, res) => {
  try {
    const campaign = new Campaign(req.params.id);
    await campaign.delete();
    res.send(campaign._data);
  } catch (e) {
    res.send(e);
  }
});

app.listen(port, () => {
  console.log(`Server is up on port ${3000}`);
});
