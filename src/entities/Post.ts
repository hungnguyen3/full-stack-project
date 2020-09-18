import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

// a type inside database
// stacking decorators
@ObjectType()
@Entity()
export class Post {
	// field is a field for graphql query
	@Field()
	@PrimaryKey()
	id!: number;

	@Field(() => String)
	@Property({ type: "date" })
	createdAt = new Date();

	@Field(() => String)
	@Property({ type: "date", onUpdate: () => new Date() })
	updatedAt = new Date();

	@Field()
	@Property({ type: "text" })
	title!: string;
}
