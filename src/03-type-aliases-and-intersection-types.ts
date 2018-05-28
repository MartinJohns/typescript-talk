import { log } from './utils';

// Type aliases give types a name for reference.
// Type aliases can be added for...

/* Object definitions */ type SonmeObject = { data: string; }
/* Primitive types */    type Name = string;
/* Functions */          type NameResolver = () => Name;
/* Union types */        type NameOrNameResolver = Name | NameResolver;
// Or basically to all type definitions...

// Makes code more expressive
function getNamePoorly(nameOrResolver: string | (() => string)): string {
    return typeof nameOrResolver === 'string'
        ? nameOrResolver
        : nameOrResolver();
}

function getNameAwesomely(nameOrResolver: NameOrNameResolver): Name {
    return isNameResolver(nameOrResolver)
        ? nameOrResolver()
        : nameOrResolver;

    // Small helper type-guard.
    function isNameResolver(x: NameOrNameResolver): x is NameResolver {
        return typeof x === 'function';
    }
}


// From the TypeScript spec:
// "An interface can be named in an extends or implements clause, but a type alias for an object type literal cannot."
// This was changed in TypeScript 2.2 via #13604, but the spec is not updated yet.
interface ExtendedObject extends SonmeObject {
    extended: string; // Works in TypeScript 2.2+
}


// Intersection types are an intersection of types,
// meaning all members of both types are present.
interface Person {
    name: string;
}

class Logger {
    public log = function() {
        // @ts-ignore
        log(JSON.stringify(this));
    }
}

type LoggablePerson = Person & Logger;

const loggablePerson: LoggablePerson = Object.assign(
    { name: 'Bob' },
    new Logger());
log(loggablePerson.name);
loggablePerson.log();


// Intersection types with generic type arguments works too.
type LinkedList<T> = T & { next?: LinkedList<T>; }

const people: LinkedList<Person> = {
    name: 'Martin',
    next: {
        name: 'Bob',
        next: {
            name: 'John'
        }
    }
};

function printPeople(list: LinkedList<Person>): void {
    log(list.name);
    if (list.next) {
        printPeople(list.next);
    }
}

printPeople(people);


// Better example:
// Combining multiple lookup maps,
// e.g. routes to different modules.
type HomeRoutes = {
    home: {
        index: string;
        about: string;
    }
}

type UserRoutes = {
    user: {
        edit: string;
        delete: string;
    }
}

// Now combining all routes to a single type.
type AllRoutes = HomeRoutes & UserRoutes;

// And example code:
const homeRoutes: HomeRoutes = { home: { index: '/home/index', about: '/home/about' } };
const userRoutes: UserRoutes = { user: { edit: '/user/edit', delete: '/user/delete' } };
const allRoutes: AllRoutes = Object.assign({}, homeRoutes, userRoutes);

log(allRoutes.home.about);
log(allRoutes.user.delete);


export default {};
