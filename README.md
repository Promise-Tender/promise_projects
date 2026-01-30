# 图片压缩工具
使用node.js将普通图片压缩转换为2K分辨率的AVIF格式文件，极大减小图片体积大小（支持批量转换）。

无需手动安装依赖，将本地需要压缩的图片存入local-images双击运行run-process.bat批处理文件即可！

## 目录说明
- local-images：存放本地要转换的图片
- avif-output：存放转换为AVIF格式的图片
- batch-avif-2k：存放将AVIF图片再次压缩后为2K分辨率的图片

### 自定义修改
如果要自定义修改压缩体积和压缩后的分辨率，将脚本batch-avif-2k用记事本或其他编辑器打开，修改8,9行即可
```js
const CONFIG = {
  inputDir: './avif-output', // 已修改：读取转换后的AVIF目录
  outputDir: './batch-avif-2k',
  targetSize: 200 * 1024, // 200为压缩后体积限制，可以自定义修改
  targetWidth: 2560, // 2K分辨率宽度 (2560x1440)，宽度改为1920可变为1080p画质 (1920x1080 可改为1080p)
  initQuality: 50,
  minQuality: 10,
  qualityStep: 5
};
```
