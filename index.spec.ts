import { describe, expect, it, test } from 'vitest'

import { QueryBuilder } from '.'
import { InvalidArgumentError } from './invalid-argument-error'

const builder = () => new QueryBuilder()

describe('data types', () => {
  it('string', () => {
    expect(builder().whereEquals('attr', 'lorem').build()).to.eq('attr:lorem')
    expect(builder().whereEquals('attr', 'lorem ipsum').build()).to.eq('attr:"lorem ipsum"')

    expect(builder().whereEquals('attr', '123').build()).to.eq('attr:123')
    expect(builder().whereEquals('attr', '0').build()).to.eq('attr:0')
    expect(builder().whereEquals('attr', '-123').build()).to.eq('attr:-123')
  })

  it('boolean', () => {
    expect(builder().whereEquals('attr', true).build()).to.eq('attr:true')
    expect(builder().whereEquals('attr', false).build()).to.eq('attr:false')
  })

  test('number', () => {
    expect(builder().whereEquals('attr', 123).build()).to.eq('attr = 123')
    expect(builder().whereEquals('attr', 0).build()).to.eq('attr = 0')
    expect(builder().whereEquals('attr', -123).build()).to.eq('attr = -123')
  })
})

describe('where operators', () => {
  test('numeric comparison', () => {
    expect(builder().where('attr', '<', 123).build()).to.eq('attr < 123')
    expect(builder().where('attr', '<=', 123).build()).to.eq('attr <= 123')
    expect(builder().where('attr', '=', 123).build()).to.eq('attr = 123')
    expect(builder().where('attr', '!=', 123).build()).to.eq('attr != 123')
    expect(builder().where('attr', '>=', 123).build()).to.eq('attr >= 123')
    expect(builder().where('attr', '>', 123).build()).to.eq('attr > 123')
  })

  test('numeric comparison with strings throws error', () => {
    expect(() => builder().where('attr', '<', 'lorem')).toThrowError(InvalidArgumentError)
    expect(() => builder().where('attr', '<=', 'lorem')).toThrowError(InvalidArgumentError)
    expect(() => builder().where('attr', '>=', 'lorem')).toThrowError(InvalidArgumentError)
    expect(() => builder().where('attr', '>', 'lorem')).toThrowError(InvalidArgumentError)
  })

  test('numeric comparison with boleans throws error', () => {
    expect(() => builder().where('attr', '<', true)).toThrowError(InvalidArgumentError)
    expect(() => builder().where('attr', '<', false)).toThrowError(InvalidArgumentError)

    expect(() => builder().where('attr', '<=', true)).toThrowError(InvalidArgumentError)
    expect(() => builder().where('attr', '<=', false)).toThrowError(InvalidArgumentError)

    expect(() => builder().where('attr', '>=', false)).toThrowError(InvalidArgumentError)
    expect(() => builder().where('attr', '>=', true)).toThrowError(InvalidArgumentError)

    expect(() => builder().where('attr', '>', true)).toThrowError(InvalidArgumentError)
    expect(() => builder().where('attr', '>', false)).toThrowError(InvalidArgumentError)
  })
})

test('boolean operators', () => {
  expect(builder().whereEquals('attr', 'lorem').build()).to.eq('attr:lorem')
  expect(builder().whereEquals('attr', true).build()).to.eq('attr:true')
  expect(builder().whereEquals('attr', false).build()).to.eq('attr:false')
  expect(builder().whereEquals('attr', 123).build()).to.eq('attr = 123')
  expect(builder().whereEquals('attr', 0).build()).to.eq('attr = 0')
  expect(builder().whereEquals('attr', -123).build()).to.eq('attr = -123')

  expect(builder().whereNot('attr', 'lorem').build()).to.eq('NOT attr:lorem')
  expect(builder().whereNot('attr', true).build()).to.eq('NOT attr:true')
  expect(builder().whereNot('attr', false).build()).to.eq('NOT attr:false')
  expect(builder().whereNot('attr', 123).build()).to.eq('attr != 123')
  expect(builder().whereNot('attr', 0).build()).to.eq('attr != 0')
  expect(builder().whereNot('attr', -123).build()).to.eq('attr != -123')
})

test('attribute can equal to number', () => {
  expect(builder().where('attr', 123).build()).to.eq('attr = 123')
  expect(builder().where('attr', '=', 123).build()).to.eq('attr = 123')
  expect(builder().whereEquals('attr', 123).build()).to.eq('attr = 123')
})

test('where in', () => {
  expect(builder().whereIn('attr', ['lorem', 'ipsum']).build()).to.eq('(attr:lorem OR attr:ipsum)')
  expect(builder().whereIn('attr', [1, 2, 3]).build()).to.eq('(attr = 1 OR attr = 2 OR attr = 3)')
  expect(builder().whereIn('attr', [true, false]).build()).to.eq('(attr:true OR attr:false)')
})

test('where not in', () => {
  expect(builder().whereNotIn('attr', ['lorem', 'ipsum']).build()).to.eq('(NOT attr:lorem AND NOT attr:ipsum)')
  expect(builder().whereNotIn('attr', [1, 2, 3]).build()).to.eq('(attr != 1 AND attr != 2 AND attr != 3)')
  expect(builder().whereNotIn('attr', [true, false]).build()).to.eq('(NOT attr:true AND NOT attr:false)')
})

test('attribute can equal to string', () => {
  expect(builder().where('attr', 'lorem').build()).to.eq('attr:lorem')
  expect(builder().where('attr', 'lorem ipsum').build()).to.eq('attr:"lorem ipsum"')
  expect(builder().where('attr', '=', 'lorem').build()).to.eq('attr:lorem')
  expect(builder().where('attr', '=', 'lorem ipsum').build()).to.eq('attr:"lorem ipsum"')
})

test('attribute can equal to an object', () => {
  expect(builder().whereLessThan('attr', 123).whereGreaterThan('attr', 456).build()).to.eq('attr < 123 AND attr > 456')
})

test('conditionals', () => {
  expect(
    builder()
      .where('attr', 'lorem')
      .when(true, (b) => b.where('attr2', 'ipsum'))
      .build(),
  ).to.eq('attr:lorem AND attr2:ipsum')

  expect(
    builder()
      .where('attr', 'lorem')
      .when(false, (b) => b.where('attr2', 'ipsum'))
      .build(),
  ).to.eq('attr:lorem')

  expect(
    builder()
      .where('attr', 'lorem')
      .unless(true, (b) => b.where('attr2', 'ipsum'))
      .build(),
  ).to.eq('attr:lorem')

  expect(
    builder()
      .where('attr', 'lorem')
      .unless(false, (b) => b.where('attr2', 'ipsum'))
      .build(),
  ).to.eq('attr:lorem AND attr2:ipsum')
})
