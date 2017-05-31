import * as mongoose from 'mongoose'

import { Future } from '../structures/Future'

export namespace TableHelper {
    export function createOrReturn<A extends mongoose.Document>(model: mongoose.Model<A>, query: {}, obj: {}): Future<A> {
        return Future.lift(model.findOneAndUpdate(query, obj).exec()).flatMap((a: A) => {
            if (!a) return model.create(obj)
            else return Future.unit(a)
        })
    }
}