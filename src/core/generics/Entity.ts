import { Identity } from "./Identity.js";

export class Entity<T>{
    private _id:Identity;
    protected props:T;

    protected constructor(props:T, id?:Identity){
        this.props = props;
        this._id = id ?? new Identity();
    }

    get identityId():Identity{
        return this._id;
    }
}