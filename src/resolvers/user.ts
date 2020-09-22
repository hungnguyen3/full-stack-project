import { User } from "../entities/User";
import { MyContext } from "src/types";
import {
	Arg,
	Ctx,
	Field,
	InputType,
	Mutation,
	ObjectType,
	Query,
	Resolver,
} from "type-graphql";
import argon2 from "argon2";

// create a class with 2 fields username and password
@InputType()
class UsernamePasswordInput {
	@Field()
	username: string;
	@Field()
	password: string;
}

@ObjectType()
class FieldError {
	@Field()
	field: string;
	@Field()
	message: string;
}

// objecttype can be returned by the mutation but input type can only be arguments
@ObjectType()
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];
	@Field(() => User, { nullable: true })
	user?: User;
}

@Resolver()
export class UserResolver {
	@Query(() => User, { nullable: true })
	async me(@Ctx() { em, req }: MyContext) {
		// if you're not logged in
		if (!req.session!.userId) {
			return null;
		}
		const user = await em.findOne(User, { id: req.session!.userId });
		return user;
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg("options") options: UsernamePasswordInput,
		@Ctx() { em, req }: MyContext
	) {
		if (options.username.length <= 3) {
			return {
				errors: [
					{
						field: "username",
						message: "username too short",
					},
				],
			};
		}
		if (options.password.length <= 4) {
			return {
				errors: [
					{
						field: "password",
						message: "password too short",
					},
				],
			};
		}
		// hashing the password into something else! not reversable
		const hashedPassword = await argon2.hash(options.password);
		const user = em.create(User, {
			username: options.username,
			password: hashedPassword,
		});
		try {
			await em.persistAndFlush(user);
		} catch (err) {
			// duplicate username error
			//  || err.detail.includes("already exists")
			console.log("code: ", err);
			if (err.code === "23505" || err.detail.includes("already exists")) {
				return {
					errors: [
						{
							field: "username",
							message: "username already exists",
						},
					],
				};
			}
		}
		// store the user id session
		// set a cookie on the user
		// stay logged in

		req.session!.userId = user.id;
		return { user };
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg("options") options: UsernamePasswordInput,
		@Ctx() { em, req }: MyContext
	): Promise<UserResponse> {
		const user = await em.findOne(User, { username: options.username });
		if (!user) {
			return {
				errors: [
					{
						field: "username",
						message: "that username does not exist",
					},
				],
			};
		}
		const valid = await argon2.verify(user.password, options.password);
		if (!valid) {
			return {
				errors: [
					{
						field: "password",
						message: "incorrect password",
					},
				],
			};
		}
		req.session!.userId = user.id;

		return {
			user,
		};
	}
}
