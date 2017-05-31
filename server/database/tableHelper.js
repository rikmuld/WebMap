"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const future_1 = require("../structures/future");
var TableHelper;
(function (TableHelper) {
    function createOrReturn(model, query, obj) {
        return future_1.Future.lift(model.findOneAndUpdate(query, obj).exec()).flatMap((a) => {
            if (!a)
                return model.create(obj);
            else
                return future_1.Future.unit(a);
        });
    }
    TableHelper.createOrReturn = createOrReturn;
})(TableHelper = exports.TableHelper || (exports.TableHelper = {}));
