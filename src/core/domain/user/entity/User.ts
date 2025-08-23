import { Entity } from "@src/core/generics/Entity";

type UserProps = {
    name: string;
    email: string;
    password: string;
}

export class User extends Entity<UserProps>{}