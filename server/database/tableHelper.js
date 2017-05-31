"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Future_1 = require("../structures/Future");
var TableHelper;
(function (TableHelper) {
    function createOrReturn(model, query, obj) {
        return Future_1.Future.lift(model.findOneAndUpdate(query, obj).exec()).flatMap((a) => {
            if (!a)
                return model.create(obj);
            else
                return Future_1.Future.unit(a);
        });
    }
    TableHelper.createOrReturn = createOrReturn;
})(TableHelper = exports.TableHelper || (exports.TableHelper = {}));
