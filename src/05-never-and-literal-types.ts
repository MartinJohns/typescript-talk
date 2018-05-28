// never is a special type that does not represent a value.
// It represents the concept that a case can never happen.

// never as a return type
// Writing a method that throws a special Error in code paths
// that should never be reached.
function throwErrorPoorly(message: string): void {
    throw new Error(message);
}

function throwErrorPoorlyDemo(val: boolean): number {
    if (val) {
        return 42;
    }

    // Poor example, but expect val to be always true.
    // Otherwise we have a bug and want to throw an error.
    throwErrorPoorly('val was not true!');

    // We know this code can't be reached... Yet the compiler
    // will not warn us if we add dead code here.
    return 666;
}

// Better using never
// By defining the return type as never we instruct the compiler
// that this function will never return. The compiler will ensure
// that no execution path returns a value.
function throwErrorAwesomely(message: string): never {
    // This will not compile:
    // return true;

    throw new Error(message);
}

function throwErrorAwesomelyDemo(val: boolean): number {
    if (val) {
        return 42;
    }

    throwErrorAwesomely('val was not true!');

    // The compiler will warn about dead code... Or at least it should,
    // it could, but it does not.. yet. There's an open issue: #12825
    return 666;
}


// Second use case: Type exhaustion check
function toStringPoorly(value: number | boolean): string {
    if (typeof value === 'number') {
        return value.toString();
    } else if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
    }

    // The type of value is now "never",
    // because we checked all other types.
    value;

    // If we would add a case to the union, the type would be
    // the left over types from the union, and not never.
    return '';
}


// Literal types are types that only accept
// a single constant as a value.

// Literal types are defined by creating a type alias to a constant.
type LiteralName = 'name';


// Literal types only accept their constant value as an argument.
function demo1(val: LiteralName): void {}
function demo2(val: 'name'): void {}

// Works
demo1('name');
demo2('name');

// Error
// demo1('test');
// demo2('value');


// Variable values can't be passed either, even if the value matches.
// Type string is not compatible with type 'name'.
const value: string = 'name';
// demo1(value);

// First checking if the value matches works, but is cumbersome
if (value === 'name') {
    demo1(value);
}

// Alternative workaround by telling TypeScript to ignore the type error.
// ⚠️ don't use this, it hides bugs (potentially invalid values) ⚠️
// ⚠️ better approach below ⚠️
demo1(value as 'name');


// Combining literal types and union types is a great way to define
// a list of possible values.
type Kind = 'string' | 'number';

function getValue(kind: Kind): string | number {
    if (kind === 'number') {
        return 42;
    } else if (kind === 'string') {
        return 'Deep thoughts';
    }

    // Can this code be reached?
    // Yes, if type-safety is turned off using the as-operator,
    // or when data from across application boundary is used.
    throw new Error(`Invalid kind: ${kind}`);
}


// Safely ensuring a variable value is one of the defined
// values by writing a type-guard.
function isKindPoorly(kind: string): kind is Kind {
    switch (kind) {
        case 'string':
        case 'number':
            return true;

        default:
            return false;

        // Poor implementation, because invalid results can be returned.
        // The compiler won't stop us because we're responsible for
        // ensuring the string matches the type Kind.
        case 'invalid':
            return true;

        // Also, if we ever add a new literal type to the union
        // it's very easy to forget to add the case to this guard.
    }
}

// A better approach:
function isKindBetter(kind: string): kind is Kind {
    // First instruct the compiler to understand the string as our type:
    const casted: Kind = kind as Kind;

    // But still verify the value:
    switch (casted) {
        // TypeScript now realizes we're checking for a "Kind"
        // and will only allow us to add valid cases:
        case 'string':
        case 'number':
            return true;

        default:
            return false;

        // This now does not compile anymore, because 'invalid' is not
        // a valid case of the Kind union type.
        // case 'invalid':
        //     return true;
    }
}

// But we still did not ensure that new cases are considered.
// never to the rescue!

// By defining a function that only accepts never we can take
// advantage of the type exhaustion checks.
function ensureNever(never: never): void {
    // No implementation, purely for type-checks.
}

function isKindBest(kind: string): kind is Kind {
    const casted: Kind = kind as Kind;
    switch (casted) {
        case 'string':
        case 'number':
            return true;

        default:
            // If we checked all cases of the union the type will now
            // be never thanks to the type exhaustion. But if we add a
            // new union case that is not checked above, the type will
            // be the leftover union type and not never, which then
            // results in a type error: The function accepts a never type,
            // but gets the leftover union type.
            ensureNever(casted);
            return false;
    }
}


// Literal numbers can be used too
type Dice = 1 | 2 | 3 | 4 | 5 | 6;

function isCriticalHit(dice: Dice): boolean {
    if (dice === 6) {
        // Type is now narrowed to the literal 6,
        // checking for any other value would result in an error.
        // if (dice === 5) <-- Can't be.
        return true;
    }

    return false;
}


export default {};
