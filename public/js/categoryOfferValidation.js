document.getElementById("catOfferForm").addEventListener("submit", function(event) {
  event.preventDefault();
  if (validateAndSubmit()) {
      this.submit();
  }
});

function validateAndSubmit() {
  return validateForm();
}

function validateForm() {
  resetErrorMessage();

  let isValid = true;
  const offerName = document.getElementById("name").value.trim();
  const startingDate = document.getElementById("catStartingDate").value.trim();
  const endingDate = document.getElementById("catEndingDate").value.trim();
  const discountInput = document.getElementById("categoryDiscount").value.trim();
  const discount = parseFloat(discountInput);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (offerName === "") {
    displayErrorMessage("catOfferName-error", "Offer name is required");
    isValid = false;
  } else if (/\d/.test(offerName)) {
    displayErrorMessage("catOfferName-error", "Name should not contain numbers");
    isValid = false;
  }

  if (startingDate === "") {
    displayErrorMessage("catStartingDate-error", "Starting date is required");
    isValid = false;
  } 

  if (endingDate === "") {
    displayErrorMessage("catEndingDate-error", "Ending date is required");
    isValid = false;
  } else {
    const endDate = new Date(endingDate);
    if (endDate < yesterday) {
      displayErrorMessage("catEndingDate-error", "Ending date cannot be earlier than today");
      isValid = false;
    }
  }

  if (isNaN(discount) || discountInput === "") {
    displayErrorMessage("catDiscount-error", "Discount is required and should be a number");
    isValid = false;
  } else if (discount < 0) {
    displayErrorMessage("catDiscount-error", "Discount shouldn't be less than zero");
    isValid = false;
  } else if (discount > 100) {
    displayErrorMessage("catDiscount-error", "Discount should not be greater than 100");
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
