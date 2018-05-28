import { delay, delayWithResult, logTimestamped as log, logSpacer, retrieve, properRace } from '../utils';

// TypeScript provides with async & await a feature to write
// asynchronous code in a synchronous fashion by utilizing
// the existing Promise chains. async & await is just using
// Promises under the hood.

// await is not allowed in module scope, so we need to wrap
// the demo code in a async function. The details come later,
// ignore for now. It's just an async function that is
// immediately invoked.
(async () => {
    // Assuming you want to write a function that prints 5 numbers,
    // one after another with a delay of a half second each. This is
    // how you would write it using promises directly using callbacks.
    const printNumbersDelay: number = 400;
    const printNumbers: Promise<void> =
        delay(printNumbersDelay).then(() => {
            log(1);
            return delay(printNumbersDelay).then(() => {
                log(2);
                return delay(printNumbersDelay).then(() => {
                    log(3);
                    return delay(printNumbersDelay).then(() => {
                        log(4);
                        return delay(printNumbersDelay).then(() => {
                            log(5);
                        });
                    });
                });
            });
        });
    // What a callback hell!

    // Wait for the demo code to finish.
    await printNumbers;
    logSpacer();


    // We could also write it using a recursive function.
    // It's a lot better, but still a lot of mental overhead.
    const printNumbersRecursively: Promise<void> = new Promise<void>(resolve => {
        (function printNumbersRecursion(currentNumber: number): void {
            delay(printNumbersDelay).then(() => {
                log(currentNumber + 1);

                if (currentNumber !== 4) {
                    printNumbersRecursion(currentNumber + 1);
                } else {
                    resolve();
                }
            });
        })(0)
    });

    // Wait for demo code to finish.
    await printNumbersRecursively
    logSpacer();

    
    // It becomes even worse if you want to run two operations
    // in parallel, e.g. showing a progress bar while a file is
    // downloading. The more concurrent operations, the messier
    // the code.
    log('Download started...');
    let downloadFinished: boolean = false;
    const downloadFile: Promise<void> = delay(3000).then(() => {
        downloadFinished = true;
        log('Download finished.');
    });
    (function reportProgress(): void {
        if (!downloadFinished) {
            log('Still downloading...');
            delay(1000).then(reportProgress);
        } else {
            log('Download finished, stop reporting.');
        }
    })();
    // We have to keep a variable in this scope to determine
    // if the download finished, we need to keep the download
    // promise, and additionally we need to define a report function
    // that is called recursively... So much overhead.

    // Wait for the demo code to finish.
    await downloadFile;
    logSpacer();


    // Using async and await we can streamline both examples.

    // await is a special keyword that allows us to wait in a
    // seemingly synchronously fashion for a Promise to finish.
    // For example we want to write a log statement after a
    // a specific delay, so we can just use a Promies that will
    // resolve after a few seconds and "await" for that promise
    // to finish.
    log('Starting to wait...');
    await delay(2000);
    log('Finished waiting.');
    logSpacer();

    // Await can be called on any Promise. If the Promise returns
    // a value, the await statement will return the result.
    const delayedResultPromise: Promise<string> = delayWithResult('data', 1000);
    const delayedResult: string = await delayedResultPromise;
    const delayedResultDirectly: string = await delayWithResult('secret data', 1000);
    log(delayedResult);
    log(delayedResultDirectly);
    // And the promise itself is of course just an object.
    log(typeof delayedResultPromise);

    // Await can also be called on values directly, in which case
    // await returns the value directly with no delay.
    const immediateResult: string = await 'constant string';
    log(immediateResult);

    // This provides the flexibility to pass functors that either
    // provides a value synchronously or asynchronously.
    log(await retrieve(() => 'Immediate result'));
    log(await retrieve(() => delayWithResult('Delayed result', 1000)));
    logSpacer();


    // Await can only be used in asynchronous functions. Functions are made
    // asynchronous by using the "async" modifier flag. Async functions
    // must have a Promise as the return type, and return values are
    // implicitly wrapped in a promise.
    async function myAsyncFunction(): Promise<string> {
        return 'return value';
    }
    // As mentioned, the return value is implicitly wrapped in a Promise.
    // So the return value of the function call is NOT a string, but a Promise.
    log(typeof myAsyncFunction());
    log(typeof await myAsyncFunction());
    logSpacer();


    // Using async and await we can rewrite the first example
    // in a more straight-forward fashion. No callback hell!
    async function printNumbersAsync(): Promise<void> {
        for (let i = 0; i < 5; ++i) {
            await delay(printNumbersDelay);
            log(i + 1);
        }
    }
    await printNumbersAsync();
    logSpacer();


    // Or the download file function with progress reporting.
    async function downloadFileAsync(): Promise<string> {
        log('Download started.');
        const downloadPromise: Promise<string> = delayWithResult('file data', 3000);

        // We still need a variable to track if we finished,
        // but at least it's encapsulated.
        let downloadFinished: boolean = false;
        downloadPromise.then(() => downloadFinished = true);

        while (!downloadFinished) {
            log('Downloading...');
            await delay(1000);
        }

        // Unwrap the promise and return the result.
        log('Download finished.');
        return await downloadPromise;
    }
    log(await downloadFileAsync());
    logSpacer();

    // Or write it smarter with utility functions.
    async function downloadFileAsyncSmart(): Promise<string> {
        log('Download started.');
        const downloadPromise: Promise<string> = delayWithResult('smart file data', 3000);

        while ((await properRace(downloadPromise, delay(1000))).promise !== downloadPromise) {
            log('Downloading...');
        }

        log('Download finished.');
        return await downloadPromise;
    }
    log(await downloadFileAsyncSmart());
})();
