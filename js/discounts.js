const discounts = {
  "2x1": (name, val, list) => {
    let count = val;
    let discount = 0;
    while (count) {

      if (count % 2 === 0) {
        discount += list.find(item => item.code === name).price;
      }
      count--;
    }
    return -discount;
  },
  'x3': (name, val, list) => {
    if (val > 2) {
      const price = list.find(item => item.code === name).price || 0;
      return -Math.round(val * (price * 0.05));
    }
    return 0;
  }
};
