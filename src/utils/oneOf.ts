export function oneOf<T1, T2>(v1: T1, v2: T2): T1 | T2;
export function oneOf<T1, T2, T3>(v1: T1, v2: T2, v3: T3): T1 | T2 | T3;
export function oneOf<T1, T2, T3, T4>(v1: T1, v2: T2, v3: T3, v4: T4): T1 | T2 | T3 | T4;
export function oneOf<T1, T2, T3, T4, T5>(v1: T1, v2: T2, v3: T3, v4: T4, v5: T5): T1 | T2 | T3 | T4 | T5;
export function oneOf(...options: any[]): any {
    const index: number = Math.floor(Math.random() * options.length);
    return options[index];
}
