/**
 * An ES6 class that can be used to create custom error classes 
 */
export class ExtendableError extends Error {
  constructor(message) {
    super();
    this.message = message;
    this.stack = (new Error()).stack;
    this.name = this.constructor.name;
  }
};

export default ExtendableError;