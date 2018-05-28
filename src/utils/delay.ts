export function delay(milliseconds: number): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, milliseconds));
}

export async function delayWithResult<T>(result: T, milliseconds: number) {
    await delay(milliseconds);
    return result;
}

export async function retrieve<T>(functor: () => T | Promise<T>): Promise<T> {
    return await functor();
}

export async function properRace<T1, T2>(
    first: Promise<T1>,
    second: Promise<T2>
): Promise<{ promise: Promise<T1 | T2> }> {
    // Promise.race is a function that will return a new
    // Promise and gets passed an iterable of Promises.
    // The result of the new Promise will be the result of
    // the first finished promise.
    // Unfortunately there is no way to identify which
    // Promise was the one finished.

    // As a workaround we instead create an array of the
    // promises, then create new promises that will return
    // the index of the respective promise.
    const promiseArray: Promise<T1 | T2>[] = [first, second];
    const indexPromises: (Promise<number>)[] = 
        promiseArray.map((promise, index) => promise.then(() => index));
    
    // Our promises returning an index can now be used with
    // Promise.race, and we use the index to look up the
    // original promise.
    const firstFinishedIndex: number = await Promise.race(indexPromises);
    const firstFinishedPromise: Promise<T1 | T2> = promiseArray[firstFinishedIndex];

    // We need to wrap the promise in an object, otherwise
    // the promise will become part of the JavaScript Promise
    // chain and we will get the result of that promise.
    return {
        promise: firstFinishedPromise
    };
}
