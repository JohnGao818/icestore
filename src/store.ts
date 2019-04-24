
import { React } from './types';
import * as isFunction from 'lodash.isfunction';
export default class Store {
    private state: {[name: string]: any} = {};

    private methods = {};

    private queue = [];

    private react: React;

    public constructor(bindings: object, react: React) {
        this.react = react;
        for (const key in bindings) {
            const value = bindings[key];

            if (isFunction(value)) {
                this.methods[key] = this.createMethod(value);
            } else {
                this.state[key] = value;
            }
        }
    } 

    private createMethod(fun) {
        return async (...args) => {
            const newState = {...this.state};
            await fun.apply(newState, args);
            this.setState(newState);
        };
    }

    private setState(newState) {
        this.state = newState;
        const queue = [].concat(this.queue);
        this.queue = [];
        queue.forEach(setState => setState(newState));
    }

    public useStroe() { 
        const [, setState] = this.react.useState();
        this.react.useEffect(() => {
            const index = this.queue.length;
            this.queue.push(setState);
            return () => {
                this.queue.splice(index, 1);
            };
        });

        return { ...this.state, ...this.methods };
    }
}