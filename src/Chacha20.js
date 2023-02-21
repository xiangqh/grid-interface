class Chacha20 {
    // private input: Uint32Array;

    constructor(key, nonce, counter) {
        this.input = new Uint32Array(16);
        this.input[0] = 1634760805;
        this.input[1] = 857760878;
        this.input[2] = 2036477234;
        this.input[3] = 1797285236;
        this.input[4] = Chacha20.U8TO32_LE(key, 0);
        this.input[5] = Chacha20.U8TO32_LE(key, 4);
        this.input[6] = Chacha20.U8TO32_LE(key, 8);
        this.input[7] = Chacha20.U8TO32_LE(key, 12);
        this.input[8] = Chacha20.U8TO32_LE(key, 16);
        this.input[9] = Chacha20.U8TO32_LE(key, 20);
        this.input[10] = Chacha20.U8TO32_LE(key, 24);
        this.input[11] = Chacha20.U8TO32_LE(key, 28);
        if (nonce.length == 12) {
            this.input[12] = counter;
            this.input[13] = Chacha20.U8TO32_LE(nonce, 0);
            this.input[14] = Chacha20.U8TO32_LE(nonce, 4);
            this.input[15] = Chacha20.U8TO32_LE(nonce, 8);
        } else {
            this.input[12] = counter;
            this.input[13] = 0;
            this.input[14] = Chacha20.U8TO32_LE(nonce, 0);
            this.input[15] = Chacha20.U8TO32_LE(nonce, 4);
        }
    }

    encrypt(dst, src) {
        console.assert(dst.length == src.length);

        const x = new Uint32Array(16);
        const output = new Uint8Array(64);
        let i,
            dpos = 0,
            spos = 0;
        let len = dst.length;

        while (len > 0) {
            for (i = 16; i--;) x[i] = this.input[i];
            for (i = 20; i > 0; i -= 2) {
                this.quarterRound(x, 0, 4, 8, 12);
                this.quarterRound(x, 1, 5, 9, 13);
                this.quarterRound(x, 2, 6, 10, 14);
                this.quarterRound(x, 3, 7, 11, 15);
                this.quarterRound(x, 0, 5, 10, 15);
                this.quarterRound(x, 1, 6, 11, 12);
                this.quarterRound(x, 2, 7, 8, 13);
                this.quarterRound(x, 3, 4, 9, 14);
            }
            for (i = 16; i--;) x[i] += this.input[i];
            for (i = 16; i--;) Chacha20.U32TO8_LE(output, 4 * i, x[i]);

            this.input[12] += 1;
            if (!this.input[12]) {
                this.input[13] += 1;
            }
            if (len <= 64) {
                for (i = len; i--;) {
                    dst[i + dpos] = src[i + spos] ^ output[i];
                }
                return;
            }
            for (i = 64; i--;) {
                dst[i + dpos] = src[i + spos] ^ output[i];
            }
            len -= 64;
            spos += 64;
            dpos += 64;
        }
    }

    quarterRound(x, a, b, c, d) {
        x[a] += x[b];
        x[d] = Chacha20.ROTATE(x[d] ^ x[a], 16);
        x[c] += x[d];
        x[b] = Chacha20.ROTATE(x[b] ^ x[c], 12);
        x[a] += x[b];
        x[d] = Chacha20.ROTATE(x[d] ^ x[a], 8);
        x[c] += x[d];
        x[b] = Chacha20.ROTATE(x[b] ^ x[c], 7);
    }

    static U8TO32_LE(x, i) {
        return x[i] | (x[i + 1] << 8) | (x[i + 2] << 16) | (x[i + 3] << 24);
    }

    static U32TO8_LE(x, i, u) {
        x[i] = u;
        u >>>= 8;
        x[i + 1] = u;
        u >>>= 8;
        x[i + 2] = u;
        u >>>= 8;
        x[i + 3] = u;
    }

    static ROTATE(v, c) {
        return (v << c) | (v >>> (32 - c));
    }
}

const nonce = new Uint8Array(16);
nonce.fill(0);

export default function chacha20(data, key) {
    const chacha = new Chacha20(key, nonce, 0);
    const ret = new Uint8Array(data.length);
    chacha.encrypt(ret, data);
    return ret;
}

// module.exports = {
//     chacha20
// }
