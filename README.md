!> Very alpha

[![Build Status](https://travis-ci.org/bodinsamuel/konveyor.svg?branch=master)](https://travis-ci.org/bodinsamuel/konveyor)
[![codecov](https://codecov.io/gh/bodinsamuel/konveyor/branch/master/graph/badge.svg)](https://codecov.io/gh/bodinsamuel/konveyor)

# Konveyor

Create and manage scripts that scale.

## Concepts

Building script and CLI is always a pain. It usually starts with a **simple bash script** and in no time it end up in a mess half of it copy pasted from stackoverflow.

**Konveyor** helps you split, reuse and make your scripts clean. It comes bundled with the most common tool you will need.
Because each projects comes with its own requirements and specifity you know better than anyone what you need, we only provides the fundation to do it painlessly.

- 👨‍👦 Dependencies, easily declare which scripts requires what to work correctly.
- 💅 Elegant, displays only what is relevant in a clean and simple way.
- 👀 Transparency, everything is logged so you understand what is going on under the hood.
- 😍 Testability and Reusability, allows you to split, test and reuse code easily.
- 🚀 Typed, use the power of Typescript to add safety to your scripts.

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

- tests
- Timings
- parametrisable task
- default run
- log spinner spin/fail/succeed
- Examples
  - Simple
  - Test with mock
- Documentation
- Release script
