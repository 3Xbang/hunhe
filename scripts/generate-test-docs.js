/**
 * 测试用例文档生成脚本
 * 自动扫描tests目录，生成测试用例文档
 */
const fs = require('fs').promises;
const path = require('path');
const logger = require('../src/utils/logger');

/**
 * 从测试文件中提取测试用例信息
 */
async function extractTestInfo(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const testInfo = {
      suites: []
    };

    // 提取测试套件信息
    const suiteRegex = /describe\(['"]([^'"]+)['"]/g;
    const testRegex = /it\(['"]([^'"]+)['"]/g;
    const requestRegex = /\.send\(({[\s\S]+?})\)/g;
    const responseRegex = /expect\(res\.body\)\.toEqual\(({[\s\S]+?})\)/g;

    let suite;
    while ((suite = suiteRegex.exec(content)) !== null) {
      const suiteInfo = {
        name: suite[1],
        tests: []
      };

      let test;
      while ((test = testRegex.exec(content)) !== null) {
        const testCase = {
          name: test[1],
          request: null,
          expectedResponse: null
        };

        // 获取请求数据
        const request = requestRegex.exec(content);
        if (request) {
          try {
            testCase.request = JSON.parse(request[1]);
          } catch (e) {
            testCase.request = request[1];
          }
        }

        // 获取预期响应
        const response = responseRegex.exec(content);
        if (response) {
          try {
            testCase.expectedResponse = JSON.parse(response[1]);
          } catch (e) {
            testCase.expectedResponse = response[1];
          }
        }

        suiteInfo.tests.push(testCase);
      }

      testInfo.suites.push(suiteInfo);
    }

    return testInfo;
  } catch (error) {
    logger.error(`处理测试文件 ${filePath} 时出错:`, error);
    return null;
  }
}

/**
 * 生成测试用例文档
 */
async function generateTestDocs() {
  try {
    const testsDir = path.join(__dirname, '../src/tests');
    const files = await fs.readdir(testsDir);
    let markdown = '# 测试用例文档\n\n';
    markdown += `生成时间: ${new Date().toLocaleString()}\n\n`;

    for (const file of files) {
      if (file.endsWith('.test.js')) {
        const moduleName = file.replace('.test.js', '');
        const filePath = path.join(testsDir, file);
        const testInfo = await extractTestInfo(filePath);

        if (testInfo) {
          markdown += `## ${moduleName}\n\n`;

          for (const suite of testInfo.suites) {
            markdown += `### ${suite.name}\n\n`;

            for (const test of suite.tests) {
              markdown += `#### ${test.name}\n\n`;

              if (test.request) {
                markdown += '请求数据:\n```json\n' + 
                          JSON.stringify(test.request, null, 2) + 
                          '\n```\n\n';
              }

              if (test.expectedResponse) {
                markdown += '预期响应:\n```json\n' + 
                          JSON.stringify(test.expectedResponse, null, 2) + 
                          '\n```\n\n';
              }
            }
          }
        }
      }
    }

    // 保存文档
    const docsPath = path.join(__dirname, '../docs/tests/test-cases.md');
    await fs.writeFile(docsPath, markdown);
    logger.info(`测试用例文档已生成: ${docsPath}`);

  } catch (error) {
    logger.error('生成测试用例文档时出错:', error);
  }
}

// 执行生成
generateTestDocs(); 