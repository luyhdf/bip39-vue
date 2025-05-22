export class EEPROM {
    constructor(options = {}) {
        // 基本信息
        this.brand = options.brand || 'Unknown';        // 品牌
        this.model = options.model || 'Unknown';        // 型号
        this.deviceId = options.deviceId || 0x50;       // 设备地址
        
        // 容量信息
        this.pageSize = options.pageSize || 32;         // 页大小（字节）
        this.pageCount = options.pageCount || 0;        // 页数量
    }

    // 获取设备信息
    getInfo() {
        return {
            brand: this.brand,
            model: this.model,
            deviceId: this.deviceId,
            totalSize: this.pageSize * this.pageCount,
            pageSize: this.pageSize,
            pageCount: this.pageCount
        };
    }

    // 计算物理地址
    getPhysicalAddress(page, offset) {
        return (page * this.pageSize) + offset;
    }

    // 检查地址是否有效
    isValidAddress(address) {
        return address >= 0 && address < this.pageSize * this.pageCount;
    }

    // 获取页信息
    getPageInfo(address) {
        const pageNumber = Math.floor(address / this.pageSize);
        const pageOffset = address % this.pageSize;
        return {
            pageNumber,
            pageOffset,
            remainingBytes: this.pageSize - pageOffset
        };
    }
}

// 预定义的EEPROM型号
export const EEPROM_TYPES = {
    HG24C256: {
        brand: 'HGSEMI(华冠)',
        model: 'HG24C256',
        deviceId: 0x50,
        pageSize: 64,
        pageCount: 512
    }
};
