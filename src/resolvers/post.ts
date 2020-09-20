import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
	// query returns array of ObjectType Post
	// will take in MikroORM.em to retrieve the data from database
	// then query into posts using graphtQL
	@Query(() => [Post])
	posts(@Ctx() { em }: MyContext): Promise<Post[]> {
		return em.find(Post, {});
	}

	// this query returns a single Post
	@Query(() => Post, { nullable: true })
	post(@Arg("id") id: number, @Ctx() { em }: MyContext): Promise<Post | null> {
		return em.findOne(Post, { id });
	}

	// this Mutation creates an ObjectType Post
	// take in a titlle and MikroORM.em to create data for the database
	// Post is both ObjectType(grapthQL) and Entity(MikroORM)
	@Mutation(() => Post)
	async createPost(
		@Arg("title") title: string,
		@Ctx() { em }: MyContext
	): Promise<Post> {
		const post = em.create(Post, { title });
		await em.persistAndFlush(post);
		return post;
	}

	@Mutation(() => Post)
	async updatePost(
		@Arg("id") id: number,
		@Arg("title", () => String, { nullable: true }) title: string,
		@Ctx() { em }: MyContext
	): Promise<Post | null> {
		const post = await em.findOne(Post, { id });
		if (!post) {
			return null;
		}
		if (typeof title !== "undefined") {
			post.title = title;
			em.persistAndFlush(post);
		}
		return post;
	}

	@Mutation(() => Boolean)
	async deletePost(
		@Arg("id") id: number,
		@Ctx() { em }: MyContext
	): Promise<boolean> {
		try {
			await em.nativeDelete(Post, { id });
		} catch {
			return false;
		}
		return true;
	}
}
