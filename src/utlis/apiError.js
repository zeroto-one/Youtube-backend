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
            error.captureStackTrace(this,this.constructor)
        }
    }
}