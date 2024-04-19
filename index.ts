import { InvalidArgumentError } from './invalid-argument-error'

type Value = string | number | boolean | null | undefined
type Operator = '<' | '<=' | '=' | '!=' | '>=' | '>'
type ParseArgs = [string, Operator, Value]

const NUMERIC_OPERATORS: Operator[] = ['<', '<=', '>=', '>']

export class QueryBuilder {
  private statements: string[] = []

  where(attribute: string, value: Value): this
  where(attribute: string, operator: Operator, value: Value): this
  where(...args: any[]): this {
    return this.and(buildStatement(parseArgs(...args)))
  }

  whereNot(attribute: string, value: Value): this {
    return this.where(attribute, '!=', value)
  }

  whereEquals(attribute: string, value: Value): this {
    return this.where(attribute, '=', value)
  }

  whereLessThan(attribute: string, value: number): this {
    return this.where(attribute, '<', value)
  }

  whereGreaterThan(attribute: string, value: number): this {
    return this.where(attribute, '>', value)
  }

  whereIn(attribute: string, values: Value[]): this {
    if (values.length > 0) {
      this.and('(')

      for (const value of values) {
        this.or(buildStatement([attribute, '=', value]))
      }

      this.statements.push(')')
    }

    return this
  }

  whereNotIn(attribute: string, values: Value[]): this {
    if (values.length > 0) {
      this.and('(')

      for (const value of values) {
        this.and(buildStatement([attribute, '!=', value]))
      }

      this.statements.push(')')
    }

    return this
  }

  when(condition: any, cb: (builder: this) => void): this {
    if (condition) {
      cb(this)
    }

    return this
  }

  unless(condition: any, cb: (builder: this) => void): this {
    if (!condition) {
      cb(this)
    }

    return this
  }

  build() {
    return this.statements.join('')
  }

  private and(condition: string | null): this {
    if (!condition) return this

    const onGroupStart = this.statements[this.statements.length - 1] === '('

    if (this.statements.length > 0 && !onGroupStart) {
      this.statements.push(' AND ')
    }

    this.statements.push(condition)

    return this
  }

  private or(condition: string | null): this {
    if (!condition) return this

    const onGroupStart = this.statements[this.statements.length - 1] === '('

    if (this.statements.length > 0 && !onGroupStart) {
      this.statements.push(' OR ')
    }

    this.statements.push(condition)

    return this
  }
}

function valid(value: Value): value is string | number | boolean {
  return value !== null && value !== undefined
}

function transform(value: Value) {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  } else if (typeof value === 'string') {
    if (value.includes(' ')) {
      return `"${value}"`
    } else if (value.length > 0) {
      return value
    }

    value = undefined
  } else if (!isNaN(value as number)) {
    return Number(value)
  }

  return value
}

function parseArgs(...args: any[]): ParseArgs {
  let attribute: string
  let operator: Operator = '='
  let value: Value

  if (args.length === 2) {
    attribute = args[0]
    value = args[1]
  } else {
    attribute = args[0]
    operator = args[1]
    value = args[2]
  }

  return [attribute, operator, value]
}

function buildStatement([attribute, operator, value]: ParseArgs) {
  value = transform(value)

  if (!valid(value)) return null

  if (typeof value !== 'number' && NUMERIC_OPERATORS.includes(operator)) {
    throw InvalidArgumentError.forOperator(operator, typeof value)
  }

  let separator = ':'

  if (typeof value === 'number') {
    separator = ` ${operator} `

    return `${attribute}${separator}${value}`
  }

  if (operator === '!=') {
    return `NOT ${attribute}${separator}${value}`
  }

  return `${attribute}${separator}${value}`
}
