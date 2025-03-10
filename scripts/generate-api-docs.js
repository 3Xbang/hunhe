/**
 * API文档生成脚本
 * 自动扫描routes目录，生成API文档
 */
const fs = require('fs').promises;
const path = require('path');
const logger = require('../src/utils/logger');

// API文档模板
const apiTemplate = {
  title: '',
  description: '',
  version: '1.0.0',
  modules: {}
};

/**
 * 从注释中提取API信息
 */
async function extractApiInfo(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const moduleInfo = {
      endpoints: []
    };

    // 提取路由信息
    const routeRegex = /@route\s+(GET|POST|PUT|DELETE|PATCH)\s+([^\n]+)/g;
    const descRegex = /@desc\s+([^\n]+)/g;
    const paramRegex = /@param\s+{([^}]+)}\s+([^\s]+)\s+([^\n]+)/g;
    const returnRegex = /@returns\s+{([^}]+)}\s+([^\n]+)/g;

    let route;
    while ((route = routeRegex.exec(content)) !== null) {
      const endpoint = {
        method: route[1],
        path: route[2].trim(),
        description: '',
        parameters: [],
        responses: {
          success: {},
          error: {}
        }
      };

      // 获取描述
      const desc = descRegex.exec(content);
      if (desc) {
        endpoint.description = desc[1].trim();
      }

      // 获取参数
      let param;
      while ((param = paramRegex.exec(content)) !== null) {
        endpoint.parameters.push({
          type: param[1].trim(),
          name: param[2].trim(),
          description: param[3].trim()
        });
      }

      // 获取返回值
      let returnValue;
      while ((returnValue = returnRegex.exec(content)) !== null) {
        endpoint.responses.success = {
          type: returnValue[1].trim(),
          description: returnValue[2].trim()
        };
      }

      moduleInfo.endpoints.push(endpoint);
    }

    return moduleInfo;
  } catch (error) {
    logger.error(`处理文件 ${filePath} 时出错:`, error);
    return null;
  }
}

/**
 * 生成API文档
 */
async function generateApiDocs() {
  try {
    const routesDir = path.join(__dirname, '../src/routes');
    const files = await fs.readdir(routesDir);
    
    for (const file of files) {
      if (file.endsWith('.routes.js')) {
        const moduleName = file.replace('.routes.js', '');
        const filePath = path.join(routesDir, file);
        const moduleInfo = await extractApiInfo(filePath);
        
        if (moduleInfo) {
          apiTemplate.modules[moduleName] = moduleInfo;
        }
      }
    }

    // 生成markdown文档
    let markdown = '# API文档\n\n';
    markdown += `生成时间: ${new Date().toLocaleString()}\n\n`;

    for (const [moduleName, moduleInfo] of Object.entries(apiTemplate.modules)) {
      markdown += `## ${moduleName}\n\n`;

      for (const endpoint of moduleInfo.endpoints) {
        markdown += `### ${endpoint.method} ${endpoint.path}\n\n`;
        markdown += `${endpoint.description}\n\n`;

        if (endpoint.parameters.length > 0) {
          markdown += '#### 参数\n\n';
          markdown += '| 参数名 | 类型 | 描述 |\n';
          markdown += '|--------|------|------|\n';
          for (const param of endpoint.parameters) {
            markdown += `| ${param.name} | ${param.type} | ${param.description} |\n`;
          }
          markdown += '\n';
        }

        markdown += '#### 响应\n\n';
        markdown += '成功响应:\n```json\n{\n  "status": "success",\n  "data": ' + 
                   JSON.stringify(endpoint.responses.success, null, 2) + '\n}\n```\n\n';
        
        markdown += '错误响应:\n```json\n{\n  "status": "error",\n  "message": "错误信息"\n}\n```\n\n';
      }
    }

    // 保存文档
    const docsPath = path.join(__dirname, '../docs/api/api-docs.md');
    await fs.writeFile(docsPath, markdown);
    logger.info(`API文档已生成: ${docsPath}`);

  } catch (error) {
    logger.error('生成API文档时出错:', error);
  }
}

// 执行生成
generateApiDocs(); 