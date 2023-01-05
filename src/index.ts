import dotenv from "dotenv";
dotenv.config();

import Musistic from "./Musistic";
const instance = new Musistic();

instance.start();