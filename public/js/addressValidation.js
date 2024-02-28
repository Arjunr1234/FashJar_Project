document.getElementById("addressForm").addEventListener("submit", function(event) {
  if(!validateAndSubmit()){
    event.preventDefault()
  }
});

function validateAndSubmit() {
  if (validateForm()) {
    console.log("Form is valid, submitting...");
      return true
      
  } else {

      console.log("Form is not valid.");
      return false
  }
}

function validateForm() {
  resetErrorMessage();

  let isValid = true;

  const addressName = document.getElementById("addresName").value.trim();
  const addressMobile = document.getElementById("addressmobile").value;
  const houseName = document.getElementById("housename").value.trim();
  const pincode = document.getElementById("pincode").value;
  const townOrCity = document.getElementById("townOrCity").value.trim();
  const district = document.getElementById("district").value.trim();
  const country = document.getElementById("country").value.trim();
  const state = document.getElementById("state").value.trim();
  const nonNumericRegex = /[^0-9]/
 
  if (addressName === "" || !(nonNumericRegex.test(addressName))) {
      displayErrorMessage("addresName-error", "Name is required");
      isValid = false;
  }
  if (houseName === "") {
      displayErrorMessage("housename-error", "House name is required");
      isValid = false;
  }
  if (townOrCity === "" || !(nonNumericRegex.test(townOrCity))) {
      displayErrorMessage("townOrCity-error", "Enter the Town or City");
      isValid = false;
  }
  if (district === "" || !(nonNumericRegex.test(district))) {
      displayErrorMessage("district-error", "Enter the District");
      isValid = false;
  }
  if (state === "" || !(nonNumericRegex.test(state))) {
      displayErrorMessage("state-error", "Enter the State");
      isValid = false;
  }
  if (country === "" || !(nonNumericRegex.test(country))) {
      displayErrorMessage("country-error", "Enter the Country");
      isValid = false;
  }
  if (addressMobile.length !== 10) {
      displayErrorMessage("addressmobile-error", "Please Enter a Valid 10-Digit Mobile Number");
      isValid = false;
  }
  if (pincode.length !== 6) {
      displayErrorMessage("pincode-error", "Please Enter a Valid 6-Digit Pincode");
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
