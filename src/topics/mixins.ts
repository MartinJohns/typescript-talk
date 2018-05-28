import { log } from '../utils';

// Mixings are functions that create new classes by extending
// classes with new functionality.

// Define a type alias that represents an object with a constructor
// that accepts zero or more arguments. We can't work with more
// specific types, as every constructor can have arbitrary
// combinations of arguments and types.
type Constructor<T = {}> = new (...args: any[]) => T;


// Define some example mixins. Mixins are functions that take
// a class as an argument and return a new class.
function Timestamped<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        public readonly timestamp = Date.now();
    };
}

// Mixins can take additional arguments too.
function Activatable<TBase extends Constructor>(Base: TBase, initiallyActivated: boolean = false) {
    return class extends Base {
        private _isActivated: boolean = initiallyActivated;

        public get isActivated(): boolean { return this._isActivated; }
        public activate(): void { this._isActivated = true; }
        public deactivate(): void { this._isActivated = false; }
    };
}


// A simple class for demonstration
class User {
    constructor(public name: string) { }
}


// Constructing new classes by calling the mixins.
// Mixins can be combined too.
const TimestampedUser = Timestamped(User);
const ActivatableUser = Activatable(User, true);
const TimestampedActivatableUser = Timestamped(Activatable(User, true));

// And using the new class to create instances.
// Arguments for the constructor of the User class need to be provided.
const newTimestampedUser = new TimestampedUser('Late Joe');
log(newTimestampedUser.timestamp);

const newActivatableUser = new ActivatableUser('Retired Jack');
log(newActivatableUser.isActivated);
newActivatableUser.deactivate();

const newTimestampedActivatableUser = new TimestampedActivatableUser('Ranouta Names');
log(newTimestampedActivatableUser.timestamp);
log(newTimestampedActivatableUser.isActivated);


// But declaring the types of the mixin classes...?
// The mixins are functions that act as classes (constructors),
// they're not valid types.

// We could use an existing instance and the typeof operator...
// But we surely wouldn't want to create an instance just to define a proper type!
type TimestampedUserType = typeof newTimestampedUser;
const typedTimestampedUser: TimestampedUserType = newTimestampedUser;
// And we can't use the type as a constructor to crate new instances.
// const newTypedTimestampedUser: TimestampedUserType = new TimestampedUserType();

// Unfortunately there is no good way for this currently...
// But with TypeScript 2.8 and the conditional types there will be!
type CorrectTimestampedUserType = InstanceType<typeof TimestampedUser> & typeof TimestampedUser;

// But instantiation is still not possible... See issue #2559
// new CorrectTimestampedUserType(..)


// And to reduce code clutter, a nifty generic type for typing mixins.
// Or basically just wrapping the new InstanceType<> type in a different name.
type Mixin<T extends new (...args: any[]) => any> = InstanceType<T>;

const user: Mixin<typeof TimestampedUser> = new TimestampedUser('Bob');


export default {};
