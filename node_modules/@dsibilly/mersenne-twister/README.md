# mersenne-twister

A JavaScript implementation of the Mersenne Twister pseudo-random number generator.

[![npm version](https://badge.fury.io/js/%40dsibilly%2Fmersenne-twister.svg)](https://badge.fury.io/js/%40dsibilly%2Fmersenne-twister) [![Build Status](https://travis-ci.org/dsibilly/mersenne-twister.svg?branch=master)](https://travis-ci.org/dsibilly/mersenne-twister) [![Coverage Status](https://coveralls.io/repos/github/dsibilly/mersenne-twister/badge.svg?branch=master)](https://coveralls.io/github/dsibilly/mersenne-twister?branch=master)

## How To Use

### Installation (via [npm](https://www.npmjs.com/package/@dsibilly/mersenne-twister))

```bash
$ npm install @dsibilly/mersenne-twister
```

### Usage

Get an instance of RNG:

```javascript
const MersenneTwister = require('@dsibilly/mersenne-twister').default,
  rng = = new MersenneTwister();
```

...or with ES2015+ `import`:
```javascript
import MersenneTwister from '@dsibilly/mersenne-twister';

const rng = new MersenneTwister();
```

#### Seeding the RNG

```javascript
const rng2 = new MersenneTwister(4567),
    rng3 = new MersenneTwister([
        // You can also seed with an array of values
        123,
        456,
        789
    ]);
```

#### Generating Numbers

Generate a random 32-bit integer:

```javascript
const result = rng.randomInt();
```

Generate a random 31-bit integer::

```javascript
const result = rng.randomInt31();
```

Generate a random number between 0 and 1, exclusive (e.g. 0 < n < 1):

```javascript
const result = rng.randomExclusive();
```

Generate a random number where 0 <= n < 1:

```javascript
const result = rng.random();
```

Generate a random number between 0 and 1, inclusive (e.g. 0 <= n <= 1):

```javascript
const result = rng.randomInclusive();
```

Generate a random 53-bit number, 0 <= n <= 1:

```javascript
const result = rng.randomLong();
```

## License
[MIT License](http://www.opensource.org/licenses/mit-license.php)

## Maintainer
[Duane Sibilly](https://github.com/dsibilly/)
