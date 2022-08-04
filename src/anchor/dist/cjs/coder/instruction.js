"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructionCoder = exports.SIGHASH_GLOBAL_NAMESPACE = exports.SIGHASH_STATE_NAMESPACE = void 0;
const camelcase_1 = __importDefault(require("camelcase"));
const borsh = __importStar(require("@project-serum/borsh"));
const bs58 = __importStar(require("bs58"));
const idl_1 = require("./idl");
const common_1 = require("./common");
/**
 * Namespace for state method function signatures.
 */
exports.SIGHASH_STATE_NAMESPACE = "state";
/**
 * Namespace for global instruction function signatures (i.e. functions
 * that aren't namespaced by the state or any of its trait implementations).
 */
exports.SIGHASH_GLOBAL_NAMESPACE = "global";
/**
 * Encodes and decodes program instructions.
 */
class InstructionCoder {
    constructor(idl) {
        this.idl = idl;
        this.ixLayout = InstructionCoder.parseIxLayout(idl);
        const sighashLayouts = new Map();
        idl.instructions.forEach((ix) => {
            const sh = (0, common_1.sighash)(exports.SIGHASH_GLOBAL_NAMESPACE, ix.name);
            sighashLayouts.set(bs58.encode(sh), {
                layout: this.ixLayout.get(ix.name),
                name: ix.name,
            });
        });
        if (idl.state) {
            idl.state.methods.map((ix) => {
                const sh = (0, common_1.sighash)(exports.SIGHASH_STATE_NAMESPACE, ix.name);
                sighashLayouts.set(bs58.encode(sh), {
                    layout: this.ixLayout.get(ix.name),
                    name: ix.name,
                });
            });
        }
        this.sighashLayouts = sighashLayouts;
    }
    /**
     * Encodes a program instruction.
     */
    encode(ixName, ix) {
        return this._encode(exports.SIGHASH_GLOBAL_NAMESPACE, ixName, ix);
    }
    /**
     * Encodes a program state instruction.
     */
    encodeState(ixName, ix) {
        return this._encode(exports.SIGHASH_STATE_NAMESPACE, ixName, ix);
    }
    _encode(nameSpace, ixName, ix) {
        const buffer = Buffer.alloc(1000); // TODO: use a tighter buffer.
        const methodName = (0, camelcase_1.default)(ixName);
        const layout = this.ixLayout.get(methodName);
        if (!layout) {
            throw new Error(`Unknown method: ${methodName}`);
        }
        const len = layout.encode(ix, buffer);
        const data = buffer.slice(0, len);
        return Buffer.concat([(0, common_1.sighash)(nameSpace, ixName), data]);
    }
    static parseIxLayout(idl) {
        const stateMethods = idl.state ? idl.state.methods : [];
        const ixLayouts = stateMethods
            .map((m) => {
            let fieldLayouts = m.args.map((arg) => {
                var _a, _b;
                return idl_1.IdlCoder.fieldLayout(arg, Array.from([...((_a = idl.accounts) !== null && _a !== void 0 ? _a : []), ...((_b = idl.types) !== null && _b !== void 0 ? _b : [])]));
            });
            const name = (0, camelcase_1.default)(m.name);
            return [name, borsh.struct(fieldLayouts, name)];
        })
            .concat(idl.instructions.map((ix) => {
            let fieldLayouts = ix.args.map((arg) => {
                var _a, _b;
                return idl_1.IdlCoder.fieldLayout(arg, Array.from([...((_a = idl.accounts) !== null && _a !== void 0 ? _a : []), ...((_b = idl.types) !== null && _b !== void 0 ? _b : [])]));
            });
            const name = (0, camelcase_1.default)(ix.name);
            return [name, borsh.struct(fieldLayouts, name)];
        }));
        // @ts-ignore
        return new Map(ixLayouts);
    }
    /**
     * Dewcodes a program instruction.
     */
    decode(ix, encoding = "hex") {
        if (typeof ix === "string") {
            ix = encoding === "hex" ? Buffer.from(ix, "hex") : bs58.decode(ix);
        }
        let sighash = bs58.encode(ix.slice(0, 8));
        let data = ix.slice(8);
        const decoder = this.sighashLayouts.get(sighash);
        if (!decoder) {
            return null;
        }
        return {
            data: decoder.layout.decode(data),
            name: decoder.name,
        };
    }
    /**
     * Returns a formatted table of all the fields in the given instruction data.
     */
    format(ix, accountMetas) {
        return InstructionFormatter.format(ix, accountMetas, this.idl);
    }
}
exports.InstructionCoder = InstructionCoder;
class InstructionFormatter {
    static format(ix, accountMetas, idl) {
        const idlIx = idl.instructions.filter((i) => ix.name === i.name)[0];
        if (idlIx === undefined) {
            console.error("Invalid instruction given");
            return null;
        }
        const args = idlIx.args.map((idlField) => {
            return {
                name: idlField.name,
                type: InstructionFormatter.formatIdlType(idlField.type),
                data: InstructionFormatter.formatIdlData(idlField, ix.data[idlField.name], idl.types),
            };
        });
        const flatIdlAccounts = InstructionFormatter.flattenIdlAccounts(idlIx.accounts);
        const accounts = accountMetas.map((meta, idx) => {
            if (idx < flatIdlAccounts.length) {
                return {
                    name: flatIdlAccounts[idx].name,
                    ...meta,
                };
            }
            // "Remaining accounts" are unnamed in Anchor.
            else {
                return {
                    name: undefined,
                    ...meta,
                };
            }
        });
        return {
            args,
            accounts,
        };
    }
    static formatIdlType(idlType) {
        if (typeof idlType === "string") {
            return idlType;
        }
        if ("vec" in idlType) {
            return `Vec<${this.formatIdlType(idlType.vec)}>`;
        }
        if ("option" in idlType) {
            return `Option<${this.formatIdlType(idlType.option)}>`;
        }
        if ("defined" in idlType) {
            return idlType.defined;
        }
        if ("array" in idlType) {
            return `Array<${idlType.array[0]}; ${idlType.array[1]}>`;
        }
        throw new Error(`Unknown IDL type: ${idlType}`);
    }
    static formatIdlData(idlField, data, types) {
        if (typeof idlField.type === "string") {
            return data.toString();
        }
        // @ts-ignore
        if (idlField.type.vec) {
            // @ts-ignore
            return ("[" +
                data
                    // @ts-ignore
                    .map((d) => this.formatIdlData(
                // @ts-ignore
                { name: "", type: idlField.type.vec }, d))
                    .join(", ") +
                "]");
        }
        // @ts-ignore
        if (idlField.type.option) {
            // @ts-ignore
            return data === null
                ? "null"
                : this.formatIdlData(
                // @ts-ignore
                { name: "", type: idlField.type.option }, data);
        }
        // @ts-ignore
        if (idlField.type.defined) {
            if (types === undefined) {
                throw new Error("User defined types not provided");
            }
            // @ts-ignore
            const filtered = types.filter((t) => t.name === idlField.type.defined);
            if (filtered.length !== 1) {
                // @ts-ignore
                throw new Error(`Type not found: ${idlField.type.defined}`);
            }
            return InstructionFormatter.formatIdlDataDefined(filtered[0], data, types);
        }
        return "unknown";
    }
    static formatIdlDataDefined(typeDef, data, types) {
        if (typeDef.type.kind === "struct") {
            const struct = typeDef.type;
            const fields = Object.keys(data)
                .map((k) => {
                const f = struct.fields.filter((f) => f.name === k)[0];
                if (f === undefined) {
                    throw new Error("Unable to find type");
                }
                return (k + ": " + InstructionFormatter.formatIdlData(f, data[k], types));
            })
                .join(", ");
            return "{ " + fields + " }";
        }
        else {
            if (typeDef.type.variants.length === 0) {
                return "{}";
            }
            // Struct enum.
            if (typeDef.type.variants[0].name) {
                const variants = typeDef.type.variants;
                const variant = Object.keys(data)[0];
                const enumType = data[variant];
                const namedFields = Object.keys(enumType)
                    .map((f) => {
                    var _a;
                    const fieldData = enumType[f];
                    const idlField = (_a = variants[variant]) === null || _a === void 0 ? void 0 : _a.filter((v) => v.name === f)[0];
                    if (idlField === undefined) {
                        throw new Error("Unable to find variant");
                    }
                    return (f +
                        ": " +
                        InstructionFormatter.formatIdlData(idlField, fieldData, types));
                })
                    .join(", ");
                const variantName = (0, camelcase_1.default)(variant, { pascalCase: true });
                if (namedFields.length === 0) {
                    return variantName;
                }
                return `${variantName} { ${namedFields} }`;
            }
            // Tuple enum.
            else {
                // TODO.
                return "Tuple formatting not yet implemented";
            }
        }
    }
    static flattenIdlAccounts(accounts, prefix) {
        // @ts-ignore
        return accounts
            .map((account) => {
            const accName = sentenceCase(account.name);
            // @ts-ignore
            if (account.accounts) {
                const newPrefix = prefix ? `${prefix} > ${accName}` : accName;
                // @ts-ignore
                return InstructionFormatter.flattenIdlAccounts(
                // @ts-ignore
                account.accounts, newPrefix);
            }
            else {
                return {
                    ...account,
                    name: prefix ? `${prefix} > ${accName}` : accName,
                };
            }
        })
            .flat();
    }
}
function sentenceCase(field) {
    const result = field.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
}
//# sourceMappingURL=instruction.js.map