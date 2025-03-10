/**
 * PDF生成工具
 */
const PDFDocument = require('pdfkit');
const moment = require('moment');

class PDFGenerator {
  constructor() {
    this.doc = new PDFDocument();
  }

  /**
   * 生成项目进度报告
   */
  async generateProgressReport(data) {
    const { projectInfo, milestones, tasks } = data;
    
    // 设置文档信息
    this.doc.info.Title = `${projectInfo.name} - 进度报告`;
    this.doc.info.Author = 'Project Management System';

    // 添加页眉
    this.addHeader(projectInfo.name);
    
    // 添加项目基本信息
    this.addProjectInfo(projectInfo);
    
    // 添加里程碑信息
    this.addMilestones(milestones);
    
    // 添加任务信息
    this.addTasks(tasks);
    
    // 添加页脚
    this.addFooter();

    return this.doc;
  }

  /**
   * 生成成本报告
   */
  async generateCostReport(data) {
    const { projectInfo, costs, summary } = data;
    
    // 设置文档信息
    this.doc.info.Title = `${projectInfo.name} - 成本报告`;
    
    // 添加页眉
    this.addHeader(projectInfo.name);
    
    // 添加项目基本信息
    this.addProjectInfo(projectInfo);
    
    // 添加成本汇总
    this.addCostSummary(summary);
    
    // 添加成本明细
    this.addCostDetails(costs);
    
    // 添加页脚
    this.addFooter();

    return this.doc;
  }

  /**
   * 生成风险报告
   */
  async generateRiskReport(data) {
    const { projectInfo, risks } = data;
    
    // 设置文档信息
    this.doc.info.Title = `${projectInfo.name} - 风险报告`;
    
    // 添加页眉
    this.addHeader(projectInfo.name);
    
    // 添加项目基本信息
    this.addProjectInfo(projectInfo);
    
    // 添加风险信息
    this.addRisks(risks);
    
    // 添加页脚
    this.addFooter();

    return this.doc;
  }

  /**
   * 辅助方法
   */
  addHeader(projectName) {
    this.doc
      .fontSize(18)
      .text(projectName, { align: 'center' })
      .moveDown();
  }

  addProjectInfo(projectInfo) {
    this.doc
      .fontSize(12)
      .text(`项目编号: ${projectInfo.code}`)
      .text(`当前进度: ${projectInfo.progress}%`)
      .moveDown();
  }

  addMilestones(milestones) {
    this.doc
      .fontSize(14)
      .text('里程碑', { underline: true })
      .moveDown();

    milestones.forEach(milestone => {
      this.doc
        .fontSize(12)
        .text(`${milestone.name}`)
        .text(`计划日期: ${moment(milestone.plannedDate).format('YYYY-MM-DD')}`)
        .text(`状态: ${milestone.status}`)
        .moveDown();
    });
  }

  addTasks(tasks) {
    this.doc
      .fontSize(14)
      .text('任务', { underline: true })
      .moveDown();

    tasks.forEach(task => {
      this.doc
        .fontSize(12)
        .text(`${task.name}`)
        .text(`进度: ${task.progress}%`)
        .text(`状态: ${task.status}`)
        .moveDown();
    });
  }

  addFooter() {
    this.doc
      .fontSize(10)
      .text(
        `生成时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}`,
        { align: 'right' }
      );
  }
}

module.exports = { PDFGenerator }; 