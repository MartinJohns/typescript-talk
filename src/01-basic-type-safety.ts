interface Todo {
    description: string;
    dueDate: string;
    isCompleted: boolean;
}

// Explicitly typed object literals avoid rogue properties
function getTodo(): Todo {
    const result = {
        description: 'Prepare TypeScript talk',
        dueDate: '2018-02-14',
        isCompleted: false
    };

    return result;
}

// as-operator offers no type safety!
const todo: Todo = {} as Todo;

// Using any removes all type-safety.
// A value of any type can be assigned to a 'any' typed variable:
const anyValue: any = 1234;

// And worse: A variable of type 'any' can implicitly assigned to any other type!
const myString: string = anyValue; // anyValue is actually a number!


// Better alternative to 'any': unknown
// unknown is a new replacement to any and got introduced in TypeScript 3.0 (July 2018)

// A variable of any type is assignable to a variable typed 'unknown':
const unknownValue: unknown = 'hello world';

// But unknown can not be assigned to any other type:
// const myNumber: number = unknownValue;

// Actual type of the variable must be checked (see the next chapter),
// but a brief example:
if (typeof unknownValue === 'number') {
    unknownValue; // Type is now 'number' within the if-block.
}

export default {};
