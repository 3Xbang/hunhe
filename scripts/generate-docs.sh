#!/bin/bash

# 生成API文档
echo "正在生成API文档..."
node scripts/generate-api-docs.js

# 生成测试用例文档
echo "正在生成测试用例文档..."
node scripts/generate-test-docs.js

# 合并文档
echo "正在合并文档..."
cat docs/api/api-docs.md > docs/documentation.md
echo "\n\n---\n\n" >> docs/documentation.md
cat docs/tests/test-cases.md >> docs/documentation.md

echo "文档生成完成！" 