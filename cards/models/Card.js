import { model, Schema } from "mongoose";
import {
  DEFAULT_VALIDATION,
  EMAIL,
  PHONE,
  URL,
} from "../../helpers/mongooseValidators.js";
import { Address } from "../../helpers/submodels/Address.js";
import { Image } from "../../helpers/submodels/Image.js";

const cardSchema = new Schema({
  title: DEFAULT_VALIDATION,
  subtitle: DEFAULT_VALIDATION,
  description: {
    ...DEFAULT_VALIDATION,
    maxLength: 1024,
  },
  phone: PHONE,
  email: EMAIL,
  web: {
    ...URL,

  },
  image: Image,
  address: Address,
  bizNumber: {
    // 7-digit unique business number generated server-side
    type: Number,
    min: 1000000,
    max: 9999999,
    required: true,
    unique: true,
  },
  likes: [String],
  isBlocked: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user_id: {
    type: String,
    required: true,
  },
});

const Card = model("card", cardSchema);

export default Card;
