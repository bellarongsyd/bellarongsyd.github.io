function update_age() {
  var age = document.getElementById("age");

  var dob = new Date("2023-02-18");
  var current = new Date();

  var diff = current - dob;
  var daydiff = Math.floor(diff / (1000 * 60 * 60 * 24));
  console.log(daydiff)

  age.textContent = daydiff;
}

setTimeout(update_age, 1);