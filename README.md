Write Algolia filters in a fluent and elegant manner.

This is inspired by Laravel's Eloquent Query Builder.

Usage:

```ts
const builder = new QueryBuilder()

builder
  .where('name', 'John')
  .whereGreaterThan('age', '>', 18)
  .whereIn('city', ['New York', 'Los Angeles', 'Chicago'])
  .build()

// Output: 'name:John AND age > 18 AND (city:"New York" OR city:"Los Angeles" OR city:Chicago)'
```

TODO:

- Add more tests
- Clean up tests
- Add Prettier and ESLint
- Detect [unsupported usage](https://www.algolia.com/doc/api-reference/api-parameters/filters/#boolean-operators)
