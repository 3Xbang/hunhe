/**
 * PDF生成工具
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { AppError } = require('./appError');

/**
 * 生成PDF文档
 * @param {Object} data - 文档数据
 * @param {String} template - 模板名称
 * @param {String} outputPath - 输出路径
 * @returns {Promise<String>} 生成的PDF文件路径
 */
const generatePDF = async (data, template, outputPath = null) => {
  try {
    // 创建PDF文档
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: data.title || '文档',
        Author: data.author || '系统生成',
        Subject: data.subject || '文档',
        Keywords: data.keywords || '',
        CreationDate: new Date()
      }
    });

    // 如果提供了输出路径，写入文件
    if (outputPath) {
      // 确保目录存在
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      doc.pipe(fs.createWriteStream(outputPath));
    }

    // 根据模板生成内容
    switch (template) {
      case 'document':
        generateDocumentPDF(doc, data);
        break;
      case 'project':
        generateProjectPDF(doc, data);
        break;
      case 'financial':
        generateFinancialPDF(doc, data);
        break;
      default:
        generateDefaultPDF(doc, data);
    }

    // 完成PDF生成
    doc.end();

    // 返回生成的文件路径
    return outputPath;
  } catch (error) {
    console.error('PDF生成错误:', error);
    throw new AppError('PDF生成失败', 500);
  }
};

/**
 * 生成文档PDF
 * @private
 */
const generateDocumentPDF = (doc, data) => {
  // 标题
  doc.fontSize(24).font('Helvetica-Bold').text(data.title, { align: 'center' });
  doc.moveDown();

  // 基本信息
  doc.fontSize(12).font('Helvetica');
  doc.text(`文档编号: ${data.code || '无'}`);
  doc.text(`创建日期: ${formatDate(data.createdAt)}`);
  doc.text(`文档类型: ${data.category || '未分类'}`);
  doc.text(`密级: ${getSecurityLevelText(data.securityLevel)}`);
  doc.moveDown();

  // 描述
  if (data.description) {
    doc.fontSize(14).font('Helvetica-Bold').text('文档描述');
    doc.fontSize(12).font('Helvetica').text(data.description);
    doc.moveDown();
  }

  // 版本信息
  if (data.versions && data.versions.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold').text('版本历史');
    doc.moveDown(0.5);

    data.versions.forEach((version, index) => {
      doc.fontSize(12).font('Helvetica-Bold').text(`版本 ${version.version}`);
      doc.fontSize(10).font('Helvetica');
      doc.text(`状态: ${version.status}`);
      doc.text(`创建时间: ${formatDate(version.createdAt)}`);
      if (version.description) {
        doc.text(`描述: ${version.description}`);
      }
      if (index < data.versions.length - 1) {
        doc.moveDown(0.5);
      }
    });
  }
};

/**
 * 生成项目PDF
 * @private
 */
const generateProjectPDF = (doc, data) => {
  // 标题
  doc.fontSize(24).font('Helvetica-Bold').text(`项目报告: ${data.name}`, { align: 'center' });
  doc.moveDown();

  // 基本信息
  doc.fontSize(12).font('Helvetica');
  doc.text(`项目编号: ${data.code || '无'}`);
  doc.text(`开始日期: ${formatDate(data.startDate)}`);
  doc.text(`计划结束日期: ${formatDate(data.plannedEndDate)}`);
  doc.text(`状态: ${data.status}`);
  doc.moveDown();

  // 项目描述
  if (data.description) {
    doc.fontSize(14).font('Helvetica-Bold').text('项目描述');
    doc.fontSize(12).font('Helvetica').text(data.description);
    doc.moveDown();
  }

  // 里程碑
  if (data.milestones && data.milestones.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold').text('里程碑');
    doc.moveDown(0.5);

    data.milestones.forEach((milestone, index) => {
      doc.fontSize(12).font('Helvetica-Bold').text(milestone.name);
      doc.fontSize(10).font('Helvetica');
      doc.text(`计划日期: ${formatDate(milestone.plannedDate)}`);
      doc.text(`状态: ${milestone.status}`);
      if (index < data.milestones.length - 1) {
        doc.moveDown(0.5);
      }
    });
    doc.moveDown();
  }

  // 风险
  if (data.risks && data.risks.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold').text('风险');
    doc.moveDown(0.5);

    data.risks.forEach((risk, index) => {
      doc.fontSize(12).font('Helvetica-Bold').text(risk.description);
      doc.fontSize(10).font('Helvetica');
      doc.text(`影响: ${risk.impact}`);
      doc.text(`可能性: ${risk.probability}`);
      doc.text(`状态: ${risk.status}`);
      if (index < data.risks.length - 1) {
        doc.moveDown(0.5);
      }
    });
  }
};

/**
 * 生成财务PDF
 * @private
 */
const generateFinancialPDF = (doc, data) => {
  // 标题
  doc.fontSize(24).font('Helvetica-Bold').text(`财务报告: ${data.title}`, { align: 'center' });
  doc.moveDown();

  // 基本信息
  doc.fontSize(12).font('Helvetica');
  doc.text(`报告日期: ${formatDate(new Date())}`);
  doc.text(`生成人: ${data.generatedBy || '系统'}`);
  doc.moveDown();

  // 总结
  if (data.summary) {
    doc.fontSize(14).font('Helvetica-Bold').text('财务总结');
    doc.fontSize(12).font('Helvetica').text(data.summary);
    doc.moveDown();
  }

  // 交易记录
  if (data.transactions && data.transactions.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold').text('交易记录');
    doc.moveDown(0.5);

    // 表头
    const tableTop = doc.y;
    const tableHeaders = ['日期', '类型', '金额', '状态'];
    const tableColumnWidths = [100, 100, 100, 100];
    let tableX = doc.x;
    
    // 绘制表头
    doc.fontSize(10).font('Helvetica-Bold');
    tableHeaders.forEach((header, i) => {
      doc.text(header, tableX, tableTop, { width: tableColumnWidths[i], align: 'left' });
      tableX += tableColumnWidths[i];
    });
    
    // 绘制表内容
    doc.font('Helvetica').fontSize(10);
    let rowY = tableTop + 20;
    
    data.transactions.forEach((transaction) => {
      let cellX = doc.x;
      
      // 检查是否需要新页
      if (rowY > doc.page.height - 100) {
        doc.addPage();
        rowY = doc.y + 20;
      }
      
      // 绘制单元格
      doc.text(formatDate(transaction.date), cellX, rowY, { width: tableColumnWidths[0], align: 'left' });
      cellX += tableColumnWidths[0];
      
      doc.text(transaction.type, cellX, rowY, { width: tableColumnWidths[1], align: 'left' });
      cellX += tableColumnWidths[1];
      
      doc.text(transaction.amount.toString(), cellX, rowY, { width: tableColumnWidths[2], align: 'left' });
      cellX += tableColumnWidths[2];
      
      doc.text(transaction.status, cellX, rowY, { width: tableColumnWidths[3], align: 'left' });
      
      rowY += 20;
    });
  }
};

/**
 * 生成默认PDF
 * @private
 */
const generateDefaultPDF = (doc, data) => {
  // 标题
  doc.fontSize(24).font('Helvetica-Bold').text(data.title || '文档', { align: 'center' });
  doc.moveDown();

  // 生成日期
  doc.fontSize(12).font('Helvetica');
  doc.text(`生成日期: ${formatDate(new Date())}`);
  doc.moveDown();

  // 内容
  if (data.content) {
    doc.fontSize(12).font('Helvetica').text(data.content);
  }
};

/**
 * 格式化日期
 * @private
 */
const formatDate = (date) => {
  if (!date) return '未设置';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '无效日期';
  
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * 获取安全级别文本
 * @private
 */
const getSecurityLevelText = (level) => {
  switch (level) {
    case 'public': return '公开';
    case 'internal': return '内部';
    case 'confidential': return '保密';
    case 'secret': return '机密';
    default: return '未定义';
  }
};

module.exports = {
  generatePDF
}; 