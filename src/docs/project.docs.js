/**
 * @apiDefine ProjectSuccess
 * @apiSuccess {String} status 响应状态
 * @apiSuccess {Object} data 项目数据
 * @apiSuccess {String} data._id 项目ID
 * @apiSuccess {String} data.name 项目名称
 * @apiSuccess {String} data.code 项目编号
 * @apiSuccess {String} data.type 项目类型
 * @apiSuccess {String} data.status 项目状态
 * @apiSuccess {Date} data.plannedStartDate 计划开始日期
 * @apiSuccess {Date} data.plannedEndDate 计划结束日期
 * @apiSuccess {Number} data.progress 项目进度
 * @apiSuccess {Object} data.manager 项目经理信息
 */

/**
 * @api {post} /api/v1/projects 创建项目
 * @apiName CreateProject
 * @apiGroup Project
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} Authorization Bearer token
 * 
 * @apiParam {String} name 项目名称
 * @apiParam {String} code 项目编号
 * @apiParam {String} type 项目类型
 * @apiParam {Date} plannedStartDate 计划开始日期
 * @apiParam {Date} plannedEndDate 计划结束日期
 * @apiParam {String} [description] 项目描述
 * @apiParam {Object[]} [attachments] 附件列表
 * 
 * @apiUse ProjectSuccess
 * 
 * @apiError {String} status 错误状态
 * @apiError {String} message 错误信息
 */

/**
 * @api {get} /api/v1/projects 获取项目列表
 * @apiName GetProjects
 * @apiGroup Project
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} Authorization Bearer token
 * 
 * @apiParam {Number} [page=1] 页码
 * @apiParam {Number} [limit=10] 每页数量
 * @apiParam {String} [status] 项目状态
 * @apiParam {String} [type] 项目类型
 * @apiParam {String} [search] 搜索关键词
 * 
 * @apiSuccess {String} status 响应状态
 * @apiSuccess {Object[]} data 项目列表
 * @apiSuccess {Object} pagination 分页信息
 */

/**
 * @api {get} /api/v1/projects/:id 获取项目详情
 * @apiName GetProject
 * @apiGroup Project
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} Authorization Bearer token
 * 
 * @apiParam {String} id 项目ID
 * 
 * @apiUse ProjectSuccess
 */

/**
 * @api {patch} /api/v1/projects/:id 更新项目
 * @apiName UpdateProject
 * @apiGroup Project
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} Authorization Bearer token
 * 
 * @apiParam {String} id 项目ID
 * @apiParam {String} [name] 项目名称
 * @apiParam {String} [status] 项目状态
 * @apiParam {Number} [progress] 项目进度
 * @apiParam {Object[]} [attachments] 附件列表
 * 
 * @apiUse ProjectSuccess
 */

/**
 * @api {post} /api/v1/projects/:id/milestones 创建里程碑
 * @apiName CreateMilestone
 * @apiGroup Project
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} Authorization Bearer token
 * 
 * @apiParam {String} id 项目ID
 * @apiParam {String} name 里程碑名称
 * @apiParam {Date} plannedDate 计划日期
 * @apiParam {Number} weight 权重
 * 
 * @apiSuccess {String} status 响应状态
 * @apiSuccess {Object} data 里程碑数据
 */

/**
 * @api {post} /api/v1/projects/:id/risks 创建风险
 * @apiName CreateRisk
 * @apiGroup Project
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} Authorization Bearer token
 * 
 * @apiParam {String} id 项目ID
 * @apiParam {String} title 风险标题
 * @apiParam {String} type 风险类型
 * @apiParam {String} probability 发生概率
 * @apiParam {String} impact 影响程度
 * 
 * @apiSuccess {String} status 响应状态
 * @apiSuccess {Object} data 风险数据
 */

/**
 * @api {post} /api/v1/projects/:id/resources 分配资源
 * @apiName AllocateResource
 * @apiGroup Project
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} Authorization Bearer token
 * 
 * @apiParam {String} id 项目ID
 * @apiParam {String} resourceType 资源类型
 * @apiParam {String} resourceId 资源ID
 * @apiParam {Number} quantity 数量
 * @apiParam {Date} startDate 开始日期
 * @apiParam {Date} endDate 结束日期
 * 
 * @apiSuccess {String} status 响应状态
 * @apiSuccess {Object} data 资源分配数据
 */

/**
 * @api {post} /api/v1/projects/:id/costs 记录成本
 * @apiName RecordCost
 * @apiGroup Project
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} Authorization Bearer token
 * 
 * @apiParam {String} id 项目ID
 * @apiParam {String} type 成本类型
 * @apiParam {Number} amount 金额
 * @apiParam {Date} date 日期
 * @apiParam {String} description 描述
 * 
 * @apiSuccess {String} status 响应状态
 * @apiSuccess {Object} data 成本数据
 */ 