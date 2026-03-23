import { NextRequest, NextResponse } from 'next/server';

// 错误响应
function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json(
    { success: false, error: code, message },
    { status }
  );
}

// 成功响应
function successResponse(result: string) {
  return NextResponse.json({ success: true, result });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return errorResponse(400, 'INVALID_REQUEST', '缺少图片数据');
    }

    // 验证 Base64 图片格式
    const matches = image.match(/^data:image\/(jpeg|png|webp);base64,(.+)$/);
    if (!matches) {
      return errorResponse(400, 'UNSUPPORTED_FORMAT', '不支持的图片格式，请使用 JPG、PNG 或 WebP');
    }

    const base64Data = matches[2];

    // 检查图片大小
    const sizeInBytes = (base64Data.length * 3) / 4;
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (sizeInBytes > maxSize) {
      return errorResponse(400, 'IMAGE_TOO_LARGE', '图片大小不能超过 10MB');
    }

    // 获取 API Key
    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      console.error('Missing REMOVE_BG_API_KEY');
      return errorResponse(500, 'API_ERROR', '服务配置错误');
    }

    // 调用 remove.bg API
    const formData = new FormData();
    formData.append('image_file_b64', base64Data);
    formData.append('size', 'auto');

    const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: formData,
    });

    if (!removeBgResponse.ok) {
      const errorText = await removeBgResponse.text();
      console.error('remove.bg API error:', removeBgResponse.status, errorText);

      if (removeBgResponse.status === 402) {
        return errorResponse(503, 'QUOTA_EXCEEDED', '本月免费额度已用完，请下月再试');
      }
      if (removeBgResponse.status === 429) {
        return errorResponse(429, 'RATE_LIMIT_EXCEEDED', '请求过于频繁，请稍后再试');
      }

      return errorResponse(500, 'API_ERROR', '图片处理失败，请稍后重试');
    }

    // 获取处理后的图片
    const resultBuffer = await removeBgResponse.arrayBuffer();
    const resultBase64 = Buffer.from(resultBuffer).toString('base64');

    return successResponse(`data:image/png;base64,${resultBase64}`);

  } catch (error) {
    console.error('API error:', error);
    return errorResponse(500, 'API_ERROR', '服务器错误，请稍后重试');
  }
}
