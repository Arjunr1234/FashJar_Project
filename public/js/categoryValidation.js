document.getElementById("addCategory").addEventListener("submit", function(event) {
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
  const categoryName = document.getElementById("categoryNameX").value.trim();
  const description = document.getElementById("descriptionX").value.trim();

  if (categoryName === "") {
      displayErrorMessage("categoryName-error", "Category name is required");
      isValid = false;
  }else if (/^\d/.test(categoryName)) {
    displayErrorMessage("categoryName-error", "Should not start with a number");
    isValid = false;
}
  if (description === "") {
      displayErrorMessage("description-error", "Description is required");
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
