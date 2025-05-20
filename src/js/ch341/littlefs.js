import { BlockDevice } from "../littlefs/lfs_js.js";

export class EEPROMBlockDevice extends BlockDevice {
    constructor (block_size, block_count) {
        super();
        this.read_size = block_size;
        this.prog_size = block_size;
        this.block_size = block_size;
        this.block_count = block_count;
        this._storage = [];
    }
    async read (block, off, buffer, size) {
        if (this.onread) {
            if (this.onread(block, off, size) == false) {
                return 0;
            }
        }

        if (!this._storage[ block ]) {
            this._storage[ block ] = new Uint8Array(this.block_size);
        }

        Module.HEAPU8.set(
            new Uint8Array(this._storage[ block ].buffer, off, size),
            buffer);
        return 0;
    }
    async prog (block, off, buffer, size) {
        if (this.onprog) {
            if (this.onprog(block, off, size) == false) {
                return 0;
            }
        }

        if (!this._storage[ block ]) {
            this._storage[ block ] = new Uint8Array(this.block_size);
        }

        this._storage[ block ].set(
            new Uint8Array(Module.HEAPU8.buffer, buffer, size),
            off);
        return 0;
    }
    async erase (block) {
        if (this.onerase) {
            this.onerase(block);
        }

        delete this._storage[ block ];
        return 0;
    }
}
