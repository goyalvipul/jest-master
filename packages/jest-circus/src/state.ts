/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Circus} from '@jest/types';
import {STATE_SYM} from './types';

import {makeDescribe} from './utils';
import eventHandler from './eventHandler';
import formatNodeAssertErrors from './formatNodeAssertErrors';

const eventHandlers: Array<Circus.EventHandler> = [
  eventHandler,
  formatNodeAssertErrors,
];

export const ROOT_DESCRIBE_BLOCK_NAME = 'ROOT_DESCRIBE_BLOCK';

const ROOT_DESCRIBE_BLOCK = makeDescribe(ROOT_DESCRIBE_BLOCK_NAME);
const INITIAL_STATE: Circus.State = {
  currentDescribeBlock: ROOT_DESCRIBE_BLOCK,
  currentlyRunningTest: null,
  expand: undefined,
  hasFocusedTests: false, // whether .only has been used on any test/describe
  includeTestLocationInResult: false,
  parentProcess: null,
  rootDescribeBlock: ROOT_DESCRIBE_BLOCK,
  testNamePattern: null,
  testTimeout: 5000,
  unhandledErrors: [],
};

global[STATE_SYM] = INITIAL_STATE;

export const getState = (): Circus.State => global[STATE_SYM];
export const setState = (state: Circus.State): Circus.State =>
  (global[STATE_SYM] = state);

export const dispatch = (event: Circus.Event): void => {
  for (const handler of eventHandlers) {
    handler(event, getState());
  }
};

export const addEventHandler = (handler: Circus.EventHandler): void => {
  eventHandlers.push(handler);
};
