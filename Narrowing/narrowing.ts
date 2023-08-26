// If this mostly looks like uninteresting JavaScript code, that’s sort of the point. Apart from the annotations we put in place, this TypeScript code looks like JavaScript. The idea is that TypeScript’s type system aims to make it as easy as possible to write typical JavaScript code without bending over backwards to get type safety.

// While it might not look like much, there’s actually a lot going on under the covers here. Much like how TypeScript analyzes runtime values using static types, it overlays type analysis on JavaScript’s runtime control flow constructs like if/else, conditional ternaries, loops, truthiness checks, etc., which can all affect those types.

// Within our if check, TypeScript sees typeof padding === "number" and understands that as a special form of code called a type guard. TypeScript follows possible paths of execution that our programs can take to analyze the most specific possible type of a value at a given position. It looks at these special checks (called type guards) and assignments, and the process of refining types to more specific types than declared is called narrowing. In many editors we can observe these types as they change, and we’ll even do so in our examples.

function padLeft(padding: number | string, input: string) {
  if (typeof padding === "number") {
    return " ".repeat(padding) + input;
  }
  return padding + input;
}
// In JavaScript, constructs like if first “coerce” their conditions to booleans to make sense of them, and then choose their branches depending on whether the result is true or false. Values like

// 0
// NaN
// "" (the empty string)
// 0n (the bigint version of zero)
// null
// undefined
// all coerce to false, and other values get coerced to true. You can always coerce values to booleans by running them through the Boolean function, or by using the shorter double-Boolean negation.

// It’s fairly popular to leverage this behavior, especially for guarding against values like null or undefined. As an example, let’s try using it for our printAll function.

function printAll(strs: string | string[] | null) {
  if (strs && typeof strs === "object") {
    for (const s of strs) {
      console.log(s);
    }
  } else if (typeof strs === "string") {
    console.log(strs);
  }
}
// It’s fairly popular to leverage this behavior, especially for guarding against values like null or undefined. As an example, let’s try using it for our printAll function.

function printAll1(strs: string | string[] | null) {
  if (strs && typeof strs === "object") {
    for (const s of strs) {
      console.log(s);
    }
  } else if (typeof strs === "string") {
    console.log(strs);
  }
}

// Keep in mind though that truthiness checking on primitives can often be error prone. As an example, consider a different attempt at writing printAll

function printAll2(strs: string | string[] | null) {
  if (strs) {
    if (typeof strs === "object") {
      for (const s of strs) {
        console.log(s);
      }
    } else if (typeof strs === "string") {
      console.log(strs);
    }
  }
}

// We wrapped the entire body of the function in a truthy check, but this has a subtle downside: we may no longer be handling the empty string case correctly.

// TypeScript also uses switch statements and equality checks like ===, !==, ==, and != to narrow types. For example:

function example(x: string | number, y: string | boolean) {
  if (x === y) {
    // We can now call any 'string' method on 'x' or 'y'.
    x.toUpperCase();

    // (method) String.toUpperCase(): string
    y.toLowerCase();

    // (method) String.toLowerCase(): string
  } else {
    console.log(x);

    // (parameter) x: string | number
    console.log(y);

    // (parameter) y: string | boolean
  }
}
// The in operator narrowing
// JavaScript has an operator for determining if an object or its prototype chain has a property with a name: the in operator. TypeScript takes this into account as a way to narrow down potential types.

type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    return animal.swim();
  }

  return animal.fly();
}

// To reiterate, optional properties will exist in both sides for narrowing. For example, a human could both swim and fly (with the right equipment) and thus should show up in both sides of the in check:

// type Fish = { swim: () => void };
// type Bird = { fly: () => void };
type Human = { swim?: () => void; fly?: () => void };

function move1(animal: Fish | Bird | Human) {
  if ("swim" in animal) {
    animal;

    // (parameter) animal: Fish | Human
  } else {
    animal;

    // (parameter) animal: Bird | Human
  }
}
// instanceof narrowing

function logValue(x: Date | string) {
  if (x instanceof Date) {
    console.log(x.toUTCString());

    // (parameter) x: Date
  } else {
    console.log(x.toUpperCase());

    // (parameter) x: string
  }
}

// Assignments
// As we mentioned earlier, when we assign to any variable, TypeScript looks at the right side of the assignment and narrows the left side appropriately.

let x = Math.random() < 0.5 ? 10 : "hello world!";

x = 1;

console.log(x);

x = "goodbye!";

console.log(x);

//Notice that each of these assignments is valid. Even though the observed type of x changed to number after our first assignment, we were still able to assign a string to x. This is because the declared type of x - the type that x started with - is string | number, and assignability is always checked against the declared type.

// Using type predicates
// We’ve worked with existing JavaScript constructs to handle narrowing so far, however sometimes you want more direct control over how types change throughout your code.

// To define a user-defined type guard, we simply need to define a function whose return type is a type predicate:

function isFish(pet: Fish | Bird | undefined): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

// pet is Fish is our type predicate in this example. A predicate takes the form parameterName is Type, where parameterName must be the name of a parameter from the current function signature.

// Any time isFish is called with some variable, TypeScript will narrow that variable to that specific type if the original type is compatible.

// Both calls to 'swim' and 'fly' are now okay.
function getSmallPet(): Bird | Fish | undefined {
  return;
}
let pet = getSmallPet();

if (isFish(pet)) {
  pet.swim();
} else if (pet !== undefined) {
  pet.fly();
} else {
  console.log("undefined");
}

// Notice that TypeScript not only knows that pet is a Fish in the if branch; it also knows that in the else branch, you don’t have a Fish, so you must have a Bird.

// Discriminated unions
interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  sideLength: number;
}

type Shape = Circle | Square;

// Here, we’ve properly separated Shape out into two types with different values for the kind property, but radius and sideLength are declared as required properties in their respective types.

function getArea(shape: Shape) {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;

    case "square":
      return shape.sideLength ** 2;
  }
}

// The important thing here was the encoding of Shape. Communicating the right information to TypeScript - that Circle and Square were really two separate types with specific kind fields - was crucial. Doing that lets us write type-safe TypeScript code that looks no different than the JavaScript we would’ve written otherwise

// The never type
// When narrowing, you can reduce the options of a union to a point where you have removed all possibilities and have nothing left. In those cases, TypeScript will use a never type to represent a state which shouldn’t exist.

// Exhaustiveness checking
// The never type is assignable to every type; however, no type is assignable to never (except never itself). This means you can use narrowing and rely on never turning up to do exhaustive checking in a switch statement.
type Shape1 = Circle | Square;

function getArea1(shape: Shape1) {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.sideLength ** 2;
    default:
      const _exhaustiveCheck: never = shape;
      return _exhaustiveCheck;
  }
}
