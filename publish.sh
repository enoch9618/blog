#!/bin/bash

# 颜色定义，让输出更好看
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 博客根目录（根据你的实际路径修改）
BLOG_DIR="/Users/enoch/hugujun"

# 切换到博客目录
cd $BLOG_DIR

echo -e "${BLUE}📝 开始推送博客更新...${NC}"
echo ""

# 1. 检查是否有未提交的更改
if [[ -z $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  没有检测到任何更改，无需提交。${NC}"
    exit 0
fi

# 2. 显示更改的文件
echo -e "${GREEN}📄 检测到以下更改：${NC}"
git status -s
echo ""

# 3. 询问提交信息
echo -e "${BLUE}💬 请输入提交信息（直接回车使用默认信息）：${NC}"
read -p "> " commit_msg

if [ -z "$commit_msg" ]; then
    commit_msg="Update blog content - $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "${YELLOW}使用默认提交信息：${commit_msg}${NC}"
fi
echo ""

# 4. 添加所有更改
echo -e "${GREEN}📦 添加所有更改...${NC}"
git add .
echo ""

# 5. 提交
echo -e "${GREEN}💾 提交更改...${NC}"
git commit -m "$commit_msg"
echo ""

# 6. 推送到 GitHub
echo -e "${GREEN}🚀 推送到 GitHub...${NC}"
git push

# 7. 检查推送结果
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ 博客推送成功！${NC}"
    echo -e "${BLUE}🔗 Cloudflare Pages 将自动构建并部署${NC}"
    echo -e "${BLUE}🌐 大约 30 秒后访问: https://blog-eyt.pages.dev${NC}"
else
    echo ""
    echo -e "${RED}❌ 推送失败，请检查网络连接和 GitHub 权限${NC}"
    exit 1
fi
