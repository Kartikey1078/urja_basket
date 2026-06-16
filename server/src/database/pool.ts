import mysql from "mysql2/promise";

import { toPoolOptions } from "../config/db";
import { env } from "../config/env";

export const pool = mysql.createPool(toPoolOptions(env.db));
