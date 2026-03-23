'use client';

import { useState, useCallback } from 'react';

// API 端点
const API_ENDPOINT = '/api/remove-background';

// API 响应类型
interface ApiResponse {
  success: boolean;
  result?: string;
  error?: string;
  message?: string;
}

export default function Home() {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // 验证文件
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return { valid: false, error: '不支持的图片格式，请上传 JPG、PNG 或 WebP 格式' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: '图片大小不能超过 10MB' };
    }

    return { valid: true };
  };

  // 文件转 Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 处理图片
  const processImage = useCallback(async (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || '未知错误');
      setStatus('error');
      return;
    }

    setStatus('processing');
    setProgress(10);

    try {
      const base64 = await fileToBase64(file);
      setOriginalImage(base64);
      setProgress(30);

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      setProgress(70);
      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || '处理失败，请稍后重试');
      }

      setProgress(100);
      setProcessedImage(data.result || null);
      setStatus('success');

    } catch (error) {
      console.error('处理错误:', error);
      setErrorMessage(error instanceof Error ? error.message : '网络错误，请检查连接后重试');
      setStatus('error');
    }
  }, []);

  // 文件输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  };

  // 拖拽事件
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processImage(file);
  };

  // 下载图片
  const handleDownload = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `removed-background-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 重置
  const handleReset = () => {
    setStatus('idle');
    setOriginalImage(null);
    setProcessedImage(null);
    setProgress(0);
    setErrorMessage('');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">🖼️ Image Background Remover</h1>
          <p className="text-gray-500 text-sm mt-1">一键去除图片背景，生成透明PNG</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 上传区域 */}
        {status === 'idle' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">拖拽图片到这里</h3>
              <p className="text-gray-500 mb-4">或者点击下方按钮选择文件</p>
              
              {/* 使用 label 包裹 input，更可靠 */}
              <label htmlFor="fileInput" className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer">
                选择图片
                <input
                  id="fileInput"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </label>
              
              <p className="text-xs text-gray-400 mt-4">支持 JPG、PNG、WebP，最大 10MB</p>
            </div>
          </div>
        )}

        {/* 处理中 */}
        {status === 'processing' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
            <div className="text-6xl mb-4 animate-spin">⚙️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">正在处理中...</h3>
            <p className="text-gray-500">AI 正在为您去除背景，请稍候</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* 结果展示 */}
        {status === 'success' && originalImage && processedImage && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-6 text-center">处理完成</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2 font-medium">原图</p>
                <div className="rounded-lg overflow-hidden bg-gray-100 aspect-video flex items-center justify-center">
                  <img src={originalImage} alt="原图" className="max-w-full max-h-full object-contain" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2 font-medium">去背景后</p>
                <div 
                  className="rounded-lg overflow-hidden aspect-video flex items-center justify-center"
                  style={{
                    backgroundImage: 'linear-gradient(45deg, #e5e5e5 25%, transparent 25%), linear-gradient(-45deg, #e5e5e5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e5e5 75%), linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                  }}
                >
                  <img src={processedImage} alt="处理后" className="max-w-full max-h-full object-contain" />
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={handleDownload}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>💾</span> 下载透明PNG
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium transition-colors cursor-pointer"
              >
                处理新图片
              </button>
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-8 text-center">
            <div className="text-5xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-red-700 mb-2">处理失败</h3>
            <p className="text-red-600 mb-4">{errorMessage}</p>
            <button
              onClick={handleReset}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer"
            >
              重试
            </button>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">使用说明</h3>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl mb-2">1️⃣</div>
              <p className="text-gray-600">上传图片</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">2️⃣</div>
              <p className="text-gray-600">AI 自动去除背景</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">3️⃣</div>
              <p className="text-gray-600">下载透明 PNG</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Powered by Next.js + remove.bg API</p>
      </footer>
    </main>
  );
}
