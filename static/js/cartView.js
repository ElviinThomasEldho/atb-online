import { fetchData, openModal } from "./helper.js";

const cartView = async function () {
  const parentContainer = document.querySelector(".product-container");
  let orderItems;

  const getCart = async function () {
    orderItems = await fetchData(`/api/get-cart/${userID}`);
  };

  const generateMarkup = function (item, product) {
    const markup = `         
      <div class="cart-item" data-item-id='${item.id}' data-product-id='${
      product.id
    }'>
        <img src="${
          product.image
            ? product.image
            : "https://images.unsplash.com/photo-1509358271058-acd22cc93898?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c3BpY2VzfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
        }"
            alt="${product.name}" class="product-image">
        <h4 class="product-name"><a href="/store/product/${product.id}/">${
      product.name
    }</a></h4>
        <div class="product-info">
            <p class="product-price">₹${product.price}</p>
            <p>|</p>
            <p class="product-quantity">${product.quantity}g</p>
        </div>
        <div class="btns-quantity">
            <button class="btn btn-quantity quantity-add" data-func='add'><i class="fas fa-plus"></i></button>
            <p class="quantity">${item.quantity}</p>
            <button class="btn btn-quantity quantity-minus" data-func='minus'><i class="fas fa-minus"></i></button>
        </div>
        <p class="item-price">₹${product.price * item.quantity}</p>
    </div>
      `;
    return markup;
  };

  const updateCart = function (id, quantity) {
    const cartItem = document.querySelector(`[data-item-id='${id}']`);
    const textQuantity = cartItem.querySelector(".quantity");
    textQuantity.textContent = quantity;
  };

  const updateItem = async function (item) {
    await fetch(`/api/order-item-update/${item.id}/`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(item),
    });
  };

  const clearCart = async function () {
    const order = await fetchData(`/api/get-order/${userID}`);

    await fetch(`/api/order-delete/${order.id}/`, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(order),
    });

    window.location.reload();
  };

  const updateQuantity = async function (func, item) {
    if (func === "add") {
      item.quantity += 1;
      await updateItem(item);
    }

    if (func === "minus") {
      item.quantity -= 1;

      if (item.quantity <= 0) {
        await fetch(`/api/order-item-delete/${item.id}/`, {
          method: "DELETE",
          headers: {
            "Content-type": "application/json",
            "X-CSRFToken": csrftoken,
          },
          body: JSON.stringify(item),
        });
      } else {
        await updateItem(item);
      }
    }
    window.location.href = "/cart/";
  };

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
  const csrftoken = getCookie("csrftoken");

  const render = async function () {
    await getCart();

    parentContainer.innerHTML = "";
    if (orderItems.length > 0) {
      await orderItems.forEach(async (item) => {
        const product = await fetchData(`/api/product-detail/${item.product}`);
        parentContainer.insertAdjacentHTML(
          "beforeend",
          generateMarkup(item, product)
        );
        addHandlerUpdateQuantity();
        renderTotalPrice();
        addHandlerClearCart();
      });
    } else {
      const markup = `
          <p>Your CART is empty</p>
      `;
      parentContainer.insertAdjacentHTML("beforeend", markup);
    }
  };

  const addHandlerUpdateQuantity = async function () {
    const btnsQuantity = document.querySelectorAll(".btns-quantity");
    btnsQuantity.forEach((btns) => {
      btns.addEventListener("click", async function (e) {
        const func = e.target.closest(".btn-quantity").dataset.func;
        const itemID = e.target.closest(".cart-item").dataset.itemId;

        const item = await fetchData(`/api/order-item-detail/${itemID}`);
        await updateQuantity(func, item);
      });
    });
  };

  const addHandlerClearCart = function () {
    const btnClearCart = document.querySelector(`.clear-cart`);
    btnClearCart.addEventListener("click", clearCart);
  };

  const renderTotalPrice = async function () {
    const itemTotals = Array.from(document.querySelectorAll(".item-price"));
    const total = itemTotals
      .map((el) => +el.textContent.slice(1))
      .reduce((total, price) => total + price, 0);

    const textTotal = document.querySelector(".total-price");
    textTotal.textContent = `Total: ₹${total}`;
  };

  const checkStock = async function () {
    const stockContainer = document.querySelector(".stock-container");

    await orderItems.forEach(async (item) => {
      const product = await fetchData(`/api/product-detail/${item.product}`);
      if (product.virtualStock < item.quantity) {
        const markup = `<li>Not Enough Stock of ${product.name}</li>`;
        stockContainer.insertAdjacentHTML("beforeend", markup);

        await fetch(`/api/order-item-delete/${item.id}/`, {
          method: "DELETE",
          headers: {
            "Content-type": "application/json",
            "X-CSRFToken": csrftoken,
          },
          body: JSON.stringify(item),
        });
      }
    });
  };

  if (userID == "None") {
    const markup = `
    <p class="modal-text">If you are a returning customer, login or if you a new customer, register to continue
        shopping <br>
        <a class="close-modal">Remind me later</a>
    </p>
    <div class="row">
        <a href="/login/" class="btn btn-modal">Login</a>
        <p style="font-weight:bold;color: var(--clr-primary);">OR</p>
        <a href="/register/" class="btn btn-modal">Register</a>
    </div>
    `;
    parentContainer.innerHTML = "";
    parentContainer.insertAdjacentHTML("beforeend", markup);
    return;
  } else {
    await getCart();
    await checkStock();
    await render();
  }
};
cartView();
