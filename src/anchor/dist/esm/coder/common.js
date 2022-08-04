import { snakeCase } from "snake-case";
import { sha256 } from "js-sha256";
import { IdlError } from "../error";
export function accountSize(idl, idlAccount) {
    if (idlAccount.type.kind === "enum") {
        let variantSizes = idlAccount.type.variants.map((variant) => {
            if (variant.fields === undefined) {
                return 0;
            }
            return variant.fields
                .map((f) => {
                if (!(typeof f === "object" && "name" in f)) {
                    throw new Error("Tuple enum variants not yet implemented.");
                }
                return typeSize(idl, f.type);
            })
                .reduce((a, b) => a + b);
        });
        return Math.max(...variantSizes) + 1;
    }
    if (idlAccount.type.fields === undefined) {
        return 0;
    }
    return idlAccount.type.fields
        .map((f) => typeSize(idl, f.type))
        .reduce((a, b) => a + b, 0);
}
// Returns the size of the type in bytes. For variable length types, just return
// 1. Users should override this value in such cases.
function typeSize(idl, ty) {
    var _a, _b;
    switch (ty) {
        case "bool":
            return 1;
        case "u8":
            return 1;
        case "i8":
            return 1;
        case "i16":
            return 2;
        case "u16":
            return 2;
        case "u32":
            return 4;
        case "i32":
            return 4;
        case "u64":
            return 8;
        case "i64":
            return 8;
        case "u128":
            return 16;
        case "i128":
            return 16;
        case "bytes":
            return 1;
        case "string":
            return 1;
        case "publicKey":
            return 32;
        default:
            if ("vec" in ty) {
                return 1;
            }
            if ("option" in ty) {
                return 1 + typeSize(idl, ty.option);
            }
            if ("defined" in ty) {
                const filtered = (_b = (_a = idl.types) === null || _a === void 0 ? void 0 : _a.filter((t) => t.name === ty.defined)) !== null && _b !== void 0 ? _b : [];
                if (filtered.length !== 1) {
                    throw new IdlError(`Type not found: ${JSON.stringify(ty)}`);
                }
                let typeDef = filtered[0];
                return accountSize(idl, typeDef);
            }
            if ("array" in ty) {
                let arrayTy = ty.array[0];
                let arraySize = ty.array[1];
                return typeSize(idl, arrayTy) * arraySize;
            }
            throw new Error(`Invalid type ${JSON.stringify(ty)}`);
    }
}
// Not technically sighash, since we don't include the arguments, as Rust
// doesn't allow function overloading.
export function sighash(nameSpace, ixName) {
    let name = snakeCase(ixName);
    let preimage = `${nameSpace}:${name}`;
    return Buffer.from(sha256.digest(preimage)).slice(0, 8);
}
//# sourceMappingURL=common.js.map