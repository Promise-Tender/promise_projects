const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 配置项（你可以根据需要修改）
const CONFIG = {
  inputDir: './local-images', // 待转换图片的文件夹（相对路径）
  outputDir: './avif-output', // 转换后AVIF图片的输出文件夹
  quality: 80, // AVIF图片质量（1-100，80兼顾画质和体积）
  includeFormats: ['.jpg', '.jpeg', '.png', '.webp'], // 要转换的图片格式
  recursive: true // 是否递归处理子文件夹
};

// 创建输出文件夹（不存在则自动创建）
function createOutputDir(targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`✅ 已创建输出文件夹：${targetDir}`);
  }
}

// 单个图片转换函数
async function convertImage(filePath, outputPath) {
  try {
    // 转换为AVIF格式并保存
    await sharp(filePath)
      .avif({ 
        quality: CONFIG.quality,
        lossless: false // 非无损压缩（体积更小）
      })
      .toFile(outputPath);
    console.log(`✅ 转换成功：${filePath} → ${outputPath}`);
  } catch (error) {
    console.error(`❌ 转换失败：${filePath} → 原因：${error.message}`);
  }
}

// 遍历文件夹（支持递归）
function traverseDir(dir) {
  // 读取当前文件夹下的所有文件/子文件夹
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    
    // 如果是文件夹且开启递归，就继续遍历
    if (file.isDirectory() && CONFIG.recursive) {
      // 同步创建输出文件夹的子目录结构
      const relativePath = path.relative(CONFIG.inputDir, fullPath);
      const outputSubDir = path.join(CONFIG.outputDir, relativePath);
      createOutputDir(outputSubDir);
      traverseDir(fullPath);
    }
    
    // 如果是图片文件，开始转换
    if (file.isFile()) {
      const ext = path.extname(file.name).toLowerCase();
      if (CONFIG.includeFormats.includes(ext)) {
        // 构建输出文件路径（保留原文件名，后缀改为avif）
        const relativePath = path.relative(CONFIG.inputDir, fullPath);
        const outputFilePath = path.join(
          CONFIG.outputDir,
          relativePath.replace(ext, '.avif')
        );
        // 执行转换
        convertImage(fullPath, outputFilePath);
      }
    }
  });
}

// 主函数
async function main() {
  console.log('🚀 开始转换图片为AVIF格式...');
  console.log(`🔧 配置：质量=${CONFIG.quality}，递归=${CONFIG.recursive}`);
  
  // 检查输入文件夹是否存在
  if (!fs.existsSync(CONFIG.inputDir)) {
    console.error(`❌ 错误：输入文件夹 ${CONFIG.inputDir} 不存在！`);
    return;
  }
  
  // 创建输出文件夹
  createOutputDir(CONFIG.outputDir);
  
  // 开始遍历并转换
  traverseDir(CONFIG.inputDir);
}

// 启动脚本
main();