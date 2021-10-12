import {
  fetchData,
  openModal,
  renderNotification,
  renderOutOfStock,
} from "./helper.js";

const storeView = async function (length = 0) {
  const parentContainer = document.querySelector(".store-container");
  const btnSort = document.querySelector("#sort");
  const btnCategory = document.querySelector("#category");
  const products = await fetchData(`/api/product-list/`);

  const generateMarkup = function (product) {
    const markup = `          
    <div class="product-card" data-id='${product.id}'>
        <div class="btn-group-product">
            <a href="/store/product/${
              product.id
            }/" class="btn btn-icon view"><i class="fas fa-eye"></i></a>
            <a class="btn btn-icon ${
              product.virtualStock <= 0 ? "out-of-stock" : "add-to-cart"
            }"><i class="fas fa-cart-plus"></i></a>
            <a class="btn btn-icon ${
              product.virtualStock <= 0 ? "out-of-stock" : "buy-now"
            }"><i class="fas fa-shopping-bag"></i></a>
        </div>
        <img src="${
          product.image
            ? product.image
            : "https://images.unsplash.com/photo-1509358271058-acd22cc93898?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c3BpY2VzfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
        }"
            alt="${product.name}" class="product-image">
        <div class="product-info">
        <h4 class="product-name"><a href="/store/product/${product.id}/">${
      product.name
    }</a></h4>
        <p class="product-price">₹${product.price}</p>
        <p class="divider">|</p>
        <p class="product-quantity">${product.quantity}g</p>
        </div>
    </div>
    `;
    return markup;
  };

  const outOfStock = async function (product) {
    if (userID == "None") {
      openModal();
      return;
    }

    renderOutOfStock(product);
  };

  const addToCart = async function (product) {
    if (userID == "None") {
      openModal();
      return;
    }

    const orderItems = await fetchData(`/api/get-cart/${userID}`);

    if (orderItems.some((item) => item.product == product)) {
      const existingItem = orderItems.filter(
        (item) => item.product == product
      )[0];

      existingItem.quantity += 1;

      await fetch(`/api/order-item-update/${existingItem.id}/`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify(existingItem),
      });

      renderNotification(product, 1);
    } else {
      const order = await fetchData(`/api/get-order/${userID}`);

      const orderItem = {
        product: product,
        order: order.id,
        quantity: 1,
      };

      await fetch(`/api/order-item-create/`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify(orderItem),
      });

      renderNotification(product, 1);
    }
  };

  const buyNow = async function (product) {
    if (userID == "None") {
      openModal();
      return;
    }

    let order = await fetchData(`/api/get-order/${userID}`);

    await fetch(`/api/order-delete/${order.id}`, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(order),
    });

    order = await fetchData(`/api/get-order/${userID}`);

    const orderItem = {
      product: product,
      order: order.id,
      quantity: 1,
    };

    const response = await fetch(`/api/order-item-create/`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(orderItem),
    });
    const data = await response.json();

    window.location.href = "/cart/";
  };

  const sortProducts = function (criteria) {
    if (criteria == "high-to-low") {
      let cards = document.querySelectorAll(".product-card");
      cards = Array.from(cards);
      cards.sort(function (a, b) {
        return (
          +b.querySelector(".product-price").textContent.slice(1) -
          +a.querySelector(".product-price").textContent.slice(1)
        );
      });
      parentContainer.innerHTML = "";
      cards.forEach((product) => {
        parentContainer.insertAdjacentElement("beforeend", product);
      });
    }
    if (criteria == "low-to-high") {
      let cards = document.querySelectorAll(".product-card");
      cards = Array.from(cards);
      cards.sort(function (a, b) {
        return (
          +a.querySelector(".product-price").textContent.slice(1) -
          +b.querySelector(".product-price").textContent.slice(1)
        );
      });
      parentContainer.innerHTML = "";
      cards.forEach((product) => {
        parentContainer.insertAdjacentElement("beforeend", product);
      });
    }
  };

  const categorizeProducts = function (category) {
    category.toLowerCase();
    if (category == "all") {
      render(products);
      return;
    }

    let categoryProducts = [];
    products.forEach((product) => {
      if (product.category.toLowerCase() === category) {
        categoryProducts.push(product);
      }
    });
    render(categoryProducts);
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

  const addHandlerBuyNow = function () {
    const btnBuyNow = document.querySelectorAll(".buy-now");
    btnBuyNow.forEach((btn) =>
      btn.addEventListener("click", async function (e) {
        await buyNow(e.target.closest(".product-card").dataset.id);
      })
    );
  };

  const addHandlerAddToCart = function () {
    const btnAddToCart = document.querySelectorAll(".add-to-cart");
    btnAddToCart.forEach((btn) =>
      btn.addEventListener("click", async function (e) {
        await addToCart(e.target.closest(".product-card").dataset.id);
      })
    );
  };

  const addHandlerOutOfStock = function () {
    const btnAddToCart = document.querySelectorAll(".out-of-stock");
    btnAddToCart.forEach((btn) =>
      btn.addEventListener("click", async function (e) {
        await outOfStock(e.target.closest(".product-card").dataset.id);
      })
    );
  };

  const addHandlerSort = function () {
    btnSort.addEventListener("click", function (e) {
      sortProducts(e.target.value);
    });
  };

  const addHandlerCategory = function () {
    btnCategory.addEventListener("click", function (e) {
      categorizeProducts(e.target.value);
    });
  };

  const render = async function (products) {
    parentContainer.innerHTML = "";
    products.forEach((product) => {
      const markup = generateMarkup(product);
      parentContainer.insertAdjacentHTML("beforeend", markup);
    });
  };

  await render(length === 0 ? products : products.slice(0, length));
  addHandlerAddToCart();
  addHandlerBuyNow();
  addHandlerOutOfStock();
  if (btnSort) addHandlerSort();
  if (btnCategory) addHandlerCategory();
};
storeView(length);
