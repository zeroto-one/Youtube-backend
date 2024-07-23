const asyncHandler = (reqHandler) => {
    return (req, res, next) => {
      // Ensure the request handler is executed and return a promise
      Promise.resolve(reqHandler(req, res, next))
        // If there is an error, pass it to the next middleware (error handler)
        .catch((err) => next(err));
    };
  };
  export default asyncHandler;
 
  



//export const asyncHandler=(fun)=>{
//    async (req,res,next)=>{
//         try{
//             await fun(req,res,next)
//         }
//         catch(error){
//             res.status(err.code||500).json({
//                 success:false,
//                 message:err.message
//             })

//         }

//     }
// }