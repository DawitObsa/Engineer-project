import mongoose from "mongoose";
import fs from "node:fs/promises";
import { app } from "./app.js";
import { env, validateEnvironment } from "./config/env.js";

validateEnvironment();
await fs.mkdir(env.fileStoragePath, { recursive: true });
await mongoose.connect(env.mongoUri);
app.listen(env.port, () => console.log(`ICPCAS API listening on port ${env.port}`));
