// prototypes

//prototype is a special property inside a object in js.

// we can set protype using  ->      __proto__

const employee ={
    calcTax(){
        console.log("tax rate is 10%");
    },
};

const emp1 = {
    salary : 20000,
};

emp1.__proto__ = employee; 
// putput is {cal: ƒ}cal: ƒ cal()[[Prototype]]: and more but i deleted them. i ran it inside browser not in vscode.

//classes

// class is a program code template for creating objects.Those objects will have some state(variable) and some behaviour(function) inside it.

/* syntax->
class myclass{
constructor(){}//imp go to line no.34
function(){}
}  
let Obj = new Myclass()
 */

// this is a keyword used in JS to use it instead of object name.it denotes  the current object

// constructor 

// it is a reserve keyword.it is a special method in JS.

// it is automatically invoked by "new" keyword. But we can also create it by on our own.

// inheritance

//passing down of properitiesmethods from parent class to the child class is called iheritance.

/* syntax-> 
class parent{
}
class child extends parent{
}
*/

 class parent{
     hello(){
         console.log("hello");
     }
 }
 class child extends parent{
 
 }
 let object = new child();
 console.log(object.hello());// doubt marked.

// super() -> it is a keyword, it is used to invoke parent child constructor. it menas using it child class can pass arguments or info to its parent class.

