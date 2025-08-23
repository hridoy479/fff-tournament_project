import { EventEmitter } from 'events';

export const appEventEmitter = new EventEmitter();

export const JOIN_SUCCESS_EVENT = 'joinSuccess';