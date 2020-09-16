import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { type } from "os";
// a type inside database
@Entity()
export class Post {
	@PrimaryKey()
	id!: number;

	@Property({ type: "date" })
	createdAt = new Date();

	@Property({ type: "date", onUpdate: () => new Date() })
	updatedAt = new Date();

	@Property({ type: "text" })
	title!: string;
}
