/**
 * @apiDefine SupplierResponse
 * @apiSuccess {String} status 响应状态
 * @apiSuccess {Object} data 供应商数据
 * @apiSuccess {String} data._id 供应商ID
 * @apiSuccess {String} data.code 供应商编码
 * @apiSuccess {String} data.name 供应商名称
 * @apiSuccess {String} data.category 供应商类别
 * @apiSuccess {Object} data.businessLicense 营业执照信息
 * @apiSuccess {String} data.businessLicense.number 营业执照号码
 * @apiSuccess {Date} data.businessLicense.expireDate 营业执照到期日期
 * @apiSuccess {Object} data.businessLicense.attachment 营业执照附件
 * @apiSuccess {Array} data.contacts 联系人列表
 * @apiSuccess {Object} data.address 地址信息
 * @apiSuccess {Object} data.bankInfo 银行账户信息
 * @apiSuccess {Object} data.cooperation 合作信息
 * @apiSuccess {Array} data.evaluations 评价记录
 * @apiSuccess {Array} data.transactions 交易记录
 * @apiSuccess {Object} data.blacklist 黑名单信息
 */

/**
 * @apiDefine AuthHeader
 * @apiHeader {String} Authorization Bearer token
 */

/**
 * @api {post} /api/v1/suppliers 创建供应商
 * @apiName CreateSupplier
 * @apiGroup Supplier
 * @apiVersion 1.0.0
 * @apiPermission admin,manager
 * 
 * @apiUse AuthHeader
 * 
 * @apiParam {String} code 供应商编码
 * @apiParam {String} name 供应商名称
 * @apiParam {String} category 供应商类别(material/equipment/service)
 * @apiParam {Object} businessLicense 营业执照信息
 * @apiParam {String} businessLicense.number 营业执照号码
 * @apiParam {Date} businessLicense.expireDate 营业执照到期日期
 * @apiParam {File} businessLicense 营业执照文件
 * @apiParam {Array} contacts 联系人列表
 * @apiParam {Object} address 地址信息
 * @apiParam {Object} bankInfo 银行账户信息
 * @apiParam {Object} cooperation 合作信息
 * 
 * @apiParamExample {json} 请求示例:
 * {
 *   "code": "SUP001",
 *   "name": "测试供应商",
 *   "category": "material",
 *   "businessLicense": {
 *     "number": "BL123456789",
 *     "expireDate": "2024-12-31"
 *   },
 *   "contacts": [{
 *     "name": "张三",
 *     "phone": "13800138000",
 *     "email": "zhangsan@example.com",
 *     "isMain": true
 *   }],
 *   "address": {
 *     "province": "广东省",
 *     "city": "深圳市",
 *     "district": "南山区",
 *     "street": "科技园路1号"
 *   },
 *   "bankInfo": {
 *     "accountName": "测试供应商",
 *     "bankName": "工商银行",
 *     "accountNo": "6222021234567890123"
 *   },
 *   "cooperation": {
 *     "startDate": "2024-01-01"
 *   }
 * }
 * 
 * @apiUse SupplierResponse
 * 
 * @apiSuccessExample {json} 成功响应:
 * {
 *   "status": "success",
 *   "data": {
 *     "_id": "507f1f77bcf86cd799439011",
 *     "code": "SUP001",
 *     "name": "测试供应商",
 *     ...
 *   }
 * }
 * 
 * @apiError (400) BadRequest 请求参数错误
 * @apiError (401) Unauthorized 未授权
 * @apiError (403) Forbidden 权限不足
 */

/**
 * @api {get} /api/v1/suppliers 获取供应商列表
 * @apiName GetSuppliers
 * @apiGroup Supplier
 * @apiVersion 1.0.0
 * 
 * @apiUse AuthHeader
 * 
 * @apiParam {Number} [page=1] 页码
 * @apiParam {Number} [limit=10] 每页数量
 * @apiParam {String} [category] 供应商类别
 * @apiParam {String} [status] 合作状态
 * @apiParam {String} [search] 搜索关键词
 * 
 * @apiSuccess {String} status 响应状态
 * @apiSuccess {Array} data 供应商列表
 * @apiSuccess {Object} pagination 分页信息
 * 
 * @apiSuccessExample {json} 成功响应:
 * {
 *   "status": "success",
 *   "data": [{
 *     "_id": "507f1f77bcf86cd799439011",
 *     "code": "SUP001",
 *     "name": "测试供应商",
 *     ...
 *   }],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 10,
 *     "total": 100,
 *     "pages": 10
 *   }
 * }
 */

/**
 * @api {get} /api/v1/suppliers/:id 获取供应商详情
 * @apiName GetSupplier
 * @apiGroup Supplier
 * @apiVersion 1.0.0
 * 
 * @apiUse AuthHeader
 * 
 * @apiParam {String} id 供应商ID
 * 
 * @apiUse SupplierResponse
 * 
 * @apiError (404) NotFound 供应商不存在
 */

/**
 * @api {patch} /api/v1/suppliers/:id 更新供应商信息
 * @apiName UpdateSupplier
 * @apiGroup Supplier
 * @apiVersion 1.0.0
 * @apiPermission admin,manager
 * 
 * @apiUse AuthHeader
 * 
 * @apiParam {String} id 供应商ID
 * @apiParam {String} [name] 供应商名称
 * @apiParam {Object} [businessLicense] 营业执照信息
 * @apiParam {Array} [contacts] 联系人列表
 * @apiParam {Object} [address] 地址信息
 * @apiParam {Object} [bankInfo] 银行账户信息
 * 
 * @apiUse SupplierResponse
 * 
 * @apiError (404) NotFound 供应商不存在
 */

/**
 * @api {post} /api/v1/suppliers/:id/evaluations 添加供应商评价
 * @apiName AddSupplierEvaluation
 * @apiGroup Supplier
 * @apiVersion 1.0.0
 * @apiPermission admin,manager,project_manager
 * 
 * @apiUse AuthHeader
 * 
 * @apiParam {String} id 供应商ID
 * @apiParam {String} project 项目ID
 * @apiParam {Number} quality 质量评分(1-5)
 * @apiParam {Number} delivery 交付评分(1-5)
 * @apiParam {Number} service 服务评分(1-5)
 * @apiParam {Number} price 价格评分(1-5)
 * @apiParam {String} [comments] 评价备注
 * 
 * @apiParamExample {json} 请求示例:
 * {
 *   "project": "507f1f77bcf86cd799439012",
 *   "quality": 4.5,
 *   "delivery": 4.0,
 *   "service": 4.2,
 *   "price": 4.0,
 *   "comments": "服务质量不错"
 * }
 * 
 * @apiUse SupplierResponse
 */

/**
 * @api {post} /api/v1/suppliers/:id/transactions 记录交易
 * @apiName RecordTransaction
 * @apiGroup Supplier
 * @apiVersion 1.0.0
 * @apiPermission admin,manager,finance
 * 
 * @apiUse AuthHeader
 * 
 * @apiParam {String} id 供应商ID
 * @apiParam {String} type 交易类型(purchase/payment)
 * @apiParam {Number} amount 交易金额
 * @apiParam {String} project 关联项目ID
 * @apiParam {Object} document 交易单据信息
 * 
 * @apiParamExample {json} 请求示例:
 * {
 *   "type": "purchase",
 *   "amount": 10000,
 *   "project": "507f1f77bcf86cd799439012",
 *   "document": {
 *     "type": "purchase_order",
 *     "number": "PO001"
 *   }
 * }
 * 
 * @apiUse SupplierResponse
 */

/**
 * @api {patch} /api/v1/suppliers/:id/cooperation 更新合作状态
 * @apiName UpdateCooperationStatus
 * @apiGroup Supplier
 * @apiVersion 1.0.0
 * @apiPermission admin,manager
 * 
 * @apiUse AuthHeader
 * 
 * @apiParam {String} id 供应商ID
 * @apiParam {String} status 合作状态(active/suspended/terminated)
 * 
 * @apiUse SupplierResponse
 */

/**
 * @api {patch} /api/v1/suppliers/:id/blacklist 更新黑名单状态
 * @apiName UpdateBlacklist
 * @apiGroup Supplier
 * @apiVersion 1.0.0
 * @apiPermission admin
 * 
 * @apiUse AuthHeader
 * 
 * @apiParam {String} id 供应商ID
 * @apiParam {Boolean} isBlacklisted 是否加入黑名单
 * @apiParam {String} reason 原因说明
 * 
 * @apiUse SupplierResponse
 */

/**
 * @api {get} /api/v1/suppliers/stats/overview 获取供应商统计信息
 * @apiName GetSupplierStats
 * @apiGroup Supplier
 * @apiVersion 1.0.0
 * @apiPermission admin,manager
 * 
 * @apiUse AuthHeader
 * 
 * @apiSuccess {String} status 响应状态
 * @apiSuccess {Object} data 统计数据
 * @apiSuccess {Object} data.overview 总体概况
 * @apiSuccess {Object} data.byCategory 按类别统计
 * @apiSuccess {Object} data.byLevel 按等级统计
 * 
 * @apiSuccessExample {json} 成功响应:
 * {
 *   "status": "success",
 *   "data": {
 *     "overview": {
 *       "total": 100,
 *       "active": 80,
 *       "suspended": 15,
 *       "terminated": 5,
 *       "blacklisted": 3
 *     },
 *     "byCategory": {
 *       "material": 40,
 *       "equipment": 30,
 *       "service": 30
 *     },
 *     "byLevel": {
 *       "A": 20,
 *       "B": 30,
 *       "C": 50
 *     }
 *   }
 * }
 */

/**
 * @api {get} /api/v1/suppliers/stats/expired-docs 获取过期文档的供应商
 * @apiName GetExpiredDocSuppliers
 * @apiGroup Supplier
 * @apiVersion 1.0.0
 * @apiPermission admin,manager
 * 
 * @apiUse AuthHeader
 * 
 * @apiSuccess {String} status 响应状态
 * @apiSuccess {Array} data 供应商列表
 * 
 * @apiSuccessExample {json} 成功响应:
 * {
 *   "status": "success",
 *   "data": [{
 *     "_id": "507f1f77bcf86cd799439011",
 *     "code": "SUP001",
 *     "name": "测试供应商",
 *     "businessLicense": {
 *       "number": "BL123456789",
 *       "expireDate": "2024-01-01"
 *     },
 *     "qualifications": [{
 *       "name": "安全生产许可证",
 *       "expireDate": "2024-01-01"
 *     }]
 *   }]
 * }
 */ 