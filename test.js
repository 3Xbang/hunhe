console.log('测试启动...');

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: '服务器运行正常',
    time: new Date()
  });
});

async function startServer() {
  try {
    console.log('尝试连接MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true
    });
    
    console.log('MongoDB连接成功!');
    
    // 检查是否可以创建并查询一个简单的模型
    const Test = mongoose.model('Test', new mongoose.Schema({
      name: String,
      timestamp: { type: Date, default: Date.now }
    }));
    
    const testItem = new Test({ name: 'test-item' });
    await testItem.save();
    console.log('保存测试数据成功:', testItem);
    
    const retrieved = await Test.findById(testItem._id);
    console.log('查询测试数据成功:', retrieved);
    
    // 删除测试数据
    await Test.deleteOne({ _id: testItem._id });
    console.log('删除测试数据成功');
    
  } catch (error) {
    console.error('MongoDB连接或操作失败:', error);
  }
  
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
    console.log(`访问: http://localhost:${PORT}/health`);
  });
}

startServer(); 