import { log, oneOf } from './utils';

// Mapped types allow us to define new types based on existing types,
// by transforming every property of a provided type to create a new type.

// For example we have a product:
interface Product {
    id: number;
    name: string;
    price: number;
}

// And now we want to heave a partial version of our interface for
// overrides, or a readonly version. Creating interfaces manually
// is cumbersome and error prone. It's so much to write, easy to
// forget something, and annoying to adjust when the product interface
// is changed.
interface PartialProduct {
    id?: number;
    name?: string;
    price?: number;
}

interface ReadonlyProduct {
    readonly id: number;
    readonly name: string;
    readonly price: number;
}


// Introducing: The keyof-operator
// The keyof-operator can be applied to types and it results
// in a new type containing all property names of the initial
// type as string literal types in a union type.
type ProductKeys = keyof Product;
// The type of ProductKeys now equals:
// 'id' | name' | 'price'


// By combining the keyof-operator and the indexer-feature for
// types we can create our first mapped type.
type PassThrough<T> = {
    // Mapped types are basically just an index type
    // in combination with the keyof-operator.
    [key in keyof T]: T[key];

    // This looks convoluted at first, but it's rather simply
    // if broken down into pieces:
    // - T:       T is the generic type parameter, it's the type that
    //            our new mapped type will be based on.
    // - keyof T: keyof T results in a union containing string literals
    //            for every property of the type T.
    // - key:     key is just the name of indexer argument.
    // - T[key]:  T[key] creates the magic by using the indexer argument
    //            to retrieve the type of the property with the given
    //            name of the provided type.
    //            Because only specific string literals are allowed
    //            (based on keyof T), and those string literals are
    //            directly taken from the properties of type T,
    //            TypeScript can safely assume that the type T has
    //            a property named "key" and can resolve the type of
    //            the property.

    // Note: The convention is to call the indexer argument "P"
    //       standing for "Property", instead of "key".
    //       So commonly it's: [P in keyof T]: T[P];
}

// Based on our mapped type we can create a type alias.
// PassThroughProduct has the exact same properties as Product.
type PassThroughProduct = PassThrough<Product>;


// The above example is pretty useless, as the type is the same.
// But using mapped types we can create our own partial and
// read-only mapped types, making the types from the beginning
// obsolete.
type Partial<T> = {
    // For our partial mapped type we declare the
    // mapped properties as optional.
    [P in keyof T]?: T[P];
}

type Readonly<T> = {
    // For our read-only mapped type we simply declare the
    // mapped properties as readonly.
    readonly [P in keyof T]: T[P];
}

// The partial one already implicitly changed the type of
// the properties, but we can make it even more explicit.
type Nullable<T> = {
    // Now we make all properties a union type of the
    // original type and null.
    [P in keyof T]: T[P] | null;
}

// The new types have all properties of product, but respectively
// declares as readonly or optional.
type MappedReadonlyProduct = Readonly<Product>;
type MappedPartialProduct = Partial<Product>;
type MappedNullableProduct = Nullable<Product>;

// And mapped types can be nested too.
// This type has all properties of Product, all marked as optional,
// nullable and as readonly.
type MappedReadonlyAndPartialProduct = Readonly<Nullable<Partial<Product>>>;


// We can just assign an existing product to our new partial type.
const cookie: Product = {
    id: 0,
    name: 'Cookie',
    price: 0.99
};
const readonlyCookie: Readonly<Product> = cookie;
log(`Cookie price: ${readonlyCookie.price}`);

// And changes to our object are reflected in the mapped type,
// because it's the same object. Let's make cookies cheaper!
cookie.price = 0.82;
log(`New cookie price: ${readonlyCookie.price}`);


// Mapped types like readonly and partial that allow us to just
// assign the object without transforming the object itself are
// called homomorphic mapped types. That is because the type
// transformation of the mapped types is homomorphic, which means
// that the mapping applies only to the properties of the type T,
// and no others. The compiler knows that it can copy all existing
// property modifiers before adding any new ones.
// See also https://en.wikipedia.org/wiki/Homomorphism


// Unfortunately mapped types have a limitation, as they don't
// allow us to adjust the type based on conditions or work
// recursively for nested objects.
interface Basket {
    products: Product[];
}

// While the products property is readonly, the array itself is
// still mutable. Also the type of the array element is the mutable
// Product, not Readonly<Product>.
type ReadonlyBasked = Readonly<Basket>;

// Good news: This will be possible with TypeScript 2.8 and the
//            introduction of conditional types!


// A more simple example is to have a list of options, then
// create a flags type where each option can be enabled or disabled.
type OptionKeys =
    | 'enableDebugMode'
    | 'logRequests'
    | 'startWorldDomination'
    ;
// Each key is mapped to a boolean, enabling or disabling the feature.
type OptionFlags = { [P in OptionKeys]: boolean; }
const options: OptionFlags = {
    enableDebugMode: true,
    logRequests: true,
    startWorldDomination: false
};


// The types above are just creating a matching type representation.
// We can also replace the type completely, for example a type that
// wraps all properties in a getter-function.
type AccessControl<T> = {
    // Now each property is a function without arguments
    // having the property type as the return type.
    readonly [P in keyof T]: () => T[P];
}

// And we need to create a function to construct our mapped type,
// as the signatures are not compatible anymore.
function controlAccess<T>(object: T): AccessControl<T> {
    // We wrap our own mapped type in a partial, so we can
    // construct it property by property first.
    const result: Partial<AccessControl<T>> = {};

    // Iterating all properties and assigning an accessor method
    // that will log the access.
    for (const key in object) {
        result[key] = () => {
            log(`Key ${key} was just accessed.`);
            return object[key];
        }
    }

    // And unfortunately we need to override the compiler here,
    // because the type of our partial does not match the access
    // control type anymore.
    return result as AccessControl<T>;
}

const accessControlledCookie: AccessControl<Product> = controlAccess(cookie);

// Accessing the product works as before.
log(cookie.name);

// But using our controlled product we now have a function
// that will log the call.
log(accessControlledCookie.name());


// A more common use case is to create an object that has only
// a subset of all properties of another type. A very common use
// case is the React setState-function. We can improve this using
// mapped types too.
type Pick<T, K extends keyof T> = {
    // Instead of applying the keyof-operator on the type T,
    // we now expect the key union-type to be passed as an
    // argument. But they provided keys union type must extend
    // the union type of keyof T, which means we can't
    // accidentally pass invalid keys that don't exist on type T.
    [P in K]: T[P];
}

// Using pick we can now create a special Product type that
// has no id property. As the second type argument for our Pick
// type we provide a union of all properties that we want.
type ProductWithoutId = Pick<Product, 'name' | 'price'>;
const cookieWithoutId: ProductWithoutId = cookie;
// cookieWithoutId.id // Property 'id' does not exist on type.


// Defining own types and always providing the properties as
// a union type is cumbersome, but wrapped in a method it
// ain't so bad. Here's an example adapted from React.
class Component<State> {
    private state!: State;
    setState<K extends keyof State>(newPartialState: Pick<State, K>): void {
        this.state = Object.assign({}, this.state, newPartialState);
    }
}

const productComponent: Component<Product> = new Component<Product>();
productComponent.setState({});
productComponent.setState({ name: 'Delicious Tide pods' });
productComponent.setState({ name: 'Chocolate lava', price: 5.12 });
// Assigning properties not part of Product fails:
// productComponent.setState({ isSoldOut: true });


// Excursion: Why Pick and not Partial?
// One could think we go through the hazzle with Pick and the
// union type of all properties, and why not just use Partial
// making all properties optional and just spreading it to a
// new object. The reason is a tricky little nastyness,
// demonstrated with a merge function.
function merge<T>(full: T, partial: Partial<T>): T {
    const result: T = Object.assign({}, full, partial);
    return result;
}

// This seemingly works fine on a first glance..
const originalMilk: Product = {
    id: 0,
    name: 'Full fat milk',
    price: 1.12
};
const milkWithNewId: Product = merge(originalMilk, { id: 5 });
log(`Id: ${milkWithNewId.id}, name: ${milkWithNewId.name}`);

// But optional properties have the problem that they're not
// only optional, but they can also be explicitly undefined,
// either by explicitly setting the property as undefined or
// by using a function that may return undefined.
const whoopsieMilk: Product = merge(originalMilk, { id: undefined, name: oneOf('Law fat milk', undefined) });
log(`Id: ${whoopsieMilk.id}, name: ${whoopsieMilk.name}`);
// Even though our id property is of type number, it suddenly has
// a value of undefined, and the name property potentially too
// depending on the return value of the function call.
// This wouldn't have happened with Pick, because Pick does not
// modify the types of the properties.


// Using mapped types we can get rather freaky, for example
// we can define a mapped type that will remove a specific property
// by making clever use of intersection types and the never type,
// or even overwriting specific properties with a new type.
type Diff<T extends string | number | symbol, U extends string | number | symbol> = ({ [P in T]: P } & { [P in U]: never } & { [x: string]: never })[T];
type Omit<T, K extends keyof T> = { [P in Diff<keyof T, K>]: T[P] };
type Overwrite<T, U> = { [P in Diff<keyof T, keyof U>]: T[P] } & U;

type AnotherProductWithoutId = Omit<Product, 'id'>;
const anotherProductWithoutId: AnotherProductWithoutId = {
    name: 'Luxury Coffee',
    price: 99.5
};

type ProductWithStringId = Overwrite<Product, { id: string; }>;
const productWithStringId: ProductWithStringId = {
    id: 'such id, very amaze, wow',
    name: 'Doge',
    price: NaN
};

// Or with helper types:
type WithoutId<T extends { id: any; }> = Omit<T, 'id'>;
type WithStringId<T extends { id: any; }> = Overwrite<T, { id: string; }>;


export default {};
