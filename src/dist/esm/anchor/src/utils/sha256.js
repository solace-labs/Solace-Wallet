import { sha256 } from "js-sha256";
export function hash(data) {
    return sha256(data);
}
