/**
 * 安全管理服务提供者
 */
const { RiskAssessment, Incident, Inspection, Training } = require('../models/security.model');
const { AppError } = require('../utils/appError');
const { uploadToS3 } = require('../utils/fileUpload');

class SecurityProvider {
  /**
   * 风险评估相关方法
   */
  async createRiskAssessment(assessmentData) {
    // 处理附件上传
    if (assessmentData.attachments) {
      for (let i = 0; i < assessmentData.attachments.length; i++) {
        const attachment = assessmentData.attachments[i];
        if (attachment.file) {
          const result = await uploadToS3(attachment.file);
          assessmentData.attachments[i].url = result.Location;
          delete assessmentData.attachments[i].file;
        }
      }
    }

    const assessment = await RiskAssessment.create(assessmentData);
    return assessment;
  }

  async getRiskAssessment(assessmentId) {
    const assessment = await RiskAssessment.findById(assessmentId)
      .populate('project', 'name code')
      .populate('assessors.user', 'name')
      .populate('review.reviewedBy', 'name')
      .populate('attachments.uploadedBy', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!assessment) {
      throw new AppError('风险评估不存在', 404);
    }

    return assessment;
  }

  async getRiskAssessments(query = {}) {
    const {
      page = 1,
      limit = 10,
      project,
      type,
      status,
      startDate,
      endDate,
      sortBy
    } = query;

    const filter = {};

    if (project) filter.project = project;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.plannedDate = {};
      if (startDate) filter.plannedDate.$gte = new Date(startDate);
      if (endDate) filter.plannedDate.$lte = new Date(endDate);
    }

    let sort = { plannedDate: 1 };
    if (sortBy) {
      switch (sortBy) {
        case 'status':
          sort = { status: 1 };
          break;
        case 'type':
          sort = { type: 1 };
          break;
      }
    }

    const total = await RiskAssessment.countDocuments(filter);
    const assessments = await RiskAssessment.find(filter)
      .populate('project', 'name code')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      assessments
    };
  }

  async updateRiskAssessment(assessmentId, updateData) {
    const assessment = await RiskAssessment.findById(assessmentId);
    if (!assessment) {
      throw new AppError('风险评估不存在', 404);
    }

    // 处理新附件上传
    if (updateData.attachments) {
      for (let i = 0; i < updateData.attachments.length; i++) {
        const attachment = updateData.attachments[i];
        if (attachment.file) {
          const result = await uploadToS3(attachment.file);
          updateData.attachments[i].url = result.Location;
          delete updateData.attachments[i].file;
        }
      }
    }

    Object.assign(assessment, updateData);
    await assessment.save();
    return assessment;
  }

  async reviewRiskAssessment(assessmentId, { status, comments, reviewedBy }) {
    const assessment = await RiskAssessment.findById(assessmentId);
    if (!assessment) {
      throw new AppError('风险评估不存在', 404);
    }

    assessment.review = {
      reviewedBy,
      reviewedAt: new Date(),
      comments,
      status
    };

    if (status === 'approved') {
      assessment.status = 'reviewed';
    } else if (status === 'rejected') {
      assessment.status = 'in_progress';
    }

    await assessment.save();
    return assessment;
  }

  /**
   * 安全事故相关方法
   */
  async createIncident(incidentData) {
    // 处理附件上传
    if (incidentData.attachments) {
      for (let i = 0; i < incidentData.attachments.length; i++) {
        const attachment = incidentData.attachments[i];
        if (attachment.file) {
          const result = await uploadToS3(attachment.file);
          incidentData.attachments[i].url = result.Location;
          delete incidentData.attachments[i].file;
        }
      }
    }

    const incident = await Incident.create(incidentData);
    return incident;
  }

  async getIncident(incidentId) {
    const incident = await Incident.findById(incidentId)
      .populate('project', 'name code')
      .populate('investigation.team.user', 'name')
      .populate('review.reviewedBy', 'name')
      .populate('attachments.uploadedBy', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!incident) {
      throw new AppError('安全事故不存在', 404);
    }

    return incident;
  }

  async getIncidents(query = {}) {
    const {
      page = 1,
      limit = 10,
      project,
      type,
      severity,
      status,
      startDate,
      endDate,
      sortBy
    } = query;

    const filter = {};

    if (project) filter.project = project;
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    let sort = { date: -1 };
    if (sortBy) {
      switch (sortBy) {
        case 'severity':
          sort = { severity: -1 };
          break;
        case 'status':
          sort = { status: 1 };
          break;
      }
    }

    const total = await Incident.countDocuments(filter);
    const incidents = await Incident.find(filter)
      .populate('project', 'name code')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      incidents
    };
  }

  async updateIncident(incidentId, updateData) {
    const incident = await Incident.findById(incidentId);
    if (!incident) {
      throw new AppError('安全事故不存在', 404);
    }

    // 处理新附件上传
    if (updateData.attachments) {
      for (let i = 0; i < updateData.attachments.length; i++) {
        const attachment = updateData.attachments[i];
        if (attachment.file) {
          const result = await uploadToS3(attachment.file);
          updateData.attachments[i].url = result.Location;
          delete updateData.attachments[i].file;
        }
      }
    }

    Object.assign(incident, updateData);
    await incident.save();
    return incident;
  }

  async reviewIncident(incidentId, { status, comments, reviewedBy }) {
    const incident = await Incident.findById(incidentId);
    if (!incident) {
      throw new AppError('安全事故不存在', 404);
    }

    incident.review = {
      reviewedBy,
      reviewedAt: new Date(),
      comments,
      status
    };

    if (status === 'approved') {
      incident.status = 'closed';
    } else if (status === 'rejected') {
      incident.status = 'handling';
    }

    await incident.save();
    return incident;
  }

  /**
   * 安全检查相关方法
   */
  async createInspection(inspectionData) {
    // 处理附件和照片上传
    if (inspectionData.attachments) {
      for (let i = 0; i < inspectionData.attachments.length; i++) {
        const attachment = inspectionData.attachments[i];
        if (attachment.file) {
          const result = await uploadToS3(attachment.file);
          inspectionData.attachments[i].url = result.Location;
          delete inspectionData.attachments[i].file;
        }
      }
    }

    if (inspectionData.items) {
      for (let i = 0; i < inspectionData.items.length; i++) {
        const item = inspectionData.items[i];
        if (item.photos) {
          for (let j = 0; j < item.photos.length; j++) {
            const photo = item.photos[j];
            if (photo.file) {
              const result = await uploadToS3(photo.file);
              inspectionData.items[i].photos[j].url = result.Location;
              delete inspectionData.items[i].photos[j].file;
            }
          }
        }
      }
    }

    const inspection = await Inspection.create(inspectionData);
    return inspection;
  }

  async getInspection(inspectionId) {
    const inspection = await Inspection.findById(inspectionId)
      .populate('project', 'name code')
      .populate('inspectors.user', 'name')
      .populate('items.corrections.verifiedBy', 'name')
      .populate('review.reviewedBy', 'name')
      .populate('attachments.uploadedBy', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!inspection) {
      throw new AppError('安全检查不存在', 404);
    }

    return inspection;
  }

  async getInspections(query = {}) {
    const {
      page = 1,
      limit = 10,
      project,
      type,
      status,
      startDate,
      endDate,
      sortBy
    } = query;

    const filter = {};

    if (project) filter.project = project;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.plannedDate = {};
      if (startDate) filter.plannedDate.$gte = new Date(startDate);
      if (endDate) filter.plannedDate.$lte = new Date(endDate);
    }

    let sort = { plannedDate: 1 };
    if (sortBy) {
      switch (sortBy) {
        case 'status':
          sort = { status: 1 };
          break;
        case 'type':
          sort = { type: 1 };
          break;
      }
    }

    const total = await Inspection.countDocuments(filter);
    const inspections = await Inspection.find(filter)
      .populate('project', 'name code')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      inspections
    };
  }

  async updateInspection(inspectionId, updateData) {
    const inspection = await Inspection.findById(inspectionId);
    if (!inspection) {
      throw new AppError('安全检查不存在', 404);
    }

    // 处理新附件和照片上传
    if (updateData.attachments) {
      for (let i = 0; i < updateData.attachments.length; i++) {
        const attachment = updateData.attachments[i];
        if (attachment.file) {
          const result = await uploadToS3(attachment.file);
          updateData.attachments[i].url = result.Location;
          delete updateData.attachments[i].file;
        }
      }
    }

    if (updateData.items) {
      for (let i = 0; i < updateData.items.length; i++) {
        const item = updateData.items[i];
        if (item.photos) {
          for (let j = 0; j < item.photos.length; j++) {
            const photo = item.photos[j];
            if (photo.file) {
              const result = await uploadToS3(photo.file);
              updateData.items[i].photos[j].url = result.Location;
              delete updateData.items[i].photos[j].file;
            }
          }
        }
      }
    }

    Object.assign(inspection, updateData);
    await inspection.save();
    return inspection;
  }

  async reviewInspection(inspectionId, { status, comments, reviewedBy }) {
    const inspection = await Inspection.findById(inspectionId);
    if (!inspection) {
      throw new AppError('安全检查不存在', 404);
    }

    inspection.review = {
      reviewedBy,
      reviewedAt: new Date(),
      comments,
      status
    };

    if (status === 'approved') {
      inspection.status = 'reviewed';
    } else if (status === 'rejected') {
      inspection.status = 'in_progress';
    }

    await inspection.save();
    return inspection;
  }

  /**
   * 安全培训相关方法
   */
  async createTraining(trainingData) {
    // 处理附件和培训材料上传
    if (trainingData.attachments) {
      for (let i = 0; i < trainingData.attachments.length; i++) {
        const attachment = trainingData.attachments[i];
        if (attachment.file) {
          const result = await uploadToS3(attachment.file);
          trainingData.attachments[i].url = result.Location;
          delete trainingData.attachments[i].file;
        }
      }
    }

    if (trainingData.content?.materials) {
      for (let i = 0; i < trainingData.content.materials.length; i++) {
        const material = trainingData.content.materials[i];
        if (material.file) {
          const result = await uploadToS3(material.file);
          trainingData.content.materials[i].url = result.Location;
          delete trainingData.content.materials[i].file;
        }
      }
    }

    const training = await Training.create(trainingData);
    return training;
  }

  async getTraining(trainingId) {
    const training = await Training.findById(trainingId)
      .populate('project', 'name code')
      .populate('trainers.user', 'name')
      .populate('trainees.user', 'name')
      .populate('attachments.uploadedBy', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!training) {
      throw new AppError('安全培训不存在', 404);
    }

    return training;
  }

  async getTrainings(query = {}) {
    const {
      page = 1,
      limit = 10,
      project,
      type,
      status,
      startDate,
      endDate,
      sortBy
    } = query;

    const filter = {};

    if (project) filter.project = project;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter['schedule.startDate'] = {};
      if (startDate) filter['schedule.startDate'].$gte = new Date(startDate);
      if (endDate) filter['schedule.startDate'].$lte = new Date(endDate);
    }

    let sort = { 'schedule.startDate': 1 };
    if (sortBy) {
      switch (sortBy) {
        case 'status':
          sort = { status: 1 };
          break;
        case 'type':
          sort = { type: 1 };
          break;
      }
    }

    const total = await Training.countDocuments(filter);
    const trainings = await Training.find(filter)
      .populate('project', 'name code')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      trainings
    };
  }

  async updateTraining(trainingId, updateData) {
    const training = await Training.findById(trainingId);
    if (!training) {
      throw new AppError('安全培训不存在', 404);
    }

    // 处理新附件和培训材料上传
    if (updateData.attachments) {
      for (let i = 0; i < updateData.attachments.length; i++) {
        const attachment = updateData.attachments[i];
        if (attachment.file) {
          const result = await uploadToS3(attachment.file);
          updateData.attachments[i].url = result.Location;
          delete updateData.attachments[i].file;
        }
      }
    }

    if (updateData.content?.materials) {
      for (let i = 0; i < updateData.content.materials.length; i++) {
        const material = updateData.content.materials[i];
        if (material.file) {
          const result = await uploadToS3(material.file);
          updateData.content.materials[i].url = result.Location;
          delete updateData.content.materials[i].file;
        }
      }
    }

    Object.assign(training, updateData);
    await training.save();
    return training;
  }

  async recordTrainingAttendance(trainingId, { traineeId, attendance }) {
    const training = await Training.findById(trainingId);
    if (!training) {
      throw new AppError('安全培训不存在', 404);
    }

    const trainee = training.trainees.id(traineeId);
    if (!trainee) {
      throw new AppError('参训人员不存在', 404);
    }

    trainee.attendance = attendance;
    await training.save();
    return training;
  }

  async recordTrainingTest(trainingId, { traineeId, score, result, certificate }) {
    const training = await Training.findById(trainingId);
    if (!training) {
      throw new AppError('安全培训不存在', 404);
    }

    const trainee = training.trainees.id(traineeId);
    if (!trainee) {
      throw new AppError('参训人员不存在', 404);
    }

    trainee.test = {
      score,
      result,
      certificate
    };

    await training.save();
    return training;
  }

  async evaluateTraining(trainingId, evaluationData) {
    const training = await Training.findById(trainingId);
    if (!training) {
      throw new AppError('安全培训不存在', 404);
    }

    training.evaluation = evaluationData;
    training.status = 'evaluated';

    await training.save();
    return training;
  }

  /**
   * 统计方法
   */
  async getSecurityStats(query = {}) {
    const { project, startDate, endDate } = query;

    const filter = {};
    if (project) filter.project = project;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // 风险评估统计
    const riskStats = await RiskAssessment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            type: '$type',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // 事故统计
    const incidentStats = await Incident.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            type: '$type',
            severity: '$severity'
          },
          count: { $sum: 1 },
          deaths: { $sum: '$casualties.deaths' },
          injuries: { $sum: '$casualties.injuries' },
          directLoss: { $sum: '$losses.direct' },
          indirectLoss: { $sum: '$losses.indirect' }
        }
      }
    ]);

    // 检查统计
    const inspectionStats = await Inspection.aggregate([
      { $match: filter },
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            type: '$type',
            result: '$items.result'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // 培训统计
    const trainingStats = await Training.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            type: '$type',
            status: '$status'
          },
          count: { $sum: 1 },
          totalTrainees: { $sum: { $size: '$trainees' } },
          totalDuration: { $sum: '$schedule.duration' }
        }
      }
    ]);

    return {
      riskStats,
      incidentStats,
      inspectionStats,
      trainingStats
    };
  }
}

module.exports = { SecurityProvider }; 