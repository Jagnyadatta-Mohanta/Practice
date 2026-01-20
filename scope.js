//var c = 300

let a = 300
if (true) {
    let a = 10
    const b = 20
    // console.log("INNER: ", a);// it will give 10 as out put, due to its local variable scope.
}


// console.log(a); // it will give 300 as out put.
// console.log(b); // it will give error as output because b is declared within if block and we can not access it outside directly, outside of the if block b is not declared.
// console.log(c); //it will give 300 as outputt.


function one(){
    const username = "jagnya"

    function two(){
        const website = "insta"
        console.log(username);// we can access the user name here because func two can access its parent's info as it comes under his scope.
    }
    // console.log(website);// func one cannot access func two's data.

     two()

}
// one()

if (true) {
    const username = "jagnya"
    if (username === "jagnya") {
        const website = " instagra"
        // console.log(username + website);// it will give output as usual i.e.,jagnya instagram
    }
    // console.log(website);// cannot access outside if block
}

// console.log(username);// cannot access username outside of the if block .



console.log(addone(5))// it willgive output 6 even if it is called before its declaration as js doesn't care.-> i will write later.

function addone(num){
    return num + 1
}



addTwo(5)// will give error because we cannot call a function before its declaration in case of function expression.
const addTwo = function(num){
    return num + 2
}