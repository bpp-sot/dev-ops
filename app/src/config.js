const int = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isInteger(n) && n >= 0 ? n : fallback;
};

const load = (env = process.env) => ({
  port: int(env.PORT, 3000),
  version: env.GIT_SHA || 'local',
  freeShippingThresholdPence: int(env.FREE_SHIPPING_THRESHOLD_PENCE, 5000),
  standardShippingPence: int(env.STANDARD_SHIPPING_PENCE, 395),
});

module.exports = { load };
