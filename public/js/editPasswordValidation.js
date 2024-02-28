document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("editPasswordForm").addEventListener("submit", function (event) {
    if (!validateAndSubmit()) {
      console.log("The form is not Validating");
      event.preventDefault();
    }
  });

  function validateAndSubmit() {
    if (validateForm()) {
      console.log("Form is valid, submitting...");
      return true;
    } else {
      console.log("Form is not valid.");
      return false;
    }
  }

  function validateForm() {
    resetErrorMessage();
    var isValid = true;

    const currentPassword = document.getElementById("currentpassword").value.trim();
    const newPassword = document.getElementById("newpassword").value.trim();
    const confirmPassword = document.getElementById("conformPass").value.trim();
    const alpha = /[a-zA-Z]/;
    const digit = /\d/;

    if (currentPassword === "") {
      displayErrorMessage("error1", "Incorrect current password");
      isValid = false;
    }
    else if (currentPassword.length < 8) {
      displayErrorMessage("error1", "Should contain at least 8 characters!!");
      isValid = false;
    }

    if (newPassword === "") {
      displayErrorMessage("error2", "Enter the Password");
      isValid = false;
    } else if (newPassword.length < 8) {
      displayErrorMessage("error2", "Should contain at least 8 characters!!");
      isValid = false;
    } else if (!alpha.test(newPassword) || !digit.test(newPassword)) {
      displayErrorMessage("error2", "Should contain both Number and Alphabets!!");
      isValid = false;
    }

    if (confirmPassword === "") {
      displayErrorMessage("error3", "Enter the Password");
      isValid = false;
    } else if (confirmPassword.length < 8) {
      displayErrorMessage("error3", "Should contain at least 8 characters!!");
      isValid = false;
    } else if (!alpha.test(confirmPassword) || !digit.test(confirmPassword)) {
      displayErrorMessage("error3", "Should contain both Number and Alphabets!!");
      isValid = false;
    } else if (confirmPassword !== newPassword) {
      displayErrorMessage("error3", "Confirm Password must be same as New Password");
      isValid = false;
    }

    return isValid;
  }

  function displayErrorMessage(elementId, errorMessage) {
    const errorElement = document.getElementById(elementId);
    errorElement.innerText = errorMessage;
    errorElement.style.display = "block";
    errorElement.style.color = "red";
  }

  function resetErrorMessage() {
    var errorElements = document.querySelectorAll(".error-message");
    errorElements.forEach(function (element) {
      element.innerText = "";
      element.style.display = "none";
    });
  }
});
