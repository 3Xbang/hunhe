/**
 * 权限管理服务提供者
 * src/providers/permission.provider.js
 */
const { Permission, Role, UserRole, PermissionTemplate, PermissionAssignmentLog, DataScopeRule } = require('../models/permission.model');
const { User } = require('../models/user.model');
const { AppError, notFoundError } = require('../utils/appError');
const { redis } = require('../utils/redis');

class PermissionProvider {
  /**
   * 创建权限
   */
  async createPermission(permissionData) {
    const existingPermission = await Permission.findOne({ code: permissionData.code });
    if (existingPermission) {
      throw new AppError(400, '权限编码已存在');
    }

    const permission = new Permission(permissionData);
    await permission.save();

    // 清除权限缓存
    await this.clearPermissionCache();

    return permission;
  }

  /**
   * 创建角色
   */
  async createRole(roleData) {
    const existingRole = await Role.findOne({ code: roleData.code });
    if (existingRole) {
      throw new AppError(400, '角色编码已存在');
    }

    const role = new Role(roleData);
    await role.save();

    // 清除角色缓存
    await this.clearRoleCache();

    return role;
  }

  /**
   * 分配用户角色
   */
  async assignUserRole(assignData) {
    const { user, role, department, createdBy } = assignData;

    // 检查是否已分配
    const existingAssignment = await UserRole.findOne({ user, role });
    if (existingAssignment) {
      throw new AppError(400, '该用户已分配此角色');
    }

    const userRole = new UserRole({
      user,
      role,
      department,
      createdBy
    });
    await userRole.save();

    // 清除用户权限缓存
    await this.clearUserPermissionCache(user);

    return userRole;
  }

  /**
   * 获取用户权限
   */
  async getUserPermissions(userId) {
    // 先从缓存获取
    const cacheKey = `user_permissions:${userId}`;
    const cachedPermissions = await redis.get(cacheKey);
    if (cachedPermissions) {
      return JSON.parse(cachedPermissions);
    }

    // 获取用户角色
    const userRoles = await UserRole.find({
      user: userId,
      status: true
    }).populate({
      path: 'role',
      match: { status: true },
      populate: {
        path: 'permissions.permission',
        match: { status: true }
      }
    });

    // 整理权限列表
    const permissions = new Set();
    const dataScopes = new Map();

    userRoles.forEach(userRole => {
      if (userRole.role) {
        userRole.role.permissions.forEach(perm => {
          if (perm.permission) {
            permissions.add(perm.permission.code);
            // 记录数据权限范围
            const currentScope = dataScopes.get(perm.permission.code);
            const newScope = perm.dataScope;
            if (!currentScope || this.getScopeWeight(newScope) > this.getScopeWeight(currentScope)) {
              dataScopes.set(perm.permission.code, newScope);
            }
          }
        });
      }
    });

    const result = {
      permissions: Array.from(permissions),
      dataScopes: Object.fromEntries(dataScopes)
    };

    // 缓存权限信息（1小时）
    await redis.setex(cacheKey, 3600, JSON.stringify(result));

    return result;
  }

  /**
   * 检查权限
   */
  async checkPermission(userId, permissionCode, targetData = null) {
    const { permissions, dataScopes } = await this.getUserPermissions(userId);
    
    // 检查是否有权限
    if (!permissions.includes(permissionCode)) {
      return false;
    }

    // 如果没有目标数据，则只检查权限码
    if (!targetData) {
      return true;
    }

    // 检查数据权限
    const scope = dataScopes[permissionCode];
    switch (scope) {
      case 'all':
        return true;
      case 'department':
        return this.checkDepartmentScope(userId, targetData);
      case 'personal':
        return this.checkPersonalScope(userId, targetData);
      default:
        return false;
    }
  }

  /**
   * 获取角色列表
   */
  async getRoles(query = {}) {
    const {
      keyword,
      status,
      page = 1,
      limit = 10
    } = query;

    const filter = {};
    if (keyword) {
      filter.$or = [
        { code: new RegExp(keyword, 'i') },
        { name: new RegExp(keyword, 'i') }
      ];
    }
    if (status !== undefined) {
      filter.status = status;
    }

    const total = await Role.countDocuments(filter);
    const roles = await Role.find(filter)
      .populate('permissions.permission')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return {
      total,
      items: roles,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  }

  /**
   * 获取权限列表
   */
  async getPermissions(query = {}) {
    const {
      module,
      type,
      status,
      page = 1,
      limit = 10
    } = query;

    const filter = {};
    if (module) filter.module = module;
    if (type) filter.type = type;
    if (status !== undefined) filter.status = status;

    const total = await Permission.countDocuments(filter);
    const permissions = await Permission.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ module: 1, type: 1 });

    return {
      total,
      items: permissions,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  }

  /**
   * 直接分配用户权限
   * @param {Object} assignData - 分配数据
   * @param {string} assignData.userId - 用户ID
   * @param {Array} assignData.permissions - 权限ID数组
   * @param {string} assignData.operatorId - 操作人ID
   */
  async assignUserPermissions(assignData) {
    const { userId, permissions, operatorId } = assignData;
    
    // 验证用户是否存在
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(404, '用户不存在');
    }
    
    // 查找所有权限确保它们存在
    const permissionDocs = await Permission.find({
      _id: { $in: permissions }
    });
    
    if (permissionDocs.length !== permissions.length) {
      throw new AppError(400, '部分权限不存在');
    }
    
    // 获取用户当前所有角色
    const userRoles = await UserRole.find({ user: userId });
    
    // 创建或更新"自定义权限"角色
    let customRole = await Role.findOne({ code: `CUSTOM_${userId}` });
    
    if (!customRole) {
      // 创建自定义角色
      customRole = new Role({
        code: `CUSTOM_${userId}`,
        name: `${user.name}的自定义权限`,
        description: '系统为用户自动创建的自定义权限角色',
        permissions: permissions.map(permId => ({
          permission: permId,
          dataScope: 'personal' // 默认个人数据权限
        })),
        isSystem: true,
        createdBy: operatorId
      });
      
      await customRole.save();
      
      // 为用户分配该角色
      await UserRole.create({
        user: userId,
        role: customRole._id,
        createdBy: operatorId
      });
    } else {
      // 更新现有自定义角色
      customRole.permissions = permissions.map(permId => ({
        permission: permId,
        dataScope: 'personal'
      }));
      
      await customRole.save();
    }
    
    // 清除用户权限缓存
    await this.clearUserPermissionCache(userId);
    
    return {
      user: userId,
      permissions: permissionDocs.map(p => ({
        id: p._id,
        code: p.code,
        name: p.name
      }))
    };
  }

  /**
   * 获取用户的权限分配详情
   * @param {string} userId - 用户ID
   */
  async getUserPermissionAssignments(userId) {
    // 获取所有可用权限
    const allPermissions = await Permission.find({ status: true })
      .select('_id code name module type description')
      .sort({ module: 1, type: 1 });
    
    // 获取用户当前权限
    const { permissions } = await this.getUserPermissions(userId);
    
    // 组织权限树结构
    const permissionsByModule = {};
    
    allPermissions.forEach(perm => {
      if (!permissionsByModule[perm.module]) {
        permissionsByModule[perm.module] = {
          name: this.getModuleName(perm.module),
          permissions: []
        };
      }
      
      permissionsByModule[perm.module].permissions.push({
        id: perm._id,
        code: perm.code,
        name: perm.name,
        type: perm.type,
        description: perm.description,
        assigned: permissions.includes(perm.code)
      });
    });
    
    return {
      userId,
      modules: Object.values(permissionsByModule)
    };
  }

  /**
   * 获取模块名称
   */
  getModuleName(moduleCode) {
    const moduleNames = {
      'system': '系统管理',
      'user': '用户管理',
      'project': '项目管理',
      'task': '任务管理',
      'document': '文档管理',
      'knowledge': '知识库',
      'notification': '通知公告',
      'attendance': '考勤管理',
      'finance': '财务管理',
      'contract': '合同管理',
      'supplier': '供应商管理',
      'material': '物料管理',
      'equipment': '设备管理',
      'quality': '质量管理',
      'security': '安全管理'
    };
    
    return moduleNames[moduleCode] || moduleCode;
  }

  /**
   * 辅助方法
   */
  getScopeWeight(scope) {
    const weights = {
      'all': 3,
      'department': 2,
      'personal': 1
    };
    return weights[scope] || 0;
  }

  async checkDepartmentScope(userId, targetData) {
    // 获取用户部门
    const userDepartments = await UserRole.find({ user: userId })
      .distinct('department');
    
    // 检查目标数据是否属于用户部门
    return targetData.department && 
           userDepartments.some(dept => dept.equals(targetData.department));
  }

  async checkPersonalScope(userId, targetData) {
    // 检查目标数据是否属于用户本人
    return targetData.createdBy && targetData.createdBy.equals(userId);
  }

  async clearPermissionCache() {
    const keys = await redis.keys('user_permissions:*');
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }

  async clearRoleCache() {
    const keys = await redis.keys('user_permissions:*');
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }

  async clearUserPermissionCache(userId) {
    await redis.del(`user_permissions:${userId}`);
  }

  /**
   * 批量分配用户权限
   * @param {Object} batchData - 批量分配数据
   * @param {Array} batchData.userIds - 用户ID数组
   * @param {Array} batchData.permissions - 权限ID数组
   * @param {string} batchData.operatorId - 操作人ID
   * @param {Object} requestInfo - 请求相关信息，用于审计
   */
  async batchAssignPermissions(batchData, requestInfo = {}) {
    const { userIds, permissions, operatorId } = batchData;
    
    // 验证用户是否存在
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      throw new AppError(400, '部分用户不存在');
    }
    
    // 查找所有权限确保它们存在
    const permissionDocs = await Permission.find({
      _id: { $in: permissions }
    });
    
    if (permissionDocs.length !== permissions.length) {
      throw new AppError(400, '部分权限不存在');
    }
    
    // 批量处理用户权限
    const results = [];
    const successfulUserIds = [];
    const failedUserIds = [];
    
    // 记录操作前的状态（用于审计）
    const beforeStates = {};
    for (const userId of userIds) {
      try {
        const userPermissions = await this.getUserPermissions(userId);
        beforeStates[userId] = userPermissions;
      } catch (error) {
        console.error(`获取用户(${userId})权限失败:`, error);
        beforeStates[userId] = null;
      }
    }
    
    // 处理所有用户
    for (const userId of userIds) {
      try {
        // 检查用户是否有自定义角色，如果没有就创建
        let customRole = await Role.findOne({ code: `CUSTOM_${userId}` });
        const user = users.find(u => u._id.toString() === userId.toString());
        
        if (!customRole) {
          // 创建自定义角色
          customRole = new Role({
            code: `CUSTOM_${userId}`,
            name: `${user.name}的自定义权限`,
            description: '系统为用户自动创建的自定义权限角色',
            permissions: permissions.map(permId => ({
              permission: permId,
              dataScope: 'personal' // 默认个人数据权限
            })),
            isSystem: true,
            createdBy: operatorId
          });
          
          await customRole.save();
          
          // 为用户分配该角色
          await UserRole.create({
            user: userId,
            role: customRole._id,
            createdBy: operatorId
          });
        } else {
          // 更新现有自定义角色
          // 创建权限ID集合，去重
          const existingPermIds = new Set(customRole.permissions.map(p => p.permission.toString()));
          const newPermIds = permissions.filter(id => !existingPermIds.has(id.toString()));
          
          // 合并权限
          if (newPermIds.length > 0) {
            customRole.permissions = [
              ...customRole.permissions,
              ...newPermIds.map(permId => ({
                permission: permId,
                dataScope: 'personal'
              }))
            ];
            
            await customRole.save();
          }
        }
        
        // 清除用户权限缓存
        await this.clearUserPermissionCache(userId);
        
        // 获取操作后的状态
        const afterState = await this.getUserPermissions(userId);
        
        // 记录结果
        results.push({
          userId,
          success: true,
          user: user.name
        });
        successfulUserIds.push(userId);
      } catch (error) {
        console.error(`为用户(${userId})分配权限失败:`, error);
        failedUserIds.push(userId);
        results.push({
          userId,
          success: false,
          error: error.message
        });
      }
    }
    
    // 记录审计日志
    try {
      await PermissionAssignmentLog.create({
        user: operatorId,
        targetUsers: userIds,
        operationType: 'batch_assign',
        beforeState: beforeStates,
        afterState: { permissionsAssigned: permissions },
        details: `批量为${userIds.length}个用户分配${permissions.length}个权限`,
        status: failedUserIds.length === 0 ? 'success' : 'failed',
        errorMessage: failedUserIds.length > 0 ? `部分用户分配失败: ${failedUserIds.join(', ')}` : null,
        ipAddress: requestInfo.ip,
        userAgent: requestInfo.userAgent
      });
    } catch (error) {
      console.error('记录权限分配日志失败:', error);
    }
    
    return {
      total: userIds.length,
      successful: successfulUserIds.length,
      failed: failedUserIds.length,
      results
    };
  }
  
  /**
   * 创建权限模板
   * @param {Object} templateData - 模板数据
   */
  async createPermissionTemplate(templateData) {
    // 检查名称唯一性
    const existingTemplate = await PermissionTemplate.findOne({ name: templateData.name });
    if (existingTemplate) {
      throw new AppError(400, '模板名称已存在');
    }
    
    // 检查权限是否存在
    const permissionIds = templateData.permissions.map(p => p.permission);
    const permissions = await Permission.find({ _id: { $in: permissionIds } });
    
    if (permissions.length !== permissionIds.length) {
      throw new AppError(400, '部分权限不存在');
    }
    
    // 创建模板
    const template = new PermissionTemplate(templateData);
    await template.save();
    
    // 如果是默认模板，需要更新其他模板的默认状态
    if (templateData.isDefault) {
      await PermissionTemplate.updateMany(
        { _id: { $ne: template._id } },
        { isDefault: false }
      );
    }
    
    return template;
  }
  
  /**
   * 获取权限模板列表
   * @param {Object} query - 查询参数
   */
  async getPermissionTemplates(query = {}) {
    const { name, status, page = 1, limit = 10 } = query;
    
    const filter = {};
    if (name) filter.name = new RegExp(name, 'i');
    if (status !== undefined) filter.status = status;
    
    const total = await PermissionTemplate.countDocuments(filter);
    const templates = await PermissionTemplate.find(filter)
      .populate({
        path: 'permissions.permission',
        select: 'name code module type'
      })
      .populate('createdBy', 'name')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ isDefault: -1, createdAt: -1 });
    
    return {
      total,
      items: templates,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  }
  
  /**
   * 应用权限模板到用户
   * @param {Object} applyData - 应用数据
   * @param {string} applyData.templateId - 模板ID
   * @param {Array} applyData.userIds - 用户ID数组
   * @param {string} applyData.operatorId - 操作人ID
   * @param {Object} requestInfo - 请求相关信息，用于审计
   */
  async applyTemplateToUsers(applyData, requestInfo = {}) {
    const { templateId, userIds, operatorId } = applyData;
    
    // 验证模板是否存在
    const template = await PermissionTemplate.findById(templateId)
      .populate('permissions.permission');
    
    if (!template) {
      throw new AppError(404, '权限模板不存在');
    }
    
    if (!template.status) {
      throw new AppError(400, '权限模板已禁用');
    }
    
    // 验证用户是否存在
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      throw new AppError(400, '部分用户不存在');
    }
    
    // 提取模板中的权限ID
    const permissionIds = template.permissions.map(p => p.permission._id);
    
    // 使用批量分配逻辑
    const result = await this.batchAssignPermissions({
      userIds,
      permissions: permissionIds,
      operatorId
    }, requestInfo);
    
    // 记录审计日志
    try {
      await PermissionAssignmentLog.create({
        user: operatorId,
        targetUsers: userIds,
        operationType: 'template_apply',
        beforeState: {},
        afterState: { template: templateId, permissions: permissionIds },
        details: `应用模板"${template.name}"到${userIds.length}个用户`,
        status: result.failed === 0 ? 'success' : 'failed',
        errorMessage: result.failed > 0 ? `部分用户应用失败` : null,
        ipAddress: requestInfo.ip,
        userAgent: requestInfo.userAgent
      });
    } catch (error) {
      console.error('记录权限模板应用日志失败:', error);
    }
    
    return {
      ...result,
      templateName: template.name
    };
  }
  
  /**
   * 创建自定义数据权限规则
   * @param {Object} ruleData - 规则数据
   */
  async createDataScopeRule(ruleData) {
    // 检查权限是否存在
    const permission = await Permission.findById(ruleData.permission);
    if (!permission) {
      throw new AppError(404, '权限不存在');
    }
    
    // 验证规则
    this.validateDataScopeRule(ruleData);
    
    // 创建规则
    const rule = new DataScopeRule(ruleData);
    await rule.save();
    
    // 清除相关用户的权限缓存
    if (rule.applyTo && rule.applyTo.length > 0) {
      const userIds = rule.applyTo.map(a => a.user);
      for (const userId of userIds) {
        await this.clearUserPermissionCache(userId);
      }
    }
    
    return rule;
  }
  
  /**
   * 验证数据范围规则
   * @param {Object} rule - 规则数据
   */
  validateDataScopeRule(rule) {
    // 根据规则类型验证条件格式
    switch (rule.ruleType) {
      case 'department':
        if (!rule.ruleConditions || !rule.ruleConditions.departments || !Array.isArray(rule.ruleConditions.departments)) {
          throw new AppError(400, '部门规则需要提供departments数组');
        }
        break;
      case 'user':
        if (!rule.ruleConditions || !rule.ruleConditions.users || !Array.isArray(rule.ruleConditions.users)) {
          throw new AppError(400, '用户规则需要提供users数组');
        }
        break;
      case 'role':
        if (!rule.ruleConditions || !rule.ruleConditions.roles || !Array.isArray(rule.ruleConditions.roles)) {
          throw new AppError(400, '角色规则需要提供roles数组');
        }
        break;
      case 'field':
        if (!rule.ruleConditions || !rule.ruleConditions.field || !rule.ruleConditions.operator || rule.ruleConditions.value === undefined) {
          throw new AppError(400, '字段规则需要提供field、operator和value');
        }
        break;
      case 'condition':
        if (!rule.ruleConditions || !rule.ruleConditions.expression) {
          throw new AppError(400, '条件规则需要提供expression表达式');
        }
        break;
      default:
        throw new AppError(400, '无效的规则类型');
    }
  }
  
  /**
   * 获取权限分配日志
   * @param {Object} query - 查询参数
   */
  async getPermissionAssignmentLogs(query = {}) {
    const {
      user,
      targetUser,
      operationType,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = query;
    
    const filter = {};
    
    if (user) filter.user = user;
    if (targetUser) filter.targetUsers = targetUser;
    if (operationType) filter.operationType = operationType;
    if (status) filter.status = status;
    
    // 日期范围
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const total = await PermissionAssignmentLog.countDocuments(filter);
    const logs = await PermissionAssignmentLog.find(filter)
      .populate('user', 'name')
      .populate('targetUsers', 'name')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    return {
      total,
      items: logs,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  }
  
  /**
   * 增强的权限检查，包含自定义数据权限规则
   * @param {string} userId - 用户ID
   * @param {string} permissionCode - 权限编码
   * @param {Object} targetData - 目标数据
   * @param {string} module - 相关模块
   */
  async enhancedPermissionCheck(userId, permissionCode, targetData = null, module = null) {
    // 基础权限检查
    const baseCheck = await this.checkPermission(userId, permissionCode, targetData);
    
    // 如果基础检查失败或没有目标数据，直接返回结果
    if (!baseCheck || !targetData) {
      return baseCheck;
    }
    
    // 如果没有指定模块，直接返回基础检查结果
    if (!module) {
      return baseCheck;
    }
    
    // 获取权限ID
    const permission = await Permission.findOne({ code: permissionCode });
    if (!permission) {
      return false;
    }
    
    // 查找适用于该用户的自定义数据权限规则
    const customRules = await DataScopeRule.find({
      permission: permission._id,
      module,
      status: true,
      'applyTo.user': userId
    });
    
    // 没有自定义规则，返回基础检查结果
    if (customRules.length === 0) {
      return baseCheck;
    }
    
    // 应用所有规则，任一规则满足即可通过
    for (const rule of customRules) {
      const ruleResult = await this.evaluateDataScopeRule(rule, userId, targetData);
      if (ruleResult) {
        return true;
      }
    }
    
    // 所有规则都不满足，返回基础检查结果
    return baseCheck;
  }
  
  /**
   * 评估数据权限规则
   * @param {Object} rule - 规则对象
   * @param {string} userId - 用户ID
   * @param {Object} targetData - 目标数据
   */
  async evaluateDataScopeRule(rule, userId, targetData) {
    switch (rule.ruleType) {
      case 'department':
        return this.evalDepartmentRule(rule.ruleConditions, targetData);
      case 'user':
        return this.evalUserRule(rule.ruleConditions, userId, targetData);
      case 'role':
        return this.evalRoleRule(rule.ruleConditions, userId, targetData);
      case 'field':
        return this.evalFieldRule(rule.ruleConditions, targetData);
      case 'condition':
        return this.evalConditionRule(rule.ruleConditions, userId, targetData);
      default:
        return false;
    }
  }
  
  /**
   * 评估部门规则
   */
  async evalDepartmentRule(conditions, targetData) {
    if (!targetData.department) return false;
    return conditions.departments.includes(targetData.department.toString());
  }
  
  /**
   * 评估用户规则
   */
  async evalUserRule(conditions, userId, targetData) {
    if (!targetData.createdBy) return false;
    return conditions.users.includes(targetData.createdBy.toString());
  }
  
  /**
   * 评估角色规则
   */
  async evalRoleRule(conditions, userId, targetData) {
    // 获取用户角色
    const userRoles = await UserRole.find({ user: userId }).distinct('role');
    const roleIds = userRoles.map(r => r.toString());
    
    // 检查是否有交集
    return conditions.roles.some(role => roleIds.includes(role));
  }
  
  /**
   * 评估字段规则
   */
  async evalFieldRule(conditions, targetData) {
    const { field, operator, value } = conditions;
    
    // 获取字段值
    const fieldValue = this.getNestedProperty(targetData, field);
    
    // 比较
    switch (operator) {
      case 'eq': return fieldValue === value;
      case 'ne': return fieldValue !== value;
      case 'gt': return fieldValue > value;
      case 'lt': return fieldValue < value;
      case 'gte': return fieldValue >= value;
      case 'lte': return fieldValue <= value;
      case 'in': return Array.isArray(value) && value.includes(fieldValue);
      case 'nin': return Array.isArray(value) && !value.includes(fieldValue);
      case 'contains': return typeof fieldValue === 'string' && fieldValue.includes(value);
      default: return false;
    }
  }
  
  /**
   * 评估条件表达式规则
   */
  async evalConditionRule(conditions, userId, targetData) {
    // 这里应该实现一个安全的表达式求值器
    // 出于安全考虑，这里使用简化版
    try {
      // 构建上下文
      const context = {
        user: { id: userId },
        target: targetData
      };
      
      // 简单的表达式示例：
      // "target.status === 'active' && target.owner === user.id"
      
      // 注意：实际实现应该使用安全的表达式求值方法
      // 这里仅作示意，实际生产环境不应使用eval
      const result = function(expr, ctx) {
        return Function('"use strict";return (' + expr + ')').call(ctx);
      }(conditions.expression, context);
      
      return !!result;
    } catch (error) {
      console.error('表达式求值错误:', error);
      return false;
    }
  }
  
  /**
   * 获取嵌套属性
   * @param {Object} obj - 对象
   * @param {string} path - 属性路径，如'user.profile.name'
   */
  getNestedProperty(obj, path) {
    return path.split('.').reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : undefined;
    }, obj);
  }
  
  // 其他操作记录方法
  
  /**
   * 记录权限操作审计
   * @param {Object} auditData - 审计数据
   */
  async recordPermissionAudit(auditData) {
    const {
      userId,
      targetUsers,
      operationType,
      beforeState,
      afterState,
      details,
      status,
      error,
      requestInfo
    } = auditData;
    
    try {
      const log = new PermissionAssignmentLog({
        user: userId,
        targetUsers: Array.isArray(targetUsers) ? targetUsers : [targetUsers],
        operationType,
        beforeState,
        afterState,
        details,
        status: status || (error ? 'failed' : 'success'),
        errorMessage: error,
        ipAddress: requestInfo?.ip,
        userAgent: requestInfo?.userAgent
      });
      
      await log.save();
      return log;
    } catch (error) {
      console.error('记录权限审计失败:', error);
      // 审计记录失败不应该影响主业务流程
      return null;
    }
  }
}

module.exports = new PermissionProvider(); 