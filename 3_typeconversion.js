let age = 44
let score = "545";
let name = "jdm";
let value = null;
let x = undefined;
let check = false;

//console.log( typeof age)
//console.log(typeof (age))
//console.log(typeof score)
//console.log(typeof (score))

let valueInNumber = Number(score); // type conversion from string to number.

console.log(typeof valueInNumber);
console.log(typeof(valueInNumber));

console.log(typeof age);
console.log(typeof score);
console.log(typeof name);
console.log(typeof value);
console.log(typeof x);
console.log(typeof check);

let isLoggedIn = true
 
let booleanisLoggedIn = boolean(isLoggedIn)
console.log(booleanisLoggedIn)

/* 

true to boolean conversion is 1.
false to boolean conversion is 0.
null or empty string to boolean conversion is 0.
any vale or string to boolean conversion is 1.

*/

/* 
"44"=> 44
"44abc"=> NaN - its type became number but not the value because of presence of non numerical value abc.
true/false => 1 or 0
*/