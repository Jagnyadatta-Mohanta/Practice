function sayMyName(){   // syntax = function func_name(){}
    console.log("D");
    console.log("O");
    console.log("G");
    console.log("E");
    console.log("S");
    console.log("H");
}

// sayMyName()// it will print DOGESH but eery letter will be on a new line as per console.log is written.

// function addTwoNumbers(number1, number2){ // it takes two integers as parameters

//     console.log(number1 + number2);
// }
//addTwoNumbers(12,15)//funtion call
// declaring a function is not enough a;one to executr it to give output you shold call it at ur required place.

function addTwoNumbers(number1, number2){

    // let result = number1 + number2
    // return result
    return number1 + number2 // both this and return result are same means both will give you the same output.
}

const result = addTwoNumbers(3, 5)// value returnd by func addTwoNumbers will be stored in result variable

// console.log("Result: ", result);


function loginUserMessage(username = "sam"){
    if(!username){  // it checks if there is any user name is provided or not i.e, (true) if not it will ask for username and if username is given i.e, (false) it willl print the login message.

        console.log("PLease enter a username");
        return
    }
    return `${username} just logged in`
}

// console.log(loginUserMessage("monkesh"))
// console.log(loginUserMessage("dogesh"))


function calculateCartPrice(val1, val2, ...num1){  // "..." it is called rest operator it is use to take a list of arguments(too many).it stores them in aarray.
    
    return num1 
}

// console.log(calculateCartPrice(200, 400, 500, 2000)) // output -[500,2000]

const user = {
    username: "jagnya",
    prices: 199
}

function handleObject(anyobject){
    console.log(`Username is ${anyobject.username} and price is ${anyobject.price}`);
}

// handleObject(user) // price and prices are not same so username will get printed but the price will be undefined.

handleObject({ // it will give both username and price as output.
    username: "xyz",
    price: 399
})

const myNewArray = [200, 400, 100, 600]

function returnSecondValue(getArray){
    return getArray[1]
}

 //console.log(returnSecondValue(myNewArray));
//console.log(returnSecondValue([200, 400, 500, 1000]));// both outputs are same brother