import jointz, { ExtractResultType } from 'jointz';

// Create a validator at runtime, defining the structure of the object.
const ThingValidator = jointz.object({
    id: jointz.number().min(1),
    name: jointz.string().minLength(3).maxLength(100)
}).requiredKeys(['id', 'name']);

// Extract the compile-time type based on the inferred type of the validator.
// (Dark black magic using conditional types)
type Thing = ExtractResultType<typeof ThingValidator>;

// Retrieve the data that may or may not match the desired structure.
// Tip: Use unknown instead of any for improved type-safety.
const myObject: unknown = JSON.parse('{ "id": 1, "name": "Martin" }');

// Check if the object matches our structure.
try {
    const thing: Thing = ThingValidator.checkValid(myObject);
    console.log(thing);
} catch (validationErrors) {
    console.log(JSON.stringify(validationErrors, null, 4));
}


// Alternatives:
// - io-ts https://github.com/gcanti/io-ts
// - Joi https://github.com/hapijs/joi
