const overlay = document.querySelector(".overlay");
const modalContainer = document.querySelector(".modal");
const btnCloseModal = document.querySelector(".close-modal");

export const fetchData = async function (url) {
  const res = await fetch(url);
  return await res.json();
};

export const openModal = function () {
  overlay.classList.remove("hidden");
  modalContainer.classList.remove("hidden");

  btnCloseModal.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);
};

const closeModal = function () {
  overlay.classList.add("hidden");
  modalContainer.classList.add("hidden");
};

export const renderNotification = async function (productID, quantity) {
  console.log("Render Notification");
  const product = await fetchData(`/api/product-detail/${productID}`);
  const parentContainer = document.querySelector(".notification-container");
  const markup = `<div class="notification">
  <p class="notification-quantity">${quantity}</p>
  <p class="notification-product-name">${product.name}</p>
  added to cart</p></div>`;
  parentContainer.insertAdjacentHTML("afterbegin", markup);
  const notification = parentContainer.querySelector(".notification");
  console.log(notification);
  setTimeout(function () {
    notification.style.opacity = 0;
  }, 2000);

  setTimeout(function () {
    notification.remove();
  }, 2300);
};
