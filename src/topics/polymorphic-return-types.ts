import { log } from '../utils';

// When dealing with classes and inheritance we might
// sometimes want to return the type of the instance
// from a function, and not the type where the function
// was declared. But when we declare a function in a base
// type, we are not aware of any potential derivates.
// For this we can use polymorphic return types.

// First we define a simple basic calculator with
// a fluent interface.
class BasicCalculator {
    public constructor(protected value: number = 0) { }

    public currentValue(): number {
        return this.value;
    }

    public add(operand: number): BasicCalculator {
        this.value += operand;
        return this;
    }

    public multiply(operand: number): BasicCalculator {
        this.value *= operand;
        return this;
    }
}

// And a demo usage:
log(new BasicCalculator(5)
    .add(1)
    .multiply(5)
    .currentValue());


// But we might need a more specialized version, providing
// scientific functions. But we don't want to pollute the
// basic calculator with unnecessary complexity. So we opt
// for inheritance.
class ScientificCalculator extends BasicCalculator {
    public constructor(value: number) { super(value); }

    public sin(): ScientificCalculator {
        this.value = Math.sin(this.value);
        return this;
    }
}

// But now when we want to use this we will run into trouble.
log(new ScientificCalculator(5)
    .sin()
    .add(5)
    // .sin()
    .currentValue());
// We can't call sin() anymore after we've called .add(),
// that is because the function add() returns a BasicCalculator,
// not a Scientific one. But we can't make add() return a scientific
// calculator, because we're not aware of its existance at that step,
// and it would reduce in cyclic dependencies.


// To fix this issue we can make use of the polymorphic return type.
// By returning "this" as the type we notify the TypeScript compiler
// that it will be the type of the instance we're calling the function
// on. Here's a fixed version of our calculators:
class PolyBasicCalculator {
    public constructor(protected value: number = 0) { }
    public currentValue(): number { return this.value; }

    public add(operand: number): this {
        this.value += operand;

        // We could not return a new instance of PolyBasicCalculator,
        // we must return the current instance again.
        // return new PolyBasicCalculator(this.value);

        return this;
    }

    public multiply(operand: number): this {
        this.value += operand;
        return this;
    }
}

class PolyScientificCalculator extends PolyBasicCalculator {
    public constructor(value: number = 0) { super(value); }

    public sin(): this {
        this.value = Math.sin(this.value);
        return this;
    }
}

// And now we can use the calculator as expected:
log(new PolyScientificCalculator(5)
    .sin()
    .add(5)
    .sin()
    .currentValue());
