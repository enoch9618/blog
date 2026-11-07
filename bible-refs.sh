
#!/usr/bin/env bash

# ==========================================
# Hugo 圣经经文引用自动转换工具
# 统一备份版
# ==========================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if (($# == 0)); then
    TARGET="$SCRIPT_DIR/content/posts"
else
    TARGET=""
fi

python3 - "$SCRIPT_DIR" "$TARGET" "$@" <<'PYTHON'
import re
import sys
import shutil
from pathlib import Path
from datetime import datetime

root = Path(sys.argv[1]).resolve()
default_target = sys.argv[2]
args = sys.argv[3:]

backup_root = root / ".bible-refs-backup"

# ==========================================
# 1. 圣经书卷名称
# ==========================================

books = {
    "创": "创", "创世记": "创",
    "出": "出", "出埃及记": "出",
    "利": "利", "利未记": "利",
    "民": "民", "民数记": "民",
    "申": "申", "申命记": "申",
    "书": "书", "约书亚记": "书",
    "士": "士", "士师记": "士",
    "得": "得", "路得记": "得",
    "撒上": "撒上", "撒母耳记上": "撒上",
    "撒下": "撒下", "撒母耳记下": "撒下",
    "王上": "王上", "列王纪上": "王上",
    "王下": "王下", "列王纪下": "王下",
    "代上": "代上", "历代志上": "代上",
    "代下": "代下", "历代志下": "代下",
    "拉": "拉", "以斯拉记": "拉",
    "尼": "尼", "尼希米记": "尼",
    "斯": "斯", "以斯帖记": "斯",
    "伯": "伯", "约伯记": "伯",
    "诗": "诗", "诗篇": "诗",
    "箴": "箴", "箴言": "箴",
    "传": "传", "传道书": "传",
    "歌": "歌", "雅歌": "歌",
    "赛": "赛", "以赛亚书": "赛",
    "耶": "耶", "耶利米书": "耶",
    "哀": "哀", "耶利米哀歌": "哀",
    "结": "结", "以西结书": "结",
    "但": "但", "但以理书": "但",
    "何": "何", "何西阿书": "何",
    "珥": "珥", "约珥书": "珥",
    "摩": "摩", "阿摩司书": "摩",
    "俄": "俄", "俄巴底亚书": "俄",
    "拿": "拿", "约拿书": "拿",
    "弥": "弥", "弥迦书": "弥",
    "鸿": "鸿", "那鸿书": "鸿",
    "哈": "哈", "哈巴谷书": "哈",
    "番": "番", "西番雅书": "番",
    "该": "该", "哈该书": "该",
    "亚": "亚", "撒迦利亚书": "亚",
    "玛": "玛", "玛拉基书": "玛",

    "太": "太", "马太福音": "太",
    "可": "可", "马可福音": "可",
    "路": "路", "路加福音": "路",
    "约": "约", "约翰福音": "约",
    "徒": "徒", "使徒行传": "徒",
    "罗": "罗", "罗马书": "罗",
    "林前": "林前", "哥林多前书": "林前",
    "林后": "林后", "哥林多后书": "林后",
    "加": "加", "加拉太书": "加",
    "弗": "弗", "以弗所书": "弗",
    "腓": "腓", "腓立比书": "腓",
    "西": "西", "歌罗西书": "西",
    "帖前": "帖前", "帖撒罗尼迦前书": "帖前",
    "帖后": "帖后", "帖撒罗尼迦后书": "帖后",
    "提前": "提前", "提摩太前书": "提前",
    "提后": "提后", "提摩太后书": "提后",
    "多": "多", "提多书": "多",
    "门": "门", "腓利门书": "门",
    "来": "来", "希伯来书": "来",
    "雅": "雅", "雅各书": "雅",
    "彼前": "彼前", "彼得前书": "彼前",
    "彼后": "彼后", "彼得后书": "彼后",
    "约壹": "约壹", "约翰一书": "约壹",
    "约贰": "约贰", "约翰二书": "约贰",
    "约叁": "约叁", "约翰三书": "约叁",
    "犹": "犹", "犹大书": "犹",
    "启": "启", "启示录": "启",
}

aliases = sorted(books.keys(), key=len, reverse=True)
book_pattern = "|".join(map(re.escape, aliases))

reference_pattern = re.compile(
    rf'(?<![A-Za-z0-9])'
    rf'(?P<book>{book_pattern})'
    rf'(?P<chapter>\d+)'
    rf'[：:]'
    rf'(?P<verses>\d+(?:-\d+)?(?:[ \t]+\d+(?:-\d+)?)*)'
)

unknown_pattern = re.compile(
    r'(?<![\u4e00-\u9fff])'
    r'(?P<book>[\u4e00-\u9fff]{1,8})'
    r'(?P<chapter>\d+)'
    r'[：:]'
    r'(?P<verse>\d+)'
)

# ==========================================
# 2. 转换经文
# ==========================================

def convert_segment(segment, changes):
    def replace(match):
        original = match.group(0)
        book = books[match.group("book")]
        chapter = match.group("chapter")
        verses = match.group("verses")

        converted = f'{{{{< v "{book}{chapter}:{verses}" >}}}}'
        changes.append((original, converted))
        return converted

    return reference_pattern.sub(replace, segment)


def process_line(line):
    changes = []

    # 保护行内代码和已有 Shortcode
    protected_pattern = re.compile(
        r'(`+).*?\1|\{\{<.*?>\}\}'
    )

    parts = []
    last = 0

    for match in protected_pattern.finditer(line):
        parts.append(
            convert_segment(line[last:match.start()], changes)
        )
        parts.append(match.group(0))
        last = match.end()

    parts.append(convert_segment(line[last:], changes))

    return ''.join(parts), changes


# ==========================================
# 3. 搜索 Markdown 文件
# ==========================================

targets = (
    [Path(p).expanduser() for p in args]
    if args else [Path(default_target)]
)

files = []

for target in targets:
    if not target.is_absolute():
        target = root / target

    if target.is_file() and target.suffix.lower() == ".md":
        files.append(target.resolve())

    elif target.is_dir():
        files.extend(
            f.resolve()
            for f in target.rglob("*.md")
            if backup_root not in f.resolve().parents
        )

files = sorted(set(files))

if not files:
    print("没有找到 Markdown 文件。")
    sys.exit(0)

print("=" * 60)
print("Hugo 圣经经文引用自动整理")
print("=" * 60)
print(f"扫描文件：{len(files)} 个\n")

total_changes = 0
total_unknown = 0
changed_files = 0
pending = []

# ==========================================
# 4. 分析文件，不立即修改
# ==========================================

for file in files:

    try:
        relative = file.relative_to(root)
    except ValueError:
        print(f"[跳过] 文件不在博客目录内：{file}")
        continue

    try:
        content = file.read_text(encoding="utf-8")
    except Exception as error:
        print(f"[读取失败] {file}: {error}")
        continue

    lines = content.splitlines(keepends=True)
    new_lines = []
    file_changes = []
    unknowns = []

    in_fence = False
    fence_char = None
    fence_length = 0

    for line_number, line in enumerate(lines, 1):

        stripped = line.lstrip()
        fence_match = re.match(r'^(`{3,}|~{3,})', stripped)

        # 识别 Markdown 代码块
        if fence_match:
            marker = fence_match.group(1)

            if not in_fence:
                in_fence = True
                fence_char = marker[0]
                fence_length = len(marker)

            elif (
                marker[0] == fence_char
                and len(marker) >= fence_length
            ):
                in_fence = False
                fence_char = None

            new_lines.append(line)
            continue

        if in_fence:
            new_lines.append(line)
            continue

        new_line, changes = process_line(line)

        for old, new in changes:
            file_changes.append((line_number, old, new))

        # 检查无法识别的疑似经文
        # 已识别的内容先从检查范围中排除
        check_line = reference_pattern.sub("", line)

        for match in unknown_pattern.finditer(check_line):
            if match.group("book") not in books:
                unknowns.append(
                    (line_number, match.group(0))
                )

        new_lines.append(new_line)

    new_content = ''.join(new_lines)

    if new_content != content:
        pending.append(
            (file, relative, content, new_content, file_changes)
        )

    for number, item in unknowns:
        total_unknown += 1
        print(f"[无法识别] {relative} 第 {number} 行：{item}")
        print("  未作修改，请人工检查。")

# ==========================================
# 5. 创建统一备份批次
# ==========================================

if pending:

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    batch_dir = backup_root / timestamp

    batch_dir.mkdir(parents=True, exist_ok=False)

    print("\n备份目录：", batch_dir)

    for file, relative, old_content, new_content, changes in pending:

        backup = batch_dir / relative
        backup.parent.mkdir(parents=True, exist_ok=True)

        shutil.copy2(file, backup)

        # 备份成功后再写入新文件
        file.write_text(new_content, encoding="utf-8")

        changed_files += 1
        total_changes += len(changes)

        print(f"\n[已修改] {relative}")

        for number, old, new in changes:
            print(f"  第 {number} 行")
            print(f"  原文：{old}")
            print(f"  转换：{new}")

# ==========================================
# 6. 只保留最近 3 次自动备份
# ==========================================

if backup_root.exists():

    batches = sorted(
        [
            p for p in backup_root.iterdir()
            if p.is_dir()
            and re.fullmatch(r'\d{8}_\d{6}_\d{6}', p.name)
        ],
        key=lambda p: p.name,
        reverse=True
    )

    for old_batch in batches[3:]:
        shutil.rmtree(old_batch)
        print(f"\n[清理旧备份] {old_batch.name}")

# ==========================================
# 7. 汇总
# ==========================================

print("\n" + "=" * 60)
print("处理完成")
print("=" * 60)

print(f"扫描文件：{len(files)} 个")
print(f"修改文件：{changed_files} 个")
print(f"转换引用：{total_changes} 处")
print(f"无法识别：{total_unknown} 处")

if changed_files:
    print("\n原始文件已备份至 .bible-refs-backup/")
    print("自动备份仅保留最近 3 次批次。")

if total_changes == 0:
    print("\n没有发现需要转换的经文引用。")

if total_unknown:
    print("\n请人工检查无法识别的内容。")

print("\n完成。")
PYTHON
