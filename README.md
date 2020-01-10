!> Very alpha

# Konveyor

Create and manage scripts at scale in a breeze.

## Concepts

Building script and CLI is always a pain. It usually start with a simple bash script and in no time it end up in spagetthi code that copy pasted from stackoverflow.
Konveyor helps you split, reuse and make your scripts clean. It comes bundled with the most common tool you will need.
Because each projects comes with its own requirements and specifity you know better than anyone what you need, we only provides the fundation to do it painlessly.

- 👨‍👦 Dependencies, easily declare which scripts requires what to work correctly.
- 💅 Elegant, displays on what is relevant in a clean and elegant way.
- 👁 Transparency, everything is logged so you understand what is going on under the hood.
- ♻️ Reusability, allows you to split and reuse code easily.
- 📖 Typed, use the power of Typescript to add safety to your scripts.

```javascript
const prgm = new Konveyor({
  name: 'My Awesome Script',
  version: '1.0.0',
  tasks: [
    new Task({
      name: 'auth',
      description: 'Auth to Github',
    }),
  ],
});

prgm.start(process.argv);
```

## Examples

See [examples folder](./examples/).

## Documentation

See [documentation folder](./documentation/).

## Todo

- eslint
- tests
- Timings
- parametrisable task
- default run
- log spinner spin/fail/succeed
- Examples
  - Simple
  - Test with mock
- Compile bin + def
