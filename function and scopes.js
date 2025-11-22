
// let num1;
// function calculatePrice(...num1)//(...) operator is 
// {
//         return num1
// }
// //console.log(calculatePrice(30,50,69,78,98));
 

// if (true) {
//     let a = 10;
//     const b = 20;
//     var c = 30;    /* the following console logs will not print any value except var c because of scope var gives global access scope.*/
// }

// //console.log(a);
// //console.log(b);
// //console.log(c);


// //skipped note maaking
// //loops

// //for of
// let fruitType = "Bananas";
// switch (fruitType) {
//   case "Oranges":
//     console.log("Oranges are $0.59 a pound.");
//     break;
//   case "Apples":
//     console.log("Apples are $0.32 a pound.");
//     break;
//   case "Bananas":
//     console.log("Bananas are $0.48 a pound.");
//     break;
//   case "Cherries":
//     console.log("Cherries are $3.00 a pound.");
//     break;
//   case "Mangoes":
//     console.log("Mangoes are $0.56 a pound.");
//     break;
//   case "Papayas":
//     console.log("Papayas are $2.79 a pound.");
//     break;
//   default:
//     console.log(`Sorry, we are out of ${fruitType}.`);
// }
// console.log("Is there anything else you'd like?");

// const car = {
// maker : FormData,
// model : mustang,
// };

// function dumpProps(obj,car) {
//   let result = "";
//   for (const i in obj) {
//     result += `${car}.${i} = ${obj[i]}<br>`;
//   }
//   result += "<hr>";
//   return result;
// }

// function myFunc(theObject) {
//   theObject.make = "Toyota";
// }


// when a function takes object as a parameter then the change in value of the object key values will result in changed value out side the function and this same case happens with the  array as a parameter to the function but not same with just variables i.e, change in value of a variable inside a function as a parameter doesn't change it's value outside the function.
// const myCar = {
//   make: "Honda",
//   model: "Accord",
//   year: 1998,
// };

// console.log(myCar.make); // "Honda"
// myFunc(myCar);
// console.log(myCar.make); // "Toyota"

// function myFunc(theArr) {
//   theArr[0] = 30;
// }

// const arr = [45];

// console.log(arr[0]); // 45
// myFunc(arr);
// console.log(arr[0]); // 30

 
// The following example defines a map function that should receive a function as first argument and an array as second argument. Then, it is called with a function defined by a function expression:
// function map(f, a) {
//   const result = new Array(a.length);
//   for (let i = 0; i < a.length; i++) {
//     result[i] = f(a[i]);
//   }
//   return result;
// }

// const numbers = [0, 1, 2, 5, 10];
// const cubedNumbers = map(function (x) {
//   return x * x * x;
// }, numbers);
// console.log(cubedNumbers); // [0, 1, 8, 125, 1000]