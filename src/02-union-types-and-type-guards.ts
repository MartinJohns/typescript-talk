import { log, oneOf } from './utils';

// Declaring example types
interface Bird {
    fly(): void;
    layEggs(): void;
}

interface Fish {
    swim(): void;
    layEggs(): void;
}


// Function that either returns a bird or a fish
function getSmallPet(): Bird | Fish {
    return oneOf<Bird, Fish>(
        { fly: () => log("flying"), layEggs: () => log("laying eggs") },
        { swim: () => log("swimming"), layEggs: () => log("laying eggs") }
    );
}


// Unions provide access to all shared members.
// For example: layEggs()
const pet: Bird | Fish = getSmallPet();
pet.layEggs();


// How to access the distinct members of Bird or Fish?
// By asserting the type using one of various type guards.


// Asserting the presence of a member.
// Does the member distinct to Bird exist, then it must be a bird.
// Cast necessary to let us access the member.
if ((pet as Bird).fly) {
    // It's a bird!
    // But the type analysis does recognize the type...
    // Therefor it's a bad approach.
    (pet as Bird).fly();
} else {
    // If we add another pet now, we will end up in this else-block
    // even when we don't a have a fish, resulting in a runtime error.
    // Because we used the as-operator we override any type checks.
    (pet as Fish).swim();
}


// Better approach: User-defined type guards.
// Special functions that instruct the compiler that we guarantee
// that a value is of a specific type.

function isBird(pet: Fish | Bird): pet is Bird {
    // If the pet has a fly member, it must be a Bird.
    return (pet as Bird).fly !== undefined;
}

function isFish(pet: Fish | Bird): pet is Fish {
    // If the pet has a swim member, it must be a Fish.
    return (pet as Fish).swim !== undefined;
}

if (isBird(pet)) {
    // Pet is now narrowed to Bird.
    pet.fly();
} else {
    // Pet is now narrowed to Fish.
    pet.swim();

    // If we add another pet type, this code would now fail,
    // because the type would be narrowed to Fish and the new pet type.
    // We only verified if it's a bird, so in the else-block we only know
    // it's NOT a bird, and not that it IS a fish.
}


// Alternative approach: in-operator
// The in-operator checks if a member with a specific name is present
// in an object. Requires TypeScript 2.7 for narrowing functionality.
if ('fly' in pet) {
    // We ensured the pet has a member named 'fly', so it must be the bird.
    pet.fly();
} else {
    pet.swim();
}


// When dealing with classes: instanceof-operator
// instanceof tests whether the prototype property of a constructor appears
// anywhere in the prototype chain of an object.

// Some dummy code
interface Padder {}
class FirstPadder implements Padder {}
class SecondPadder implements Padder {}
function getPadder(): Padder {
    return oneOf(
        new FirstPadder(),
        new SecondPadder()
    );
}

// Verifying the type
const padder: Padder = getPadder();
if (padder instanceof FirstPadder) {
    log('Is first padder');
} else {
    log('Is second patter');
}


// What about shared members with different types?
interface First {
    first: string;
    shared: boolean;
}

interface Second {
    second: number;
    shared: string;
}

const firstOrSecond: First | Second = oneOf<First, Second>(
    { first: '', shared: true },
    { second: 0, shared: '' });

// firstOrSecond.shared is a union type of all types.
// In this case it's "boolean | string".
firstOrSecond.shared;


// Lastly: Union types are often written with an alternative syntax.
type SmallPet =
    | Bird
    | Fish
    ;


export default {};
