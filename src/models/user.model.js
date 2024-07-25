import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, //*why this ...it will improve .Frequent Access:hen to make is index true
      //*Improved Query Performance:
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true, //leading and end wale blank scapes ko ignore kr deta hen
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //this is cloudinary wala link remember swiggy wala json
      default: "default.jpg", //**remember to add an default image */
      required: true,
    },
    coverImage: {
      type: String, //this is cloudinary wala link remember swiggy wala json
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
      //required: true,
      //select: false, //**remember to hide this field when it is not required or when we are not using it */
    },
  },
  { timestamps: true }
);

/* //hashing password before saving it to the database
 * This pre-hook function is executed before saving a user document in the database.
 * It checks if the password field has been modified and if so, hashes the new password.
 * The function is declared as `async` to handle the asynchronous nature of the password hashing process.
 * always write function rather then a ()=>arrow as arrow fun don't have access to this
 * @function
 * @param {function} next - The next middleware function in the stack.
 * @returns {void}
 *
 * @example
 * *Example usage within a Mongoose schema
 * userSchema.pre("save", async function (next) {
 *   if (this.isModified("password")) {
 *     const hashedPassword = await bcrypt.hash(this.password, 10);
 *     this.password = hashedPassword;
 *   }
 *   next();
 * });
 */
userSchema.pre("save", async function (next) {
  //this pre hook executed before doing a task and we can specify that
  if (this.isModified("password")) {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
  }
  next();
});
//method to check if password is correct or not
/*
 * A method to compare the provided password with the hashed password stored in the user document.
 * @function isPasswordCorrect
 * @memberof User.prototype
 * @instance
 * @param {string} password - The password provided by the user for verification.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean value indicating whether the provided password is correct or not.
 * @example
 *  Assuming `user` is an instance of the User model
 * const password = "userProvidedPassword";
 * user.isPasswordCorrect(password)
 *   .then((isCorrect) => {
 *     if (isCorrect) {
 *       console.log("Password is correct");
 *     } else {
 *       console.log("Password is incorrect");
 *     }
 *   })
 *   .catch((error) => {
 *     console.error("Error verifying password:", error);
 *   });
 */
userSchema.methods.isPasswordCorrect = async function (password) {
 return  await bcrypt.compare(password, this.password);
};
/*A function to generate an access token for the user.
 * The access token is used for authentication and authorization in subsequent requests.
 *
 * @function generateAccessToken
 * @memberof User.prototype
 * @instance
 * @returns {string} - The generated access token.
 *
 * @example
 * Assuming `user` is an instance of the User model
 * const accessToken = user.generateAccessToken();
 * console.log("Generated Access Token:", accessToken);
 */
userSchema.methods.generateAccessToken=function generateAccessToken() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
}

/** A function to generate a refresh token for the user.
 * The refresh token is used to obtain a new access token when the current one expires.
 *
 * @function generateRefreshToken
 * @memberof User.prototype
 * @instance
 * @returns {string} - The generated refresh token.
 *
 * @example
 * Assuming `user` is an instance of the User model
 * const refreshToken = user.generateRefreshToken();
 * console.log("Generated Refresh Token:", refreshToken);
 */
userSchema.methods.generateRefreshToken=function generateRefreshToken() {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
}

export const User = mongoose.model("User", userSchema);
