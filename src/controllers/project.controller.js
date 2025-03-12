/**
 * 项目控制器
 */
const { Project } = require('../models/project.model');
const { AppError } = require('../utils/appError');

/**
 * 创建新项目
 */
exports.createProject = async (req, res, next) => {
  try {
    const projectData = req.body;
    
    // 设置创建人和管理人为当前用户
    if (req.user) {
      projectData.manager = req.user.id;
      projectData.team = [req.user.id];
    }
    
    const project = await Project.create(projectData);
    
    res.status(201).json({
      status: 'success',
      data: {
        project
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取所有项目
 */
exports.getAllProjects = async (req, res, next) => {
  try {
    // 构建查询条件
    const queryObj = { ...req.query };
    
    // 排除特殊字段
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(field => delete queryObj[field]);
    
    // 高级过滤
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
    
    // 基本查询
    let query = Project.find(JSON.parse(queryStr));
    
    // 排序
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // 字段选择
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }
    
    // 分页
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    
    // 执行查询
    const projects = await query;
    
    // 获取总记录数
    const totalCount = await Project.countDocuments(JSON.parse(queryStr));
    
    res.status(200).json({
      status: 'success',
      results: projects.length,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      data: {
        projects
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取单个项目
 */
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'name email')
      .populate('team', 'name email');
    
    if (!project) {
      return next(new AppError(`未找到ID为${req.params.id}的项目`, 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        project
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新项目
 */
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!project) {
      return next(new AppError(`未找到ID为${req.params.id}的项目`, 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        project
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除项目
 */
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return next(new AppError(`未找到ID为${req.params.id}的项目`, 404));
    }
    
    // 软删除
    await project.softDelete();
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 添加项目团队成员
 */
exports.addTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return next(new AppError('请提供用户ID', 400));
    }
    
    const project = await Project.findById(id);
    
    if (!project) {
      return next(new AppError(`未找到ID为${id}的项目`, 404));
    }
    
    // 检查用户是否已在团队中
    if (project.team.includes(userId)) {
      return next(new AppError('用户已经是项目团队成员', 400));
    }
    
    // 添加用户到团队
    project.team.push(userId);
    await project.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        project
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 移除项目团队成员
 */
exports.removeTeamMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    
    const project = await Project.findById(id);
    
    if (!project) {
      return next(new AppError(`未找到ID为${id}的项目`, 404));
    }
    
    // 检查用户是否在团队中
    if (!project.team.includes(userId)) {
      return next(new AppError('用户不是项目团队成员', 400));
    }
    
    // 移除用户
    project.team = project.team.filter(member => member.toString() !== userId);
    await project.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        project
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 添加项目里程碑
 */
exports.addMilestone = async (req, res, next) => {
  try {
    const { id } = req.params;
    const milestoneData = req.body;
    
    const project = await Project.findById(id);
    
    if (!project) {
      return next(new AppError(`未找到ID为${id}的项目`, 404));
    }
    
    // 添加里程碑
    project.milestones.push(milestoneData);
    await project.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        project
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新项目里程碑
 */
exports.updateMilestone = async (req, res, next) => {
  try {
    const { id, milestoneId } = req.params;
    const milestoneData = req.body;
    
    const project = await Project.findById(id);
    
    if (!project) {
      return next(new AppError(`未找到ID为${id}的项目`, 404));
    }
    
    // 查找里程碑
    const milestoneIndex = project.milestones.findIndex(
      m => m._id.toString() === milestoneId
    );
    
    if (milestoneIndex === -1) {
      return next(new AppError(`未找到ID为${milestoneId}的里程碑`, 404));
    }
    
    // 更新里程碑数据
    Object.keys(milestoneData).forEach(key => {
      project.milestones[milestoneIndex][key] = milestoneData[key];
    });
    
    await project.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        milestone: project.milestones[milestoneIndex]
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除项目里程碑
 */
exports.deleteMilestone = async (req, res, next) => {
  try {
    const { id, milestoneId } = req.params;
    
    const project = await Project.findById(id);
    
    if (!project) {
      return next(new AppError(`未找到ID为${id}的项目`, 404));
    }
    
    // 查找里程碑
    const milestoneIndex = project.milestones.findIndex(
      m => m._id.toString() === milestoneId
    );
    
    if (milestoneIndex === -1) {
      return next(new AppError(`未找到ID为${milestoneId}的里程碑`, 404));
    }
    
    // 移除里程碑
    project.milestones.splice(milestoneIndex, 1);
    await project.save();
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
}; 