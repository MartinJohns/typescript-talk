// Create "branded" types to make objects nominal typed.
// We use the type intersection to create a fake type that has a "__brand" property.
// In reality a string can't have such a property (JavaScript limitation), but the type-system
// will happily accept it and work with it. It's a pure compile-time type-trick to trick the structural typing.
type FirstName = string & { readonly __brand: 'firstName' };
type LastName = string & { readonly __brand: 'lastName' };

// Use unsafe-casts to map the string to the branded type,
// because we can't normalle construct such a value.
const firstName: FirstName = 'Martin' as FirstName;


// Alternative: Create wrapper-functions to encapsulate the cast to a single location,
//              instead of sprinkling it all over the code-base.
function asFirstName(name: string): FirstName { return name as FirstName; }
function asLastName(name: string): LastName { return name as LastName; }

const lastName: LastName = asLastName('Johns');

export default {};
