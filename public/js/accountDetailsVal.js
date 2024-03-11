document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("detailsEdit").addEventListener("submit", function (event) {
    if (!validateAndSubmit()) {
      console.log("The form is not Validating");
      event.preventDefault();
    }
  })


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

    const userName = document.getElementById("proname").value.trim();
    const mobile = document.getElementById("pronumber").value.trim();

    if(userName === ""){
      displayErrorMessage("proname-error", "Enter a Name");
      isValid = false;
    }else if (!/^[a-zA-Z]+$/.test(userName)) {
      displayErrorMessage("proname-error", "Enter a valid name!!");
      isValid = false;
    }
    if(mobile === ""){
      displayErrorMessage("pronumber-error", "Enter a mobile");
      isValid = false;
    }else if (!/^\d+$/.test(mobile)) {
      displayErrorMessage("pronumber-error", "Enter a valid mobile number .");
      isValid = false;
    }else if(mobile.length !== 10){
      displayErrorMessage("pronumber-error", "Please enter 10 digit number");
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





})