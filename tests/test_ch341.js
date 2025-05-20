import { CH341 } from "../src/js/ch341/CH341.js";
import { I2C } from "../src/js/ch341/I2C.js";
import { EEPROMBlockDevice } from "../src/js/ch341/littlefs.js";
import { LFS, LFS_O_CREAT, LFS_O_RDONLY, LFS_O_TRUNC, LFS_O_WRONLY } from "../src/js/littlefs/lfs_js.js";

async function testEEPROM() {
    try {
        // 初始化 CH341
        console.log("初始化 CH341...");
        const ch341 = new CH341();
        const device = await CH341.requestDevice();
        if (!device) {
            console.error("未找到设备");
            return;
        }

        // 初始化 I2C
        console.log("初始化 I2C...");
        const i2c = new I2C();
        await i2c.open(device);
        i2c.setAddr(0x50);  // EEPROM 地址

        // 创建 EEPROM 块设备
        console.log("创建 EEPROM 块设备...");
        const blockDevice = new EEPROMBlockDevice(i2c, 32, 128);  // 32字节/块，128块

        // 创建文件系统
        console.log("创建文件系统...");
        const lfs = new LFS(blockDevice, 100);

        // 格式化文件系统
        console.log("格式化文件系统...");
        await lfs.format();
        console.log("格式化完成");

        // 挂载文件系统
        console.log("挂载文件系统...");
        await lfs.mount();
        console.log("挂载完成");

        // 写入测试文件
        console.log("写入测试文件...");
        let file = await lfs.open("/test.txt", LFS_O_WRONLY | LFS_O_CREAT | LFS_O_TRUNC);
        const testData = new TextEncoder().encode("Hello EEPROM! 测试数据 123");
        const dataSize = await file.write(testData);
        console.log(`写入 ${dataSize} 字节`);
        await file.sync();
        await file.close();

        // 读取测试文件
        console.log("读取测试文件...");
        file = await lfs.open("/test.txt", LFS_O_RDONLY);
        const readData = await file.read(dataSize);
        console.log("读取数据:", new TextDecoder().decode(readData));
        await file.close();

        // 列出目录
        console.log("列出目录内容...");
        const dir = await lfs.opendir("/");
        let entry;
        while ((entry = await dir.read()) !== null) {
            console.log("文件:", entry);
        }
        await dir.close();

        // 获取文件信息
        console.log("获取文件信息...");
        const stat = await lfs.stat("/test.txt");
        console.log("文件信息:", stat);

        // 遍历所有块
        console.log("遍历存储块...");
        await lfs.traverse(async (block) => {
            console.log("块", block);
        });

        // 清理
        console.log("清理资源...");
        await ch341.exit();
        console.log("测试完成");

    } catch (error) {
        console.error("测试过程中出错:", error);
    }
}

// 运行测试
testEEPROM().catch(console.error);
