// (function(window, document, undefined){
//     var foo = 'Hello';
//     var bar = 'world!';

//     function baz() {
//         return foo + ' ' + bar;
//     }


//     window.foo = foo;
//     window.baz = baz;
// })(window, document);

// console.log(foo);
// console.log(baz());
// console.log(bar);









// var myObject = function(name)
// {
// 	this.name = name;
// 	return this;
// };

// console.log(typeof myObject.prototype);

// myObject.prototype.getName = function()
// {
// 	return this.name;
// }

// // console.log(myObject.prototype.getName);
// console.log(myObject.length);

// console.log(myObject instanceof Function); // true
// console.log(myObject === Function); // false

// console.log(myObject.__proto__ === Function.prototype); // true


// var myInstance = new myObject("foo");
// console.log(myInstance.__proto__ === myObject.prototype); // true

// console.log(myInstance.getName()); // foo

// var mySecondInstance = new myObject("bar");

// console.log(mySecondInstance.getName()); // bar
// console.log(myInstance.getName()); // foo











// Global namespace for this script. This is to prevent variable name conflict with other plugins and frameworks.
// var Eventtest = {};

// // Variables are here...
// Eventtest.first_li = 'first-li';
// Eventtest.second_li = 'second-li';
// Eventtest.third_li = 'third-li';
// Eventtest.fourth_li = 'fourth-li';

// Testing addEventListener.
// #1
// window.addEventListener('load', function() {
// 	Eventtest.element = document.getElementById(Eventtest.first_li);
// 	Eventtest.element.style.color = '#ff0000';
	
// 	console.log("Hello from FIRST 1:", window.performance.now());
// }, false);

// // #2
// window.addEventListener('load', function() {
// 	Eventtest.element = document.getElementById(Eventtest.second_li);
// 	Eventtest.element.style.color = '#0000ff';
	
// 	console.log("Hello from FIRST 2:", window.performance.now());
// }, false);

// // #3
// window.addEventListener('load', testFunc1(), false);

// function testFunc1() {
// 	Eventtest.element = document.getElementById(Eventtest.third_li);
// 	Eventtest.element.style.color = '#ff9600';

// 	console.log("Hello from FIRST 3:", window.performance.now());
// }

// // #4
// window.addEventListener('load', testFunc2(Eventtest.fourth_li), false);

// function testFunc2(id) {
// 	var element = document.getElementById(id);
// 	element.style.color = '#00a21b';

// 	console.log("Hello from FIRST 4:", window.performance.now());
// }

// console.log(window.performance.timing);