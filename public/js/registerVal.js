const emailId = document.getElementById('typeEmailX');
const nameId = document.getElementById('typeNameX');
const mobileId = document.getElementById('typeMobileX');
const passId = document.getElementById('typePasswordX');
const error1 = document.getElementById('error1');
const error2 = document.getElementById('error2');
const error3 = document.getElementById('error3');
const error4 = document.getElementById('error4');
const regFrom = document.getElementById('logform');

function emailValidate(e){
  const emailVal = emailId.value;
  const emailPattern = /^([a-zA-Z0-9._-]+)@([a-zA-Z.-]+).([a-zA-z]{2,4})$/ 
  if(!emailPattern.test(emailVal)){
    error2.style.display = "block"
    error2.innerHTML = "Invalid Format!!"
  }else{
    error.style.display = "block"
    error.innerHTML = ""
  }
}

function passValidate(e){
  const passVal = passId.value;
  const alpha = /[a-zA-Z]/
  const digit = /\d/
  if(passVal.length < 8){
    error4.style.display = "block"
    error4.innerHTML = "Must have atleast 8 Characters"

  }else if(!alpha.test(passVal) || !digit.test(passVal)){
     
    error4.style.display = "block"
    error4.innerHTML  = "Should contain Number and Alphabets!!"

  }else{
    error4.style.display = "none"
    error4.innerHTML = ""
  }
}

function nameValidate(){
  const nameVal = nameId.value
  if(nameVal.trim() === ""){
    error1.style.display = "block"
    error1.innerHTML = "Please enter a valid Name!!"
  }else{
    error1.style.display = "none"
    error1.innerHTML = ""
  }
}

function mobValidate(){
  const mobVal = mobileId.value
  if(mobVal.trim() === ""){
    error3.style.display = "block"
    error3.innerHTML = "Please enter a valid Mobile number!!"
  }else if(mobVal.length < 10 || mobVal.length > 10){

    error3.style.display = "block"
    error3.innerHTML = "Please enter  10 digits"

  }else{

    error3.style.display = "none"
    error3.innerHTML = ""

  }
}

emailId.addEventListener('blur',emailValidate);
nameId.addEventListener('blur',nameValidate);
mobileId.addEventListener('blur',mobValidate);
passId.addEventListener('blur',passValidate);

regFrom.addEventListener('submit',function(e){
    emailValidate()
    nameValidate()
    mobValidate()
    passValidate()

    if(error2.innerHTML || error4.innerHTML || error1.innerHTML || error3.innerHTML){
      e.preventDefault()
    }
})