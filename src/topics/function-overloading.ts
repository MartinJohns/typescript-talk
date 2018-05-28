import { assertNever, log } from '../utils';

// TypeScript allows to overload functions with multiple signatures.

// As an example we have a function that returns a random value,
// depending on an argument it will be either a number or a string.
function getRandomValueNotOverloaded(kind: 'number' | 'string'): number | string {
    if (kind === 'number') {
        return Math.random() * 100;
    } else if (kind === 'string') {
        return (Math.random() * 100).toString();
    }

    return assertNever(kind);
}

// But even tho we know the function returns us a number when
// passing 'number', the return type is number | string.
const randomNumber: number | string = getRandomValueNotOverloaded('number');


// By overloading we can inform TypeScript that that function
// will return different types, depending on the arguments.
// For this to work we simply add further function declarations
// without a body. The function declaration with the implementation
// must be compatible all function declarations.
function getRandomValueOverloaded(kind: 'number'): number;
function getRandomValueOverloaded(kind: 'string'): string;
function getRandomValueOverloaded(kind: 'number' | 'string'): number | string {
    if (kind === 'number') {
        return Math.random() * 100;
    } else if (kind === 'string') {
        return (Math.random() * 100).toString();
    }

    return assertNever(kind);
}

// If we now call our overloaded function Typescript identifies
// the correct return type.
const randomString: string = getRandomValueOverloaded('string');

// It's worth noting that the auto completion does not show the
// third function signature with the combined values, it only
// shows the overloads.
// getRandomValueOverloaded(..)
