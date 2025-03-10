/**
 * @apiDefine EquipmentSuccess
 * @apiSuccess {String} status 响应状态
 * @apiSuccess {Object} data 设备数据
 * @apiSuccess {String} data._id 设备ID
 * @apiSuccess {String} data.code 设备编号
 * @apiSuccess {String} data.name 设备名称
 * @apiSuccess {String} data.model 设备型号
 * @apiSuccess {String} data.category 设备类别
 * @apiSuccess {String} data.status 设备状态
 * @apiSuccess {Object} data.location 位置信息
 * @apiSuccess {Object} data.maintenance 维护信息
 */

/**
 * @api {post} /api/v1/equipments 创建设备
 * @apiName CreateEquipment
 * @apiGroup Equipment
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} Authorization Bearer token
 * 
 * @apiParam {String} code 设备编号
 * @apiParam {String} name 设备名称
 * @apiParam {String} model 设备型号
 * @apiParam {String} category 设备类别
 * @apiParam {Object} [specifications] 规格参数
 * @apiParam {Object} [location] 位置信息
 * @apiParam {Object} [purchase] 采购信息
 * @apiParam {Object} [maintenance] 维护信息
 * @apiParam {File[]} [attachments] 附件
 * 
 * @apiUse EquipmentSuccess
 * 
 * @apiError {String} status 错误状态
 * @apiError {String} message 错误信息
 */

/**
 * @api {get} /api/v1/equipments 获取设备列表
 * @apiName GetEquipments
 * @apiGroup Equipment
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} Authorization Bearer token
 * 
 * @apiParam {Number} [page=1] 页码
 * @apiParam {Number} [limit=10] 每页数量
 * @apiParam {String} [category] 设备类别
 * @apiParam {String} [status] 设备状态
 * @apiParam {String} [search] 搜索关键词
 * @apiParam {String} [site] 站点
 * 
 * @apiSuccess {String} status 响应状态
 * @apiSuccess {Object[]} data 设备列表
 * @apiSuccess {Object} pagination 分页信息
 */

/**
 * @api {get} /api/v1/equipments/:id 获取设备详情
 * @apiName GetEquipment
 * @apiGroup Equipment
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} Authorization Bearer token
 * 
 * @apiParam {String} id 设备ID
 * 
 * @apiUse EquipmentSuccess
 */

/**
 * @api {patch} /api/v1/equipments/:id 更新设备
 * @apiName UpdateEquipment
 * @apiGroup Equipment
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} Authorization Bearer token
 * 
 * @apiParam {String} id 设备ID
 * @apiParam {String} [name] 设备名称
 * @apiParam {String} [status] 设备状态
 * @apiParam {Object} [location] 位置信息
 * @apiParam {Object} [maintenance] 维护信息
 * @apiParam {File[]} [attachments] 附件
 * 
 * @apiUse EquipmentSuccess
 */

/**
 * @api {post} /api/v1/equipments/:id/usage 记录设备使用
 * @apiName RecordEquipmentUsage
 * @apiGroup Equipment
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} Authorization Bearer token
 * 
 * @apiParam {String} id 设备ID
 * @apiParam {String} project 项目ID
 * @apiParam {Date} startTime 开始时间
 * @apiParam {Date} [endTime] 结束时间
 * @apiParam {String} purpose 使用目的
 * 
 * @apiUse EquipmentSuccess
 */

/**
 * @api {post} /api/v1/equipments/:id/maintenance 记录设备维护
 * @apiName RecordMaintenance
 * @apiGroup Equipment
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} Authorization Bearer token
 * 
 * @apiParam {String} id 设备ID
 * @apiParam {String} type 维护类型
 * @apiParam {String} description 维护描述
 * @apiParam {Object[]} [parts] 配件信息
 * @apiParam {File[]} [attachments] 附件
 * 
 * @apiUse EquipmentSuccess
 */

/**
 * @api {get} /api/v1/equipments/stats/overview 获取设备统计信息
 * @apiName GetEquipmentStats
 * @apiGroup Equipment
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} Authorization Bearer token
 * 
 * @apiSuccess {String} status 响应状态
 * @apiSuccess {Object} data 统计数据
 * @apiSuccess {Object} data.overview 总览统计
 * @apiSuccess {Object[]} data.byCategory 按类别统计
 */ 