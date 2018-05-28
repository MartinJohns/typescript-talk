export function log(message: string | number | boolean): void {
    console.log(message);
}

export function logTimestamped(message: string | number | boolean): void {
    const date: Date = new Date();
    const timestamp: string =
        ('0' + date.getHours()).slice(-2) + ':' +
        ('0' + date.getMinutes()).slice(-2) + ':' +
        ('0' + date.getSeconds()).slice(-2) + '.' +
        ('000' + date.getMilliseconds()).slice(-4);

    console.log(`${timestamp}   ${message}`);
}

export function logSpacer(): void {
    console.log('');
    console.log('---');
    console.log('');
}
