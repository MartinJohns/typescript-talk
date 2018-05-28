import { oneOf } from "./utils";

// By combining unions and literal types we can construct
// discriminated unions. Discriminated unions are unions
// that are identified by a discriminator property, often
// called "type" or "kind". The discriminator must be a
// literal type.

// Defining different shapes with a "kind" discriminator:
interface Square {
    kind: 'square';
    size: number;
}
interface Rectangle {
    kind: 'rectangle';
    width: number;
    height: number;
}
interface Circle {
    kind: 'circle';
    radius: number;
}

// Now define our discriminated union:
type Shape = Square | Rectangle | Circle;

// When constructing a shape we need to define the kind of it.
// Based on the kind TypeScript identifiers what properties exist.
const shape: Shape = oneOf<Square, Rectangle, Circle>(
    { kind: 'square', size: 10 },
    { kind: 'rectangle', width: 5, height: 15 },
    { kind: 'circle', radius: 12 }
);

// As demonstrated when the unions were introduced,
// the member "kind" that is shared across all types
// has the type that is a union of all types.
const shapeKind: 'square' | 'rectangle' | 'circle' = shape.kind;

// Constructing invalid kinds is not possible:
// Property "kind" has incompatible types: 'cylinder' is not
// assignable to 'square' | 'rectangle' | 'circle'.
// const invalidShape: Shape = { kind: 'cylinder', radius: 5, height: 20 };

// Adding roque properties is also prevented, because TypeScript
// correctly identifies the type of the object literal we want
// to create based on the kind.
// The property "tooMuch" does not exist on hte type "Square".
// const squareShape: Shape = { kind: 'square', size: 5, tooMuch: true };


// Based on the kind TypeScript narrows the type and lets us safely
// access the properties of the types.
function getArea(shape: Shape): number {
    // The only known/common property on shape is the kind.
    switch (shape.kind) {
        case 'square':
            // Based on the kind and the literal 'square' we narrowed
            // the type down to Square. Now we can access the square
            // properties.
            return shape.size * shape.size;

        case 'rectangle':
            return shape.height * shape.width;

        case 'circle':
            return Math.PI * shape.radius ** 2;
        
        default:
            // And thanks to exhaustive checking the type of "shape"
            // is now never. This can happen when an object was wrongly
            // constructed or comes from across application boundary.
            
            // As this is almost always an error, we want to do two things:
            // - During compilation get an error, if we added a new shape
            //   and didn't update this function.
            // - During runtime throw an Error, because otherwise TypeScript
            //   requires us to return a number, which makes no sense for an
            //   unknown shape.
            
            // If we throw an Error here, we would only solve the second case.
            // But by using a helper function and the never type we can solve
            // both cases.
            return assertNever(shape);

            // During compilation, TypeScript ensures the type of shape is
            // never, due to type exhaustion. During runtime the function
            // will throw an Error.
    }
}

function assertNever(value: never): never {
    throw new Error(`Unexpected value: ${value}`);
}


export default {};
