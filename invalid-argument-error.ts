export class InvalidArgumentError extends Error {
  constructor(message: string) {
    super(message)
  }

  static forOperator(operator: string, type: string) {
    return new InvalidArgumentError(`Invalid operator: ${operator} for type ${type}`)
  }
}
