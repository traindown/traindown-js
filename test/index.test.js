const traindown = require('../dist/index.js');

const stressTest = `
  @ 1/1/2021 1:23pm

  # session meta key 1: session meta "value" 1
  # session meta key '2': session meta value 2
  # 3rd session meta key: 3rd session meta value

  * session note 1
  * 2nd session note
  * "Third" session note

  movement 1: 100 101.1; 102

  '2nd movement: 
    # 2nd movement meta key 1: 2nd movement meta value 1
    # Movement 2 meta key 2: Movement 2 meta key 2

    * 2nd movement note 1
    * Movment 2 note 2

    201
    202 2r
    203 2s
    204 2r 2s
    205 2f

  Third movement:
    301
      * 301 note 1
      * Second 301 note
    302
      # 302 meta key 1: 302 meta value 1
      # Meta key 2 for 302: Meta value 2 for 302

  + '4th movement:
    # unit: 4th unit movement
    400.456
    401
      # unit: 401 unit
    bw
    bw+4

  Fifth movement: 5r 5f 5s 500
`;

test('Basic parsing', () => {
  let td = new traindown(stressTest);
  let tokens = td.parse();

  let expected = [
    { type: 'DateTime', value: '1/1/2021 1:23pm' },
    { type: 'Meta Key', value: 'session meta key 1' },
    { type: 'Meta Value', value: 'session meta "value" 1' },
    { type: 'Meta Key', value: "session meta key '2'" },
    { type: 'Meta Value', value: 'session meta value 2' },
    { type: 'Meta Key', value: '3rd session meta key' },
    { type: 'Meta Value', value: '3rd session meta value' },
    { type: 'Note', value: 'session note 1' },
    { type: 'Note', value: '2nd session note' },
    { type: 'Note', value: '"Third" session note' },
    { type: 'Movement', value: 'movement 1' },
    { type: 'Load', value: '100' },
    { type: 'Load', value: '101.1' },
    { type: 'Load', value: '102' },
    { type: 'Movement', value: '2nd movement' },
    { type: 'Meta Key', value: '2nd movement meta key 1' },
    { type: 'Meta Value', value: '2nd movement meta value 1' },
    { type: 'Meta Key', value: 'Movement 2 meta key 2' },
    { type: 'Meta Value', value: 'Movement 2 meta key 2' },
    { type: 'Note', value: '2nd movement note 1' },
    { type: 'Note', value: 'Movment 2 note 2' },
    { type: 'Load', value: '201' },
    { type: 'Load', value: '202' },
    { type: 'Rep', value: '2' },
    { type: 'Load', value: '203' },
    { type: 'Set', value: '2' },
    { type: 'Load', value: '204' },
    { type: 'Rep', value: '2' },
    { type: 'Set', value: '2' },
    { type: 'Load', value: '205' },
    { type: 'Fail', value: '2' },
    { type: 'Movement', value: 'Third movement' },
    { type: 'Load', value: '301' },
    { type: 'Note', value: '301 note 1' },
    { type: 'Note', value: 'Second 301 note' },
    { type: 'Load', value: '302' },
    { type: 'Meta Key', value: '302 meta key 1' },
    { type: 'Meta Value', value: '302 meta value 1' },
    { type: 'Meta Key', value: 'Meta key 2 for 302' },
    { type: 'Meta Value', value: 'Meta value 2 for 302' },
    { type: 'Superset Movement', value: '4th movement' },
    { type: 'Meta Key', value: 'unit' },
    { type: 'Meta Value', value: '4th unit movement' },
    { type: 'Load', value: '400.456' },
    { type: 'Load', value: '401' },
    { type: 'Meta Key', value: 'unit' },
    { type: 'Meta Value', value: '401 unit' },
    { type: 'Load', value: 'bw' },
    { type: 'Load', value: 'bw+4' },
    { type: 'Movement', value: 'Fifth movement' },
    { type: 'Rep', value: '5' },
    { type: 'Fail', value: '5' },
    { type: 'Set', value: '5' },
    { type: 'Load', value: '500' },
  ];

  expect(tokens).toEqual(expected);
});

test('Parsing with JSON output', () => {
  let td = new traindown(stressTest);
  let json = td.parse("json");
  let expected = {
    date: '1/1/2021 1:23pm',
    metadata: {
      'session meta key 1': 'session meta "value" 1',
      "session meta key '2'": 'session meta value 2',
      '3rd session meta key': '3rd session meta value'
    },
    notes: [ 'session note 1', '2nd session note', '"Third" session note' ],
    movements: [
      {
        metadata: {},
        name: 'movement 1',
        notes: [],
        performances: [
          { sequence: 0, fails: 0, load: 100, metadata: {}, reps: 1, notes: [], sets: 1 },
          { sequence: 1, fails: 0, load: 101.1, metadata: {}, reps: 1, notes: [], sets: 1 },
          { sequence: 2, fails: 0, load: 102, metadata: {}, reps: 1, notes: [], sets: 1 }
        ],
        sequence: 0,
        superset: false
      },
      {
        metadata: {
          '2nd movement meta key 1': '2nd movement meta value 1',
          'Movement 2 meta key 2': 'Movement 2 meta key 2'
        },
        name: '2nd movement',
        notes: ['2nd movement note 1', 'Movment 2 note 2'],
        performances: [
          { sequence: 0, fails: 0, load: 201, metadata: {}, reps: 1, notes: [], sets: 1 },
          { sequence: 1, fails: 0, load: 202, metadata: {}, reps: 2, notes: [], sets: 1 },
          { sequence: 2, fails: 0, load: 203, metadata: {}, reps: 1, notes: [], sets: 2 },
          { sequence: 3, fails: 0, load: 204, metadata: {}, reps: 2, notes: [], sets: 2 },
          { sequence: 4, fails: 2, load: 205, metadata: {}, reps: 2, notes: [], sets: 1 }
        ],
        sequence: 1,
        superset: false
      },
      {
        metadata: {},
        name: 'Third movement',
        notes: [],
        performances: [
          {
            sequence: 0,
            fails: 0,
            load: 301,
            metadata: {},
            reps: 1,
            notes: [ '301 note 1', 'Second 301 note' ],
            sets: 1
          },
          {
            sequence: 1,
            fails: 0,
            load: 302,
            metadata: {
              '302 meta key 1': '302 meta value 1',
              'Meta key 2 for 302': 'Meta value 2 for 302'
            },
            reps: 1,
            notes: [],
            sets: 1
          }
        ],
        sequence: 2,
        superset: false
      },
      {
        metadata: {unit: '4th unit movement'},
        name: '4th movement',
        notes: [],
        performances: [
          {
            sequence: 0,
            fails: 0,
            load: 400.456,
            metadata: {},
            reps: 1,
            notes: [],
            sets: 1
          },
          {
            sequence: 1,
            fails: 0,
            load: 401,
            metadata: { unit: '401 unit' },
            reps: 1,
            notes: [],
            sets: 1
          },
          { sequence: 2, fails: 0, load: 'bw', metadata: {}, reps: 1, notes: [], sets: 1 },
          { sequence: 3, fails: 0, load: 'bw+4', metadata: {}, reps: 1, notes: [], sets: 1 }
        ],
        sequence: 3,
        superset: true
      },
      {
        metadata: {},
        name: 'Fifth movement',
        notes: [],
        performances: [{ sequence: 0, fails: 5, load: 500, metadata: {}, reps: 5, notes: [], sets: 5 }],
        sequence: 4,
        superset: false
      }
    ],
  };


  expect(json).toEqual(expected);
});
