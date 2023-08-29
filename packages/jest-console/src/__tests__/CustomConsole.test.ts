/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Writable} from 'stream';
import chalk from 'chalk';
import CustomConsole from '../CustomConsole';

describe('CustomConsole', () => {
  let _console;
  let _stdout;
  let _stderr;

  beforeEach(() => {
    _stdout = '';
    _stderr = '';

    const stdout = new Writable({
      write(chunk, encoding, callback) {
        _stdout += chunk.toString();
        callback();
      },
    });

    const stderr = new Writable({
      write(chunk, encoding, callback) {
        _stderr += chunk.toString();
        callback();
      },
    });

    _console = new CustomConsole(stdout, stderr);
  });

  describe('log', () => {
    test('should print to stdout', () => {
      _console.log('Hello world!');

      expect(_stdout).toBe('Hello world!\n');
    });
  });

  describe('error', () => {
    test('should print to stderr', () => {
      _console.error('Found some error!');

      expect(_stderr).toBe('Found some error!\n');
    });
  });

  describe('warn', () => {
    test('should print to stderr', () => {
      _console.warn('Found some warning!');

      expect(_stderr).toBe('Found some warning!\n');
    });
  });

  describe('assert', () => {
    test('do not log when the assertion is truthy', () => {
      _console.assert(true);

      expect(_stderr).toMatch('');
    });

    test('do not log when the assertion is truthy and there is a message', () => {
      _console.assert(true, 'ok');

      expect(_stderr).toMatch('');
    });

    test('log the assertion error when the assertion is falsy', () => {
      _console.assert(false);

      expect(_stderr).toMatch('AssertionError');
      expect(_stderr).toMatch(
        // The message may differ across Node versions
        /(false == true)|(The expression evaluated to a falsy value:)/,
      );
    });

    test('log the assertion error when the assertion is falsy with another message argument', () => {
      _console.assert(false, 'this should not happen');

      expect(_stderr).toMatch('AssertionError');
      expect(_stderr).toMatch('this should not happen');
    });
  });

  describe('count', () => {
    test('count using the default counter', () => {
      _console.count();
      _console.count();
      _console.count();

      expect(_stdout).toEqual('default: 1\ndefault: 2\ndefault: 3\n');
    });

    test('count using the a labeled counter', () => {
      _console.count('custom');
      _console.count('custom');
      _console.count('custom');

      expect(_stdout).toEqual('custom: 1\ncustom: 2\ncustom: 3\n');
    });

    test('countReset restarts default counter', () => {
      _console.count();
      _console.count();
      _console.countReset();
      _console.count();
      expect(_stdout).toEqual('default: 1\ndefault: 2\ndefault: 1\n');
    });

    test('countReset restarts custom counter', () => {
      _console.count('custom');
      _console.count('custom');
      _console.countReset('custom');
      _console.count('custom');

      expect(_stdout).toEqual('custom: 1\ncustom: 2\ncustom: 1\n');
    });
  });

  describe('group', () => {
    test('group without label', () => {
      _console.group();
      _console.log('hey');
      _console.group();
      _console.log('there');

      expect(_stdout).toEqual('  hey\n    there\n');
    });

    test('group with label', () => {
      _console.group('first');
      _console.log('hey');
      _console.group('second');
      _console.log('there');

      expect(_stdout).toEqual(`  ${chalk.bold('first')}
  hey
    ${chalk.bold('second')}
    there
`);
    });

    test('groupEnd remove the indentation of the current group', () => {
      _console.group();
      _console.log('hey');
      _console.groupEnd();
      _console.log('there');

      expect(_stdout).toEqual('  hey\nthere\n');
    });

    test('groupEnd can not remove the indentation below the starting point', () => {
      _console.groupEnd();
      _console.groupEnd();
      _console.group();
      _console.log('hey');
      _console.groupEnd();
      _console.log('there');

      expect(_stdout).toEqual('  hey\nthere\n');
    });
  });

  describe('time', () => {
    test('should return the time between time() and timeEnd() on default timer', () => {
      _console.time();
      _console.timeEnd();

      expect(_stdout).toMatch('default: ');
      expect(_stdout).toMatch('ms');
    });

    test('should return the time between time() and timeEnd() on custom timer', () => {
      _console.time('custom');
      _console.timeEnd('custom');

      expect(_stdout).toMatch('custom: ');
      expect(_stdout).toMatch('ms');
    });
  });
});
