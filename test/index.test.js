const traindown = require('../dist/index.js');

test('Basic parsing', () => {
  const src = `
    Squats 123: 123.45 100.5r
      '30 second pullup: bw+25 50r
      '2/3 Squat: 500
      + 1/4 Turds:
        * Hard af
        # Bands: 2 red, 2 blue
        123 100r 5s`;

  let td = new traindown(src);
  let tokens = td.parse();

  let expected = [
    { type: 'Movement', value: 'Squats 123' },
    { type: 'Load', value: '123.45' },
    { type: 'Rep', value: '100.5' },
    { type: 'Movement', value: '30 second pullup' },
    { type: 'Load', value: 'bw+25' },
    { type: 'Rep', value: '50' },
    { type: 'Movement', value: '2/3 Squat' },
    { type: 'Load', value: '500' },
    { type: 'Superset Movement', value: '1/4 Turds' },
    { type: 'Note', value: 'Hard af' },
    { type: 'Meta Key', value: 'Bands' },
    { type: 'Meta Value', value: '2 red, 2 blue' },
    { type: 'Load', value: '123' },
    { type: 'Rep', value: '100' },
    { type: 'Set', value: '5' }
  ];

  expect(tokens).toEqual(expected);
});
