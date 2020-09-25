import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { User } from "./entities/User";

// database setup
export default {
	migrations: {
		path: path.join(__dirname, "./migrations"),
		pattern: /^[\w-]+\d+\.[tj]s$/,
	},
	entities: [Post, User],
	dbName: "lireddit",
	type: "postgresql",
	debug: !__prod__,
	user: "postgres",
	password: "Loveneverfails1!",
} as Parameters<typeof MikroORM.init>[0];
