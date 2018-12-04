import muster, { arrayList, entries, key, query, ref, toNode, value } from '../..';
import { operation, runScenario } from '../../test';
import { pop } from './pop';

describe('pop()', () => {
  runScenario({
    description: 'GIVEN a collection of numbers',
    graph: () =>
      muster({
        numbers: arrayList([3, 1, 2]),
      }),
    operations: [
      operation({
        description: 'WHEN requesting the numbers',
        input: query(ref('numbers'), entries()),
        expected: value([3, 1, 2]),
        operations: (subscriber1) => [
          operation({
            description: 'AND the first number gets popped',
            before() {
              jest.clearAllMocks();
            },
            input: pop(ref('numbers')),
            expected: value(2),
            assert() {
              expect(subscriber1().next).toHaveBeenCalledTimes(1);
              expect(subscriber1().next).toHaveBeenCalledWith(value([3, 1]));
            },
            operations: (subscriber2) => [
              operation({
                description: 'AND the numbers get re-requested (with previous subscription open)',
                before() {
                  jest.clearAllMocks();
                },
                input: query(ref('numbers'), entries()),
                expected: value([3, 1]),
              }),
              operation({
                description: 'AND the numbers get re-requested (with previous subscription closed)',
                before() {
                  subscriber1().subscription.unsubscribe();
                  subscriber2().subscription.unsubscribe();
                  jest.clearAllMocks();
                },
                input: query(ref('numbers'), entries()),
                expected: value([3, 1]),
              }),
              operation({
                description: 'AND the second number gets popped',
                before() {
                  jest.clearAllMocks();
                },
                input: pop(ref('numbers')),
                expected: value(1),
                assert() {
                  expect(subscriber2().next).not.toHaveBeenCalled();
                  expect(subscriber1().next).toHaveBeenCalledTimes(1);
                  expect(subscriber1().next).toHaveBeenCalledWith(value([3]));
                },
                operations: (subscriber3) => [
                  operation({
                    description: 'AND the final number is popped',
                    before() {
                      jest.clearAllMocks();
                    },
                    input: pop(ref('numbers')),
                    expected: value(3),
                    assert() {
                      expect(subscriber2().next).not.toHaveBeenCalled();
                      expect(subscriber3().next).not.toHaveBeenCalled();
                      expect(subscriber1().next).toHaveBeenCalledTimes(1);
                      expect(subscriber1().next).toHaveBeenCalledWith(value([]));
                    },
                    operations: (subscriber4) => [
                      operation({
                        description: 'AND the pop is called for an empty collection',
                        before() {
                          jest.clearAllMocks();
                        },
                        input: pop(ref('numbers')),
                        expected: value(undefined), // This is actually a resolved nil
                        assert() {
                          expect(subscriber1().next).not.toHaveBeenCalled();
                          expect(subscriber2().next).not.toHaveBeenCalled();
                          expect(subscriber3().next).not.toHaveBeenCalled();
                          expect(subscriber4().next).not.toHaveBeenCalled();
                        },
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  runScenario({
    description: 'GIVEN an instance of muster containing a collection of branches',
    graph: () =>
      muster({
        people: arrayList([
          { firstName: 'Lizzie', lastName: 'Ramirez' },
          { firstName: 'Charlotte', lastName: 'Schneider' },
          { firstName: 'Genevieve', lastName: 'Patrick' },
        ]),
      }),
    operations: [
      operation({
        description: 'WHEN requesting the initial value of collection',
        input: query(
          ref('people'),
          entries({
            firstName: key('firstName'),
            lastName: key('lastName'),
          }),
        ),
        expected: value([
          { firstName: 'Lizzie', lastName: 'Ramirez' },
          { firstName: 'Charlotte', lastName: 'Schneider' },
          { firstName: 'Genevieve', lastName: 'Patrick' },
        ]),
        operations: (subscriber1) => [
          operation({
            description: 'AND an item is popped from the collection',
            before() {
              jest.clearAllMocks();
            },
            input: pop(ref('people')),
            expected: toNode({ firstName: 'Genevieve', lastName: 'Patrick' }),
            assert() {
              expect(subscriber1().next).toHaveBeenCalledTimes(1);
              expect(subscriber1().next).toHaveBeenCalledWith(
                value([
                  { firstName: 'Lizzie', lastName: 'Ramirez' },
                  { firstName: 'Charlotte', lastName: 'Schneider' },
                ]),
              );
            },
            operations: (subscriber2) => [
              operation({
                description:
                  'AND the collection get re-requested (with previous subscription open)',
                before() {
                  jest.clearAllMocks();
                },
                input: query(
                  ref('people'),
                  entries({
                    firstName: key('firstName'),
                    lastName: key('lastName'),
                  }),
                ),
                expected: value([
                  { firstName: 'Lizzie', lastName: 'Ramirez' },
                  { firstName: 'Charlotte', lastName: 'Schneider' },
                ]),
              }),
              operation({
                description:
                  'AND the collection get re-requested (with previous subscription closed)',
                before() {
                  subscriber1().subscription.unsubscribe();
                  subscriber2().subscription.unsubscribe();
                  jest.clearAllMocks();
                },
                input: query(
                  ref('people'),
                  entries({
                    firstName: key('firstName'),
                    lastName: key('lastName'),
                  }),
                ),
                expected: value([
                  { firstName: 'Lizzie', lastName: 'Ramirez' },
                  { firstName: 'Charlotte', lastName: 'Schneider' },
                ]),
              }),
              operation({
                description: 'AND another item is popped from the collection',
                before() {
                  jest.clearAllMocks();
                },
                input: pop(ref('people')),
                expected: toNode({ firstName: 'Charlotte', lastName: 'Schneider' }),
                assert() {
                  expect(subscriber2().next).not.toHaveBeenCalled();
                  expect(subscriber1().next).toHaveBeenCalledTimes(1);
                  expect(subscriber1().next).toHaveBeenCalledWith(
                    value([{ firstName: 'Lizzie', lastName: 'Ramirez' }]),
                  );
                },
                operations: (subscriber3) => [
                  operation({
                    description: 'AND the last item is popped',
                    before() {
                      jest.clearAllMocks();
                    },
                    input: pop(ref('people')),
                    expected: toNode({ firstName: 'Lizzie', lastName: 'Ramirez' }),
                    assert() {
                      expect(subscriber2().next).not.toHaveBeenCalled();
                      expect(subscriber3().next).not.toHaveBeenCalled();
                      expect(subscriber1().next).toHaveBeenCalledTimes(1);
                      expect(subscriber1().next).toHaveBeenCalledWith(value([]));
                    },
                    operations: (subscriber4) => [
                      operation({
                        description: 'AND the pop is called for an empty collection',
                        before() {
                          jest.clearAllMocks();
                        },
                        input: pop(ref('people')),
                        expected: value(undefined), // This is actually a resolved nil
                        assert() {
                          expect(subscriber1().next).not.toHaveBeenCalled();
                          expect(subscriber2().next).not.toHaveBeenCalled();
                          expect(subscriber3().next).not.toHaveBeenCalled();
                          expect(subscriber4().next).not.toHaveBeenCalled();
                        },
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
});
