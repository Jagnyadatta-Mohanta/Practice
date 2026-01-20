// array

const myArr = [0, 1, 2, 3, 4, 5] // array of integers
const myHeors = ["shaktiman", "naagraj"] // array of string

const myArr2 = new Array(1, 2, 3, 4) // array declaration using new array constructor it also a way to buid an array

// console.log(myArr[1]);

// Array methods

// myArr.push(6) // adds 6 at the end
// myArr.push(7) // adds 7 at the end
// myArr.pop()   // removes element from end

// myArr.unshift(9)  // adds 9 at the begging
// myArr.shift()    // removes element from start

// console.log(myArr.includes(9)); // it checks if 9 is present or not in the array

// console.log(myArr.indexOf(3));// it returns the index of element 3

// const newArr = myArr.join() // converts array into a sstring separated by commas

// console.log(myArr);
// console.log( newArr);


// slice, splice

//console.log("A ", myArr);

const myn1 = myArr.slice(1, 3) //- slice(start, end) -> returns a copy, does not change original.


//console.log(myn1); // output ->[1,2] end is  ignored in this case it is 3.

//console.log("B ", myArr);


const myn2 = myArr.splice(1, 3)  // splice(start, deleteCount)  -> removes elements from original, returns them.


console.log("C ", myArr);//[1,2,3] are removed from original array
console.log(myn2); // removed array is printed.


//Combining Arrays it combines multiple arrays


const marvel_heros = ["thor", "Ironman", "spiderman"]
const dc_heros = ["superman", "flash", "batman"]

// marvel_heros.push(dc_heros)

// console.log(marvel_heros);
// console.log(marvel_heros[3][1]);

// const allHeros = marvel_heros.concat(dc_heros)
// console.log(allHeros);

const all_new_heros = [...marvel_heros, ...dc_heros]

// console.log(all_new_heros);


// Flattening Arrays it flanttens nested arrays into one

const another_array = [1, 2, 3, [4, 5, 6], 7, [6, 7, [4, 5]]]

const real_another_array = another_array.flat(Infinity)
console.log(real_another_array);



console.log(Array.isArray("JDM")) // it checks if it is an array or not here JDM is a string not an array

console.log(Array.from("JDM")) // it converts string JDM into an array.

console.log(Array.from({name: "JDM"})) // interesting VVVIP

let score1 = 100
let score2 = 200
let score3 = 300

console.log(Array.of(score1, score2, score3));// creats an array from the arguments