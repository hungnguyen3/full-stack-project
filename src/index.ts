import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import "reflect-metadata";
import { UserResolver } from "./resolvers/user";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";

const main = async () => {
	// init MikroORM, migrate data to postgresQL
	const orm = await MikroORM.init(microConfig);
	await orm.getMigrator().up();

	// req and res to the server
	const app = express();

	// set up cookie using redis server
	const RedisStore = connectRedis(session);
	const redisClient = redis.createClient();

	app.use(
		session({
			name: "crazhung",
			store: new RedisStore({
				client: redisClient,
				disableTouch: true,
			}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
				httpOnly: true,
				sameSite: "lax",
				secure: __prod__, //cookie only works in https
			},
			secret: "jkdshfgkjsfhg",
			resave: false,
		})
	);

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver, UserResolver],
			validate: false,
		}),
		// context is accessible by all the resolvers
		context: () => ({ em: orm.em }),
	});

	// apply an graphQL endpoint to the server
	apolloServer.applyMiddleware({ app });

	// start a server
	app.listen(4000, () => {
		console.log("server started on localhost: 4000");
	});
};

main().catch(err => {
	console.error(err);
});
