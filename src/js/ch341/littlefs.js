import { BlockDevice } from "../littlefs/lfs_js.js";
// import { CH341 } from "./CH341.js";
// import { I2C } from "./I2C.js";
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
            const pageData = await this.i2c.ReadData(addr, size, true);
            if (!pageData || pageData.length === 0) {
                console.error("读取数据为空");
                return -1;
            }
            
            // 获取数组中的实际数据并转换为Uint8Array
            const actualData = new Uint8Array(pageData[0]);
            
            // 打印读取的数据
            const hexValues = Array.from(actualData).map(byte => '0x' + byte.toString(16).padStart(2, '0'));
            console.log(`读出数据,地址:${addr} 字节:${size}`, hexValues.join(' '));

            // 将数据复制到buffer
            Module.HEAPU8.set(actualData, buffer);
            
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
            
            // 打印写入的数据
            // console.log("EEPROM 写入数据:");
            // console.log("地址:", "0x" + addr.toString(16));
            // console.log("大小:", size, "字节");
            const hexValues = Array.from(data).map(byte => '0x' + byte.toString(16).padStart(2, '0'));
            console.log(`写入数据,地址:${addr} 字节:${size}`, hexValues.join(' '));
            
            // 处理跨页写入
            let currentAddr = addr;
            let remainingSize = size;
            let dataOffset = 0;
            
            while (remainingSize > 0) {
                // 计算当前页的剩余空间
                const pageOffset = currentAddr % this.page_size;
                const pageRemaining = this.page_size - pageOffset;
                
                // 计算本次写入的大小
                const writeSize = Math.min(remainingSize, pageRemaining);
                
                // 写入当前页的数据
                const pageData = data.slice(dataOffset, dataOffset + writeSize);
                await this.i2c.WriteData(currentAddr, pageData, true);
                
                // 打印分页数据
                // const hexValues = Array.from(pageData).map(byte => '0x' + byte.toString(16).padStart(2, '0'));
                // console.log(`写入页: 地址 0x${currentAddr.toString(16)}, 大小 ${writeSize} 字节数据:`, hexValues.join(' '));

                // 更新地址和大小
                currentAddr += writeSize;
                dataOffset += writeSize;
                remainingSize -= writeSize;
                
              
            }
            
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

    async cleanup() {
        try {
            if (this.i2c && this.i2c.device) {
                await this.i2c.exit();
            }
        } catch (error) {
            console.error("清理资源时出错:", error);
        }
    }
}
