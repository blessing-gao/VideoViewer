export async function uploadToMinio(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch('/file/test', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa('test:AB123456')
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('上传失败');
    }
    
    // 返回文件的访问URL
    return `/file/test/${file.name}`;
  } catch (error) {
    console.error('上传错误:', error);
    throw error;
  }
}
