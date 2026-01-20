// API stands for Application Programming Interface it provides an interface for fetching(send or receiving) resources.
// it uses request and response objects.
//syntax -> let promise = fetch(url,[options])

const URL = "https://cat-fact.herokuapp.com/facts";
let promise = fetch(URL);
console.log(promise);
