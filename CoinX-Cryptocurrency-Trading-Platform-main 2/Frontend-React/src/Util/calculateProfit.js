// Utility helper module for calculateProfit.
export const calculateProfit = (order) => {
  if (order?.orderItem?.buyPrice != null && order?.orderItem?.sellPrice != null) {
    return order.orderItem.sellPrice - order.orderItem.buyPrice;
  }

  return "-";
};
