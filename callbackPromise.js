/*  async await  >> promise chains >> callback hell
 it means async await is better than promise chain which is better than callback hell in JS.*/

// synchronous

/* sync -  synchronous means the code runs in particular sequence of instructions given in the program.

Each instruction waits for the previous instructions to complete its execution.*/


// asynchronous

/* Asynchronous -  Due to synchronous programming, sometimes imp instructions get blocked due to some previous instructions, which causes a delay in the UI.

Asynchronous code execution allows to execute next instructions immediately and doesn't block the flow.*/

// console.log("one");
// console.log("two");

// setTimeout(() => {
// console.log("hello");
// },5000);// setTimeout() will print hello after 5000ms i,e. after 5s.

// console.log("three");// these will execute after "two" is printed 
// console.log("four");

// callback

/* A callback is a function passed as an argument to another function. */

// function sum(a,b){
//     console.log(a+b);
// }
// function calculate(a,b,sumCallback){
//     sumCallback(a,b);
// }
// calculate(5,4,sum);

//Callback Hell

/* Nested callbacks stacked below one another forming a pyramid structure(Pyramid of Doom).
This style of programming becomes difficult to understand & manage.*/

// promises

/* Promise is for “eventual” completion of task. It is an object in JS. It is a solution to callback hell.
let promise = new Promise( (resolve, reject) => { .... } ) - function with 2 handlers.

A JavaScript Promise object can be:

Pending : the result is undefined
Resolved : the result is a value (fulfilled) . resolve( result )
Rejected : the result is an error object .   reject( error )


.then( ) & .catch( )

promise.then( ( res ) => { .... } )
promise.catch( ( err ) ) => { .... } )   */


