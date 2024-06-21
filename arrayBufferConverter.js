class ArrayBufferConverter {
    #buffer
    constructor(buffer) {
        this.#buffer = buffer;
    }

    toString() {
        let str = '';
        const bufferUint = new Uint16Array(this.#buffer);
        bufferUint.forEach((e) => {
            str += String.fromCharCode(e);
        });
        return str;
    }
};

 module.exports = ArrayBufferConverter;
