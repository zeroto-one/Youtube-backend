class apiError extends Error{

    constructor(
        statuscode,
        message='no custom error default error something is wrong',
        errors=[],
        stack="",
    ){
        super(message)
        this.statuscode=statuscode
        this.data=null//*why this null to prevent unwanted error if this has default value
        this.errors=errors
        
        this.message=message
        if(stack){
            this.stack=stack
        }else{
            errors.captureStackTrace(this,this.constructor)
        }
    }
}
/**
 * Class: apiError

**This class is an extension of the built-in JavaScript Error class. It is designed to handle and manage errors that occur in an API context.

*Constructor:

**statuscode: This is the HTTP status code that corresponds to the error. It helps to categorize the error and provide appropriate responses.
message: This is a custom error message that describes the error in detail. If no custom message is provided, a default message "no custom error default error something is wrong" is used.
errors: This is an array that can hold additional error details or messages. By default, it is an empty array.
stack: This is the stack trace of the error. If a stack trace is provided, it is used. If not, the Error.captureStackTrace method is used to create a stack trace.


Properties:

data: This property is set to null to prevent any unwanted errors if it has a default value. It can be used to hold additional data related to the error.


Why this approach?

Extending the Error class allows you to take advantage of JavaScript's built-in error handling mechanisms.
The statuscode, message, errors, and stack properties provide a structured way to handle and manage errors in an API context. This makes it easier to diagnose and fix errors.
Setting data to null prevents any unwanted errors if it has a default value. This is a good practice to avoid potential issues.
Using Error.captureStackTrace to create a stack trace ensures that the error's stack trace is accurate and helpful in diagnosing the error.
 */