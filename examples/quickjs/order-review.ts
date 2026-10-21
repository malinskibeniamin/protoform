export const orderReviewRule = Object.freeze({
  id: 'order-stock-review',
  source: `form => {
    if (!Array.isArray(form.lines) || !Array.isArray(form.stock)) throw Error("Missing inventory");
    const validSku = sku => typeof sku === "string" && /^[A-Z0-9][A-Z0-9-]{0,63}$/.test(sku);
    const inventory = new Map();
    for (const {key, value} of form.stock) {
      if (!validSku(key) || !Number.isSafeInteger(value) || value < 0 || inventory.has(key)) {
        throw Error("Invalid inventory");
      }
      inventory.set(key, value);
    }
    const requested = new Map();
    let shortage = false;
    for (const {sku, quantity} of form.lines) {
      if (!validSku(sku) || !Number.isSafeInteger(quantity) || quantity <= 0 || !inventory.has(sku)) {
        throw Error("Invalid order line");
      }
      const total = (requested.get(sku) ?? 0) + quantity;
      if (!Number.isSafeInteger(total)) throw Error("Quantity overflow");
      requested.set(sku, total);
      if (total > inventory.get(sku)) shortage = true;
    }
    return {fields: {
      backorderNote: {visible: shortage},
      dispatchReference: {disabled: shortage}
    }};
  }`,
  version: '1',
});
