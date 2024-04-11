document.getElementById("addCoupon").addEventListener("submit", function(event) {
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
  const couponName = document.getElementById("coupon_name").value.trim();
  const startingDate = document.getElementById("startingDate").value.trim();
  const endingDate = document.getElementById("endingDate").value.trim();
  const discount = parseFloat(document.getElementById("couponDiscount").value.trim());
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
 
  if (couponName === "") {
    displayErrorMessage("couponName-error", "Coupon name is required");
    isValid = false;
  } else if (/\d/.test(couponName)) {
    displayErrorMessage("couponName-error", "Coupon name should not contain numbers");
    isValid = false;
  }

  if (startingDate === "") {
    displayErrorMessage("startingDate-error", "Starting date is required");
    isValid = false;
  } else {
    const startDate = new Date(startingDate);
    if (startDate < yesterday) {
      displayErrorMessage("startingDate-error", "Starting date cannot be earlier than today");
      isValid = false;
    }
  }

  if (endingDate === "") {
    displayErrorMessage("endingDate-error", "Ending date is required");
    isValid = false;
  }else if(endingDate < startingDate){
    displayErrorMessage("endingDate-error", "Should greater than starting date");
    isValid = false;

  }
   else {
    const endDate = new Date(endingDate);
    if (endDate < yesterday) {
      displayErrorMessage("endingDate-error", "Ending date cannot be earlier than today");
      isValid = false;
    }
  }

  if (isNaN(discount)) {
    displayErrorMessage("discount-error", "Discount should be a number");
    isValid = false;
  } else if (discount < 0) {
    displayErrorMessage("discount-error", "Discount shouldn't be less than zero");
    isValid = false;
  } else if (discount > 99) {
    displayErrorMessage("discount-error", "Discount should  less than 100");
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
