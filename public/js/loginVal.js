const emailId = document.getElementById('typeEmailX');
const passId = document.getElementById('typePasswordX');
const error1 = document.getElementById('error1');
const error2 = document.getElementById('error2');
const logForm = document.getElementById('logform');
console.log("gff")
function emailValidate() {
  const emailVal = emailId.value;
   

  const emailPattern = /^([a-zA-Z0-9._-]+)@([a-zA-Z.-]+).([a-zA-z]{2,4})$/;
  if (!emailPattern.test(emailVal)) {
    error1.style.display = "block";
    error1.innerHTML = "Invalid Format!!";
  } else {
    error1.style.display = "none";
    error1.innerHTML = "";
  }
}

function passValidate() {
  const passVal = passId.value;
  const alpha = /[a-zA-Z]/;
  const digit = /\d/;
  if (passVal.length < 8) {
    error2.style.display = "block";
    error2.innerHTML = "Must have at least 8 characters!!";
  } else if (!alpha.test(passVal) || !digit.test(passVal)) {
    error2.style.display = "block";
    error2.innerHTML = "Should contain numbers and alphabet!!";
  } else if (passVal.trim() === "") {
    error2.style.display = "block";
    error2.innerHTML = "Please Enter the password!!";
  } else {
    error2.style.display = "none";
    error2.innerHTML = "";
  }
}

emailId.addEventListener('blur', emailValidate);
passId.addEventListener('blur', passValidate);

logForm.addEventListener('submit', function (e) {
  emailValidate();
  passValidate();
  if (error1.innerHTML !== "" || error2.innerHTML !== "") {
    e.preventDefault();
  }
});
