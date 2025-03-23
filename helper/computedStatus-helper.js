const determineStatus = (quantity, threshold_qty, expiration_date) => {
  const today = new Date();
  const expiryDate = expiration_date ? new Date(expiration_date) : null;

  if (quantity === 0) return "out of stock";
  if (expiryDate && expiryDate < today) return "expired";
  if (quantity <= threshold_qty) return "low";
  return "available";
};

export default determineStatus;
