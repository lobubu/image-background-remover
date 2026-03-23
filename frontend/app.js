// API 端点（部署 Workers 后替换）
const API_ENDPOINT = '/api/remove-background';

// DOM 元素
const uploadSection = document.getElementById('uploadSection');
const processingSection = document.getElementById('processingSection');
const resultSection = document.getElementById('resultSection');
const errorSection = document.getElementById('errorSection');

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const selectBtn = document.getElementById('selectBtn');
const progressBar = document.getElementById('progressBar');
const originalImage = document.getElementById('originalImage');
const processedImage = document.getElementById('processedImage');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const retryBtn = document.getElementById('retryBtn');
const errorMessage = document.getElementById('errorMessage');

// 当前处理的图片数据
let currentResult = null;

// 显示指定区块，隐藏其他
function showSection(section) {
    [uploadSection, processingSection, resultSection, errorSection].forEach(s => {
        s.classList.add('hidden');
    });
    section.classList.remove('hidden');
}

// 显示错误
function showError(message) {
    errorMessage.textContent = message;
    showSection(errorSection);
}

// 验证文件
function validateFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
        return { valid: false, error: '不支持的图片格式，请上传 JPG、PNG 或 WebP 格式' };
    }

    if (file.size > maxSize) {
        return { valid: false, error: '图片大小不能超过 10MB' };
    }

    return { valid: true };
}

// 处理图片
async function processImage(file) {
    // 验证文件
    const validation = validateFile(file);
    if (!validation.valid) {
        showError(validation.error);
        return;
    }

    showSection(processingSection);
    progressBar.style.width = '30%';

    try {
        // 读取文件为 Base64
        const base64 = await fileToBase64(file);
        originalImage.src = base64;
        progressBar.style.width = '50%';

        // 调用 API
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: base64 }),
        });

        progressBar.style.width = '80%';

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || '处理失败，请稍后重试');
        }

        progressBar.style.width = '100%';

        // 显示结果
        currentResult = data.result;
        processedImage.src = currentResult;
        showSection(resultSection);

    } catch (error) {
        console.error('处理错误:', error);
        showError(error.message || '网络错误，请检查连接后重试');
    }
}

// 文件转 Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 下载图片
function downloadImage() {
    if (!currentResult) return;

    const link = document.createElement('a');
    link.href = currentResult;
    link.download = `removed-background-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 重置
function reset() {
    currentResult = null;
    originalImage.src = '';
    processedImage.src = '';
    progressBar.style.width = '0%';
    fileInput.value = '';
    showSection(uploadSection);
}

// 事件绑定
selectBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        processImage(file);
    }
});

dropZone.addEventListener('click', () => {
    fileInput.click();
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file) {
        processImage(file);
    }
});

downloadBtn.addEventListener('click', downloadImage);
resetBtn.addEventListener('click', reset);
retryBtn.addEventListener('click', reset);

// 阻止页面拖拽默认行为
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());
