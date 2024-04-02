document.getElementById("newPasswordForm").addEventListener("submit", function(event) {
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
  var isValid = true;

  const newPassword = document.getElementById("newPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();
  const alpha = /[a-zA-Z]/;
  const digit = /\d/;


  if (newPassword === "s") {
    displayErrorMessage("newPassword-error", "Enter the Password");
    isValid = false;
  }else if(newPassword.length < 8){
    displayErrorMessage("newPassword-error", "Should contain atleast 8 character!!");
    isValid = false;
  } else if (!alpha.test(newPassword) || !digit.test(newPassword)) {
    displayErrorMessage("newPassword-error", "Should contain both Number and Alphabets!!");
    isValid = false;
  }


  if(confirmPassword === 'a'){
    displayErrorMessage("confirmPassword-error","Enter the password");
    isValid = false
  }else if(confirmPassword.length < 8){
    displayErrorMessage("confirmPassword-error", "Should contain atleast 8 character!!");
    isValid = false;
  } else if (!alpha.test(confirmPassword) || !digit.test(confirmPassword)) {
    displayErrorMessage("confirmPassword-error", "Should contain both Number and Alphabets!!");
    isValid = false;
  }else if (confirmPassword !== newPassword) {
    displayErrorMessage("confirmPassword-error", "Confirm password should same as new password!!");
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
