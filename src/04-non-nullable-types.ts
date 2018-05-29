import { oneOf, log } from "./utils";

// Introduced with TypeScript 2.0,
// and by my opinion THE killer feature.

// The problem:
// Every type can be "undefined" or "null".
//// function add(first: number, second: number): number {
////     if (first > 0 && second > 0) {
////         return first + second;
////     }
////
////     // Returns implicitly undefined, even if we want a "number".
//// }

// Passing undefined or null results in no error.
//// add(undefined, 5);
//// add(3, null);

// Enable non-nullable types.

// Enabling "strictNullChecks" will change the semantics
// of "undefined" and "null" from values to types.
// This means "undefined" and "null" are now types.


// What if we want to return undefined?
// Use a union type!
function addMaybe(
    first: number | undefined,
    second: number | undefined
): number | undefined {
    if (first !== undefined && second !== undefined) {
        return first + second;
    }

    return undefined;

    // Note: return null would fail,
    //       because null is a different type than undefined.
}


// Type guards can make the checking a bit more easy to read,
// especially when you can have undefined and null.
function isDefined<T>(value: T | undefined | null): value is T {
    return value !== undefined && value !== null;
}

function addMaybeAgain(
    first: number | undefined | null,
    second: number | undefined | null
): number | undefined {
    if (isDefined(first) && isDefined(second)) {
        return first + second;
    }

    return undefined;
}


// Optional members are implicitly possibly undefined:
interface Result {
    // Type of data is string | undefined,
    // but only if strictNullChecks are enabled.
    data?: string;
}

// Type of argument data is string | undefined,
// but only if strictNullChecks are enabled.
function getResult(data?: string): Result {
    return { data };
}

// Members can be undefined and non-optional:
interface Person {
    name: string;
    job: string | undefined;
    age?: number;
}

// Invalid assignments are prevented by the compiler:
const person: Person = { name: 'Bob', job: 'Builder' };
// Errors:
// person.name = undefined;
// person.name = null;
// person.age = null;
// Works fine:
person.job = oneOf(undefined, 'Worker');
person.age = undefined;

// Prevents us from accessing undefined objects
// Compiler error, because type "undefined" has no method "toString",
// and job is a union type of "string | undefined".
// person.job.toString();

// But checking for undefined first works:
if (person.job !== undefined) {
    log(person.job.toString());
}


// The non-null assertion operator
// Overwrites compiler type-check for nullable types,
// aka "I'm smarter than the compiler" (no matter if it's true or not)
// ⚠️ use with caution ⚠️
// log(person.job!.toString()); // Will possibly blow up at runtime!


// Limitations of control flow type checker:
// Narrowed type does not leave inner-function scope.

// Example:
const peopleMaybe: (Person | undefined)[] = [
    { name: 'Sweeney', job: 'Barber' },
    undefined,
    { name: 'Gandalf', job: 'Wizard' }
];
const namesOfPeople: string[] = peopleMaybe
    .filter(personMaybe => personMaybe !== undefined)
    // Compiler error, the narrowed type in filter() is not
    // flowing to the next map() call. We would need to use
    // the non-null assertion operator, which might hide bugs.
    .map(personSurely => personSurely!.name);
log(namesOfPeople.join(','));

// Alternative approach using reduce:
const namesOfPeopleAgain: string[] = peopleMaybe.reduce(
    (accumulator: string[], current: Person | undefined) => {
        if (current !== undefined) {
            accumulator.push(current.name);
        }

        return accumulator;
    },
    []);
log(namesOfPeopleAgain.join(','));

// Or introduce a helper function:
function reduceDefined<T, TResult>(
    items: (T | undefined | null)[],
    action: (value: T) => TResult
): TResult[] {
    return items.reduce(
        (accumulator: TResult[], current: T | undefined | null) => {
            if (isDefined(current)) {
                accumulator.push(action(current));
            }

            return accumulator;
        },
        []);
}

const namesOfPeopleForTheLastTime: string[] = reduceDefined(peopleMaybe, person => person.name);
log(namesOfPeopleForTheLastTime.join(','));


// Members in classes
class SomeClass {
    private valid: boolean;
    private unspecified: string | undefined;

    constructor() {
        // valid is non-nullable,
        // it must be defined in the constructor.
        this.valid = true;
    }
}

class AnotherClass {
    constructor() {
        // Work is moved to a init-function.
        this.init();
    }

    private init(): void {
        // Data is initialized here,
        // but the control flow based type checker does not
        // realize init() is always called by the constructor.
        this.data = 'secret passwords be here';
    }

    // But using the definite assignment operator
    // we enusre the compiler that the member is initialized.
    // ⚠️ use with caution ⚠️
    // Requires TypeScript 2.7
    private data!: string;
}


// TypeScript still transpiles to JavaScript,
// and in JavaScript we lose all type information.
// This means that all data that comes from beyond application control
// has to be considered unsafe and will possibly not match the type definition.

// Example 1: Calling a JavaScript object, which according to the declaration file
//            will never return undefined and always an object. The declaration file
//            does not match the reality of the implementation.
import { unsafeGetObject } from './utils';

// Replacing true with false will cause the function to return undefined,
// resulting in a runtime error.
log(unsafeGetObject(true).name);


// Example 2: Data coming from JSON
interface MyObject {
    name: string;
    age: number;
}

const myObject: MyObject = JSON.parse(`{ "name": null }`);
log(myObject.name); // Expected string, but is null.
log(myObject.age); // Expected number, but is undefined.


export default {};
