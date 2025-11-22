"use strict";// treats all JS code as newer version.

// alert(4+8) // we are using Node Js not browser so in terminal it does not give any output.

 // prefer to write code with better code readability.  
 // javascript references : mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Introduction and ecma: https://tc39.es/ecma262/

 let name="jagnya"
 let age=21
 let loggedIn=false

 /* datatypes in JS:
     
 primitive data types:

    1.number or integer=>
    2.big int=>
    3.string => ""
    4.boolean=> true or false
    5.null=> empty value. it is a standalone value
    6.undefined=>value is not defned
    7.symbols=> unique

    non primitive/ reference data types:

    1.object=> it is a non primitive datatype.
    2.array
    3.functions


    */

    // "typeof" is use to know the type of datatype. 

   const id = Symbol('123')     // symbol
   const anotherId = Symbol('123')
   console.log(id === anotherId);

   const heros = ["shaktiman","naagraj","dhruv"];  //array

   let myObj = {            // object
      name: "jagnya"
      age:21
   }

const myFunction = function(){    // function
   console.log("hello world");
}
