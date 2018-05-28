interface Todo {
    description: string;
    dueDate: string;
    isCompleted: boolean;
}

// Explicitly typed object literals avoid rogue properties
function getTodo(): Todo {
    const result = {
        description: 'Prepare TypeScript talk',
        dueDate: '2018-02-14',
        isCompleted: false
    };

    return result;
}

// as-operator offers no type safety!
const todo: Todo = {} as Todo;


export default {};
