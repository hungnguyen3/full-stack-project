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

const main = async () => {
	// init MikroORM, migrate data to postgresQL
	const orm = await MikroORM.init(microConfig);
	await orm.getMigrator().up();

	// req and res to the server
	const app = express();

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
