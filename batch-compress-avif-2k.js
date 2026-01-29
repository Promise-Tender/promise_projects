const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  inputDir: './avif-output', // 已修改：读取转换后的AVIF目录
  outputDir: './batch-avif-2k',
  targetSize: 200 * 1024,
  targetWidth: 2560,
  initQuality: 50,
  minQuality: 10,
  qualityStep: 5
};

function initOutputDir() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    console.log(`✅ 批量输出目录创建成功：${CONFIG.outputDir}\n`);
  }
}

async function compressSingle(inputPath, quality) {
  try {
    const fileName = path.basename(inputPath);
    const outputFileName = `2k_${Date.now()}_q${quality}_${fileName}`;
    const outputPath = path.join(CONFIG.outputDir, outputFileName);

    await sharp(inputPath)
      .resize(CONFIG.targetWidth)
      .avif({
        quality: quality,
        lossless: false,
        speed: 8,
        chromaSubsampling: '4:2:0'
      })
      .withMetadata(false)
      .toFile(outputPath);

    const stat = fs.statSync(outputPath);
    return { success: true, outputPath, fileSize: stat.size, quality };
  } catch (err) {
    return { success: false, errorMsg: err.message };
  }
}

async function handleSingleImage(inputPath) {
  const fileName = path.basename(inputPath);
  if (!fs.existsSync(inputPath)) {
    console.log(`❌ 跳过${fileName}：文件不存在\n`);
    return;
  }

  const originalStat = fs.statSync(inputPath);
  const originalSize = (originalStat.size / 1024).toFixed(2);
  console.log(`📌 开始处理：${fileName}（原体积：${originalSize}KB）`);

  if (originalStat.size <= CONFIG.targetSize) {
    const result = await compressSingle(inputPath, CONFIG.initQuality);
    if (result.success) {
      const finalSize = (result.fileSize / 1024).toFixed(2);
      console.log(`🎉 快速处理完成（原体积达标）：${finalSize}KB`);
      console.log(`👉 输出路径：${result.outputPath}\n`);
    } else {
      console.log(`❌ 处理失败：${result.errorMsg}\n`);
    }
    return;
  }

  let currentQuality = CONFIG.initQuality;
  let isSuccess = false;
  while (currentQuality >= CONFIG.minQuality) {
    console.log(`🔄 尝试：2K分辨率 + 质量${currentQuality} 压缩`);
    const result = await compressSingle(inputPath, currentQuality);

    if (!result.success) {
      console.log(`❌ 该质量压缩失败：${result.errorMsg}\n`);
      break;
    }

    const compressedSize = (result.fileSize / 1024).toFixed(2);
    if (result.fileSize <= CONFIG.targetSize) {
      console.log(`🎉 处理成功！2K+200KB双重达标`);
      console.log(`👉 最终体积：${compressedSize}KB | 输出路径：${result.outputPath}\n`);
      isSuccess = true;
      break;
    }

    console.log(`👉 体积${compressedSize}KB（>200KB），降低质量继续...\n`);
    currentQuality -= CONFIG.qualityStep;
  }

  if (!isSuccess) {
    const finalResult = await compressSingle(inputPath, CONFIG.minQuality);
    if (finalResult.success) {
      const finalSize = (finalResult.fileSize / 1024).toFixed(2);
      console.log(`⚠️  已降至最低质量${CONFIG.minQuality}，2K下最终体积：${finalSize}KB`);
      console.log(`👉 最终文件路径：${finalResult.outputPath}\n`);
    }
  }
}

async function batchCompress() {
  try {
    initOutputDir();
    if (!fs.existsSync(CONFIG.inputDir)) {
      throw new Error(`输入目录不存在，请检查：${CONFIG.inputDir}`);
    }

    const allFiles = fs.readdirSync(CONFIG.inputDir);
    const avifFiles = allFiles.filter(file => 
      ['.avif'].includes(path.extname(file).toLowerCase())
    );

    if (avifFiles.length === 0) {
      console.log(`ℹ️  ${CONFIG.inputDir} 目录下未找到AVIF格式图片`);
      return;
    }

    console.log(`✅ 检测到${avifFiles.length}个AVIF文件，开始批量2K压缩...\n`);
    for (const file of avifFiles) {
      const inputPath = path.join(CONFIG.inputDir, file);
      await handleSingleImage(inputPath);
    }

    console.log(`✅ 全部处理完成！所有2K压缩文件已保存至：${CONFIG.outputDir}`);
  } catch (error) {
    console.error(`❌ 批量处理失败：${error.message}`);
    process.exit(1);
  }
}

batchCompress();