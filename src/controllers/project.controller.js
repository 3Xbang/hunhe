/**
 * 项目控制器
 */
const ProjectProvider = require('../providers/project.provider');
const logger = require('../utils/logger');

class ProjectController {
  constructor() {
    this.projectProvider = new ProjectProvider();
  }

  /**
   * 创建项目
   */
  async createProject(req, res) {
    try {
      const projectData = {
        ...req.body,
        createdBy: req.user.id
      };
      
      const project = await this.projectProvider.createProject(projectData);
      
      logger.info(`新项目创建成功: ${project.projectCode}`);
      
      res.status(201).json({
        status: 'success',
        data: { project }
      });
    } catch (error) {
      logger.error(`项目创建失败: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * 更新项目进度
   */
  async updateProgress(req, res) {
    try {
      const { projectId } = req.params;
      const updateData = req.body;
      
      const project = await this.projectProvider.updateProjectProgress(projectId, updateData);
      
      logger.info(`项目进度更新成功: ${projectId}`);
      
      res.status(200).json({
        status: 'success',
        data: { project }
      });
    } catch (error) {
      logger.error(`项目进度更新失败: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * 获取项目甘特图数据
   */
  async getGanttData(req, res) {
    try {
      const { projectId } = req.params;
      
      const ganttData = await this.projectProvider.generateGanttData(projectId);
      
      res.status(200).json({
        status: 'success',
        data: { ganttData }
      });
    } catch (error) {
      logger.error(`获取甘特图数据失败: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * 上传项目文件
   */
  async uploadFile(req, res) {
    try {
      const { projectId } = req.params;
      const fileData = {
        ...req.body,
        file: req.file,
        uploadedBy: req.user.id
      };
      
      const file = await this.projectProvider.uploadProjectFile(projectId, fileData);
      
      logger.info(`项目文件上传成功: ${file.filename}`);
      
      res.status(201).json({
        status: 'success',
        data: { file }
      });
    } catch (error) {
      logger.error(`文件上传失败: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * 删除项目
   */
  async deleteProject(req, res) {
    try {
      const { projectId } = req.params;
      
      await this.projectProvider.deleteProject(projectId);
      
      logger.info(`项目删除成功: ${projectId}`);
      
      res.status(200).json({
        status: 'success',
        message: '项目已成功删除'
      });
    } catch (error) {
      logger.error(`项目删除失败: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = new ProjectController(); 