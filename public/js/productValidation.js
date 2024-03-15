document.getElementById("productForm").addEventListener("submit", function(event) {
  event.preventDefault();
  if (validateAndSubmit()) {
      this.submit();
  }
});

function validateAndSubmit() {
  if (validateForm()) {
      return true;
  } else {
      return false;
  }
}

function validateForm() {
  resetErrorMessage();

  let isValid = true;
  const productName = document.getElementById("productNameX").value.trim();
  const description = document.getElementById("descriptionX").value.trim();
  const brand = document.getElementById("brandX").value.trim();
  const regularPrice = parseFloat(document.getElementById("regularPriceX").value);
  const discount = parseFloat(document.getElementById("salePriceX").value);
  const sSize = document.getElementById("sSizeQuantityX").value.trim();
  const mSize = document.getElementById("mSizeQuantityX").value.trim();
  const lSize = document.getElementById("lSizeQuantityX").value.trim();
  const color = document.getElementById("colorX").value.trim();

  if (productName === "") {
      displayErrorMessage("productName-error", "Product name is required");
      isValid = false;
  }
  if (description === "") {
      displayErrorMessage("description-error", "Description is required");
      isValid = false;
  }
  if (brand === "") {
      displayErrorMessage("brand-error", "Brand is required");
      isValid = false;
  }
  if (regularPrice <= 0 || isNaN(regularPrice)) {
      displayErrorMessage("regularPrice-error", "Regular Price must be a valid positive number");
      isValid = false;
  }
  if ( isNaN(discount) || discount>100) {
      displayErrorMessage("salePrice-error", "Discount must be a valid positive number less than 100");
      isValid = false;
  }
  if (sSize === "" || isNaN(parseInt(sSize)) || parseInt(sSize) < 0) {
      displayErrorMessage("sSize-error", "Small size quantity must be a positive number");
      isValid = false;
  }
  if (mSize === "" || isNaN(parseInt(mSize)) || parseInt(mSize) < 0) {
      displayErrorMessage("mSize-error", "Medium size quantity must be a positive number");
      isValid = false;
  }
  if (lSize === "" || isNaN(parseInt(lSize)) || parseInt(lSize) < 0) {
      displayErrorMessage("lSize-error", "Large size quantity must be a positive number");
      isValid = false;
  }
  if (color === "") {
      displayErrorMessage("color-error", "Color is required");
      isValid = false;
  }

  return isValid;
}

function displayErrorMessage(elementId, message) {
  var errorElement = document.getElementById(elementId);
  errorElement.innerText = message;
  errorElement.style.display = "block";
  errorElement.style.color = "red";
}

function resetErrorMessage() {
  var errorElements = document.querySelectorAll(".error-message");
  errorElements.forEach(function(element) {
      element.innerText = "";
      element.style.display = "none";
  });
}
