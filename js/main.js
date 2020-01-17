document.addEventListener('DOMContentLoaded', () => {
  const products = [
    {
      "code": "GOKU",
      "name": "Goku POP",
      "price": 5,
      "discount": "2x1"
    }, {
      "code": "NARU",
      "name": "Naruto POP",
      "price": 20,
      "discount": "x3"
    }, {
      "code": "LUF",
      "name": "Luffy POP",
      "price": 7.50
    }
  ];

  const loadProducts = () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(products);
      }, 1000)
    })
  };

  let availableProducts = [];
  const addedProducts = JSON.parse(localStorage.getItem('addedProducts') || "{}");
  let totalCostWithoutDiscount = 0;
  let offerList = [];
  let discount = 0;
  let total = 0;

  const productTemplate = (product) => {
    const {code, name, price, quantity, total} = product;
    const row = document.createElement('tr');
    row.innerHTML = `
            <td class="td td-avatar">
            <div class="avatar"><img src="./img/${code}.jpg" alt="${code}"/></div>
            </td>
            <td class="td td-description">
              <h4 class="h4"><a class="product_name" href="#">${name}</a></h4>
              <p class="product_description">Product code ${code}</p>
            </td>
            <td class="td td-quantity">
              <div class="product_quantity">
                <input name="${code}" type="button" value="-">
                <input name="${code}_quantity" type="text" value=${quantity}>
                <input name="${code}" type="button" value="+">
              </div>
            </td>
            <td class="td td-price bold">${price} €</td>
            <td class="td td-total bold" id="${code}_total">${total} €</td>
          `;
    return row
  };

  const setTotalItems = () => {
    let totalQuantity = 0;
    let totalPrice = 0;
    Object.keys(addedProducts).forEach(key => {
      totalQuantity += addedProducts[key];
      totalPrice += addedProducts[key] * getPrice(key);
    });
    totalCostWithoutDiscount = totalPrice;
    document.querySelector('#total_items').innerHTML = `${totalQuantity} Items ${totalPrice} €`
  };

  const setValues = (name, val) => {
    const quantity = document.querySelector(`input[name="${name}_quantity"]`);
    const total = document.querySelector(`#${name}_total`);
    quantity.value = val;
    total.innerHTML = `${Number(val) * getPrice(name)} €`;
  };

  const getPrice = (name) => {
    return availableProducts.find(item => item.code === name).price || 0
  };

  const checkDiscounts = (added, list) => {
    const discountListParentEl = document.querySelector('#discountList');
    offerList = Object.keys(added).reduce((accum, key) => {
      const product = list.find(item => item.code === key);
      if (product && product.discount && discounts[product.discount]) {
        const discount = discounts[product.discount](key, added[key], list);
        if (discount < 0) return [...accum, {
          discountName: product.discount,
          productName: product.name,
          productCode: product.code,
          discount
        }]
      }
      return accum
    }, []);
    if (!offerList.length && discountListParentEl) {
      discountListParentEl.remove();
      return
    }
    if (offerList.length && discountListParentEl) {
      const elements = discountListParentEl.querySelectorAll('li');
      if (elements) {
        const keys = offerList.map(({discountName, productName}) => `${discountName}_${productName}`);
        elements.forEach(el => {
          if (!keys.includes(el.id)) el.remove();
        })
      }
    }
    if (offerList.length && !discountListParentEl) {
      const discountList = document.createElement('div');
      discountList.id = 'discountList';
      discountList.innerHTML = '<h3 class="h3">Discounts</h3><ul class="ul ul-discount"></ul>';
      document.querySelector('#total_items').parentElement.append(discountList);
    }
    offerList.forEach(item => setDiscount(item));
  };

  const setDiscount = (props) => {
    const {discountName, productName, productCode, discount} = props;
    const key = `discount_${discountName}_${productCode}`;
    const el = document.querySelector(`#${key}`);
    if (el && discount < 0) {
      el.innerText = discount;
    } else {
      const discountItem = document.createElement('li');
      discountItem.id = `${discountName}_${productCode}`;
      discountItem.className = 'li li-discount';
      discountItem.innerHTML = `<span>${discountName} ${productName} offer</span> <span id="${key}" class="bold">${discount} €</span>`;
      document.querySelector('#discountList ul').append(discountItem)
    }
  };

  const setTotal = () => {
    discount = offerList.reduce((accum, current) => {
      return accum + current.discount
    }, 0);
    total = totalCostWithoutDiscount + discount;
    document.querySelector('#totalCost').innerHTML = total + '€'
  };

  const onProductsBtnClick = (e) => {
    if (e.target.value === '+') {
      addedProducts[e.target.name] = (addedProducts[e.target.name] || 0) + 1
    } else if (e.target.value === '-' && addedProducts[e.target.name]) {
      addedProducts[e.target.name] = addedProducts[e.target.name] - 1
    }
    handleChangeQuantity(e.target.name, addedProducts[e.target.name] || 0);
  };

  const handleChangeQuantity = (name) => {
    localStorage.setItem('addedProducts', JSON.stringify(addedProducts));
    setValues(name, addedProducts[name] || 0);
    setTotalItems();
    checkDiscounts(addedProducts, availableProducts);
    setTotal();
  };

  const onChangeQuantity = (e) => {
    const name = e.target.name.replace('_quantity', '');
    addedProducts[name] = Number(e.target.value);
    handleChangeQuantity(name);
  };

  const onCheckoutClick = (e) => {
    e.preventDefault();
    alert(`Checkout: \n ${Object.keys(addedProducts).map(key => `${key} - ${getPrice(key)} \n`)} \n Without Discount: ${totalCostWithoutDiscount} \n Discount: ${discount} \n Total: ${total}`);
  };

  const init = async () => {
    const productsList = await loadProducts();
    const productTableBody = document.querySelector('#shopping_cart tbody');
    availableProducts = [...productsList];
    if (productTableBody) {
      availableProducts.map(item => {
        const itemWithQuantity = {
          ...item,
          quantity: addedProducts[item.code] | 0,
          total: addedProducts[item.code] * item.price || 0
        };
        productTableBody.append(productTemplate(itemWithQuantity));
      });
      setTotalItems();
      checkDiscounts(addedProducts, availableProducts);
      setTotal();
      const buttons = productTableBody.querySelectorAll('input[type="button"]');
      const inputs = productTableBody.querySelectorAll('input[type="text"]');
      buttons.forEach(button => button.addEventListener('click', onProductsBtnClick));
      inputs.forEach(button => button.addEventListener('blur', onChangeQuantity));
      document.querySelector('#checkout').addEventListener('click', onCheckoutClick);
    }
  };

  init().then(() =>
    document.querySelector('body').classList.remove("loading")
  );
});
