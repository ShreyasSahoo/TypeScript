"use strict";
function greet(person, date) {
    console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}
//Most TypeScript-specific code gets erased away, and likewise, here our type annotations were completely erased.
