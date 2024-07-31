class ApiError extends Error {
    constructor(
      statusCode,
      message = 'No custom error; default error: something is wrong',
      errors = [],
      stack = ''
    ) {
      super(message);
      this.statusCode = statusCode;
      this.errors = errors;
      if (stack) {
        this.stack = stack;
      } else {
        Error.captureStackTrace(this, () => ApiError);
      }
    }
  }
  
  export { ApiError };