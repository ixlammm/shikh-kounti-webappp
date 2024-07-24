export type SimpleEventListenerType = (...args: any[]) => any;

export class SimpleEventListener<EventType> {
    private _listeners: Map<EventType, SimpleEventListenerType[]>

    constructor() {
        this._listeners = new Map<EventType, SimpleEventListenerType[]>();
    }

    _emit(type: EventType, ...args: any[]): void {
        if (this._listeners.has(type))
            for (let listener of this._listeners.get(type)!)
                listener(...args);
    }

    _on(type: EventType, listener: SimpleEventListenerType): void {
        if (!this._listeners.has(type))
            this._listeners.set(type, []);

        this._listeners.get(type)!.push(listener);
    }
}