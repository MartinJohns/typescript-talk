import { log } from './utils';

// Index types provider the option to access members based
// on an index.

interface Country {
    name: string;
}

interface CountryMap {
    // countryCode is the index value that is passed. The name can
    // be anything and is not used, but serves as inline-documentation.
    // The type can either be string or number, other types are not
    // supported because JavaScript does not support them.
    [countryCode: string]: Country;
}

// Index types can be constructed using the object literal syntax.
// The name of the properties are the index keys.
const countryMap: CountryMap = {
    'de': { name: 'Germany' },
    'nl': { name: 'Netherlands' }
};

// And values are retrieved using the index-syntax.
const germany: Country = countryMap['de'];
log(germany.name);

// New values can be added using the same syntax.
countryMap['dk'] = { name: 'Denmark' };
log(countryMap['dk'].name);


// Index types and strictNullChecks
// A serious gotcha with index types comes in combination with
// strictNulLChecks, which is supposed to protect us from accessing
// potentially undefined values.

// Even tho we defined that the indexer returns Country, it still can
// return undefined when we access unknown keys.
const shouldBeFrance: Country = countryMap['fr'];
log(shouldBeFrance === undefined ? '<missing>' : shouldBeFrance.name);

// This was a design decision by the TypeScript team, as commonly
// a indexers are used with known keys only, and the effort for the
// developer to always check for undefined when using an indexer
// was deemed too high. There's an open issue to at least introduce
// a compiler flag to enable such behavior: #13778

// More type safety can be added manually by being more explicit with
// the return type of the indexer type.
interface MaybeCountryMap {
    // By being explicit that this can return either a Country or undefined
    // we force the compiler to recognize the case of missing keys. 
    [countryCode: string]: Country | undefined;
}

// And now we either have a Country or undefined when accessing the indexer.
const maybeCountryMap: MaybeCountryMap = {
    'de': { name: 'Germany' },
    'nl': { name: 'Netherlands' }
};
const maybeFrance: Country | undefined = maybeCountryMap['fr'];
if (maybeFrance) {
    log(`We found ${maybeFrance.name}!`);
} else {
    log('France is missing.');
}


// An indexer type can also have "known properties",
// allowing to mix variable values with a fixed set of keys.
interface ServerOptions1 {
    hostName: string;

    [optionName: string]: string | undefined;
}
const serverOptions1: ServerOptions1 = {
    hostName: 'localhost',
    isDebug: 'true'
}

// Known properties can be accessed like regular properties,
// or by using the indexer.
log(serverOptions1.hostName);
log(serverOptions1['hostName']);
log(serverOptions1['isDebug'] || 'unspecified');
log(serverOptions1['missing'] || 'unspecified');

// The types of the properties can even be different,
// but the indexer type has to be at least a union of all
// types of the known properties.
interface ServerOptions2 {
    hostName: string;
    port: number;
    isDebug: boolean;

    [optionName: string]: string | number | boolean | undefined;
}
const serverOptions2: ServerOptions2 = {
    hostName: 'localhost',
    port: 8080,
    isDebug: true,
    administrator: 'Martin'
};

// Type of known properties is known even when using the indexer.
const hostName1: string = serverOptions2.hostName;
const port1: number = serverOptions2.port;
const isDebug1: boolean = serverOptions2.isDebug;

const hostName2: string = serverOptions2['hostName'];
const port2: number = serverOptions2['port'];
const isDebug2: boolean = serverOptions2['isDebug'];

// Type of unknown properties or when using a variable key
// is the union type.
const administratorKey: string = 'administrator';
const administrator1: string | number | boolean | undefined = serverOptions2['administrator'];
const administrator2: string | number | boolean | undefined = serverOptions2[administratorKey];

// Assignment to known properties is type safe.
serverOptions2.hostName = 'www.google.com';
serverOptions2['hostName'] = 'www.google.com';

// Assigning wrong types to known properties fails.
// serverOptions2.hostName = true;
// serverOptions2['hostName'] = true;


// But warning: Assignment using a variable key is not type safe,
// even when it's a known property!
const hostNameKey: string = 'hostName';
serverOptions2[hostNameKey] = true;

// Now our runtime type does not match our compilation type anymore!
const wrongHostName: string = serverOptions2.hostName;
log(typeof wrongHostName); // 'boolean'


// All regular objects have an implicit indexer for all known properties.
log(germany['name']);


// And lastly: Types of properties can be referenced using the indexer too.
type CountryNameType = Country['name'];


export default {};
