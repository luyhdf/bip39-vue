import { BlockDevice } from "../littlefs/lfs_js.js";
import { CH341 } from "./CH341.js";
import { I2C } from "./I2C.js";
import { LFSModule as Module } from "../littlefs/lfs_js.js";

export class EEPROMBlockDevice extends BlockDevice {
    constructor(i2c, block_size = 512, block_count = 64) {
        super();
        this.i2c = i2c;
        this.read_size = block_size;
        this.prog_size = block_size;
        this.block_size = block_size;
        this.block_count = block_count;
        this.page_size = 32; // EEPROM 页大小
    }

    // 计算物理地址
    _getPhysicalAddress(block, off) {
        return (block * this.block_size) + off;
    }

    // 读取数据
    async read(block, off, buffer, size) {
        if (this.onread) {
            if (this.onread(block, off, size) == false) {
                return 0;
            }
        }

        try {
            // 计算 EEPROM 地址
            const addr = block * this.block_size + off;
            // 读取数据
            const data = await this.i2c.ReadData(addr, size, true);
            
            if (Array.isArray(data)) {
                // 处理分块读取的情况
                let offset = 0;
                for (const chunk of data) {
                    Module.HEAPU8.set(new Uint8Array(chunk), buffer + offset);
                    offset += chunk.byteLength;
                }
            } else {
                Module.HEAPU8.set(new Uint8Array(data), buffer);
            }
            return 0;
        } catch (error) {
            console.error("EEPROM read error:", error);
            return -1;
        }
    }

    // 写入数据
    async prog(block, off, buffer, size) {
        if (this.onprog) {
            if (this.onprog(block, off, size) == false) {
                return 0;
            }
        }

        try {
            // 计算 EEPROM 地址
            const addr = block * this.block_size + off;
            // 从 HEAP 中获取数据
            const data = new Uint8Array(Module.HEAPU8.buffer, buffer, size);
            // 写入数据
            await this.i2c.WriteData(addr, data, true);
            return 0;
        } catch (error) {
            console.error("EEPROM write error:", error);
            return -1;
        }
    }

    // 擦除块
    async erase(block) {
        if (this.onerase) {
            this.onerase(block);
        }

        // EEPROM 不需要显式擦除
        return 0;
    }

    async sync() {
        // EEPROM 写入是即时的，不需要同步
        return 0;
    }
}
