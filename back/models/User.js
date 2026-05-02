import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["proprietaire", "locataire", "moderateur"],
    default: "proprietaire",
  },
  telephone: { type: String, default: null, sparse: true },
  autorise: { type: Boolean, default: false },
  resetToken: { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
