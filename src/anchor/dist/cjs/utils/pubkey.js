"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.associated = exports.findProgramAddressSync = exports.createProgramAddressSync = exports.createWithSeedSync = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const js_sha256_1 = require("js-sha256");
const web3_js_1 = require("@solana/web3.js");
const common_1 = require("../program/common");
// Sync version of web3.PublicKey.createWithSeed.
function createWithSeedSync(fromPublicKey, seed, programId) {
    const buffer = Buffer.concat([
        fromPublicKey.toBuffer(),
        Buffer.from(seed),
        programId.toBuffer(),
    ]);
    const hash = js_sha256_1.sha256.digest(buffer);
    return new web3_js_1.PublicKey(Buffer.from(hash));
}
exports.createWithSeedSync = createWithSeedSync;
// Sync version of web3.PublicKey.createProgramAddress.
function createProgramAddressSync(seeds, programId) {
    const MAX_SEED_LENGTH = 32;
    let buffer = Buffer.alloc(0);
    seeds.forEach(function (seed) {
        if (seed.length > MAX_SEED_LENGTH) {
            throw new TypeError(`Max seed length exceeded`);
        }
        buffer = Buffer.concat([buffer, toBuffer(seed)]);
    });
    buffer = Buffer.concat([
        buffer,
        programId.toBuffer(),
        Buffer.from("ProgramDerivedAddress"),
    ]);
    let hash = (0, js_sha256_1.sha256)(new Uint8Array(buffer));
    let publicKeyBytes = new bn_js_1.default(hash, 16).toArray(undefined, 32);
    if (web3_js_1.PublicKey.isOnCurve(new Uint8Array(publicKeyBytes))) {
        throw new Error(`Invalid seeds, address must fall off the curve`);
    }
    return new web3_js_1.PublicKey(publicKeyBytes);
}
exports.createProgramAddressSync = createProgramAddressSync;
// Sync version of web3.PublicKey.findProgramAddress.
function findProgramAddressSync(seeds, programId) {
    let nonce = 255;
    let address;
    while (nonce != 0) {
        try {
            const seedsWithNonce = seeds.concat(Buffer.from([nonce]));
            address = createProgramAddressSync(seedsWithNonce, programId);
        }
        catch (err) {
            if (err instanceof TypeError) {
                throw err;
            }
            nonce--;
            continue;
        }
        return [address, nonce];
    }
    throw new Error(`Unable to find a viable program address nonce`);
}
exports.findProgramAddressSync = findProgramAddressSync;
const toBuffer = (arr) => {
    if (arr instanceof Buffer) {
        return arr;
    }
    else if (arr instanceof Uint8Array) {
        return Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength);
    }
    else {
        return Buffer.from(arr);
    }
};
async function associated(programId, ...args) {
    let seeds = [Buffer.from([97, 110, 99, 104, 111, 114])]; // b"anchor".
    args.forEach((arg) => {
        seeds.push(
        // @ts-ignore
        arg.buffer !== undefined ? arg : (0, common_1.translateAddress)(arg).toBuffer());
    });
    const [assoc] = await web3_js_1.PublicKey.findProgramAddress(seeds, (0, common_1.translateAddress)(programId));
    return assoc;
}
exports.associated = associated;
//# sourceMappingURL=pubkey.js.map