const accountId=144553
let accountEmail="jagnya@gmail.com"
var accountPassword="12345"
accountCity="baripada"


accountEmail="hnjkf@gmail.com"
accountPassword= 89746
accountCity="balasore"
let accountState;


console.log(accountId);
console.table([accountEmail,accountEmail,accountPassword,accountCity,accountState]);
/*
 prefer not to use var for variable declaration because of scope problem. 

if value to a variable is not given then it becomes undefined you can give value while declaring or by calling a value. 

usually in javascript 'let' and 'var'are used to declare variables and 'const' is is used to declare constant variables,but we will prefer not to use var, we are going to use let instead untill var is neccessarily requirerd.

*/ 

// writing " ; " is not mandatory in JS but you can prefer to write it for better code understanding.

/* 
You can declare variables to unpack values using the destructuring syntax. For example, const { bar } = foo. This will create a variable named bar and assign to it the value corresponding to the key of the same name from our object foo.
*/

/*
 variables created with var are not block-scoped, but only local to the function (or global scope) that the block resides within.
*/ 

/* JavaScript has three kinds of variable declarations.
var
Declares a variable, optionally initializing it to a value.
let
Declares a block-scoped, local variable, optionally initializing it to a value.
const
Declares a block-scoped, read-only named constant.
*/

/* 
const declarations always need an initializer, because they forbid any kind of assignment after declaration, and implicitly initializing it with undefined is likely a programmer mistake.
*/