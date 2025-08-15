import { model, Schema } from "mongoose";
import { EMAIL, PHONE } from "../../helpers/mongooseValidators.js";
import { Address } from "../../helpers/submodels/Address.js";
import { Image } from "../../helpers/submodels/Image.js";
import { Name } from "../../helpers/submodels/Name.js";
import Card from "../../cards/models/Card.js";

const userSchema = new Schema({
  name: Name,
  phone: PHONE,
  email: EMAIL,
  password: {
    type: String,
    required: true,
    trim: true,
  },
  image: Image,
  address: Address,
  isAdmin: { type: Boolean, default: false },
  isBusiness: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Cascade cleanup: remove user's cards and likes after deletion
userSchema.post("findOneAndDelete", async function (doc) {
  try {
    if (!doc) return;
    const userIdStr = doc._id.toString();
    // delete all cards owned by user
    const deleteRes = await Card.deleteMany({ user_id: userIdStr });
    // remove likes of user from remaining cards
    const updateRes = await Card.updateMany(
      { likes: userIdStr },
      { $pull: { likes: userIdStr } }
    );
    console.log(
      `Cascade delete for user ${userIdStr}: removed ${deleteRes.deletedCount} cards, cleaned likes in ${updateRes.modifiedCount} cards`
    );
  } catch (err) {
    console.log("Cascade user delete error:", err.message || err);
  }
});

const User = model("user", userSchema);

export default User;
