document.addEventListener("DOMContentLoaded", function() {
    const targets = document.querySelectorAll('.jianpu-render-target');
    targets.forEach(target => {
        const source = target.getAttribute('data-source').trim();
        const renderer = new JianpuRenderer(source);
        target.innerHTML = ''; // 清空加载文字
        target.appendChild(renderer.render());
    });
});

class JianpuRenderer {
    constructor(text) {
        this.lines = text.split('\n').map(l => l.trim());
        this.meta = {};
        this.scoreGroups = []; // [{qTokens: [], cTokens: []}]
        this.parse();
    }

    parse() {
        let lastQ = null;
        this.lines.forEach(line => {
            const cmd = line.substring(0, 2);
            const content = line.substring(2).trim();
            if (cmd === "B:") this.meta.title = content;
            else if (cmd === "Z:") this.meta.author = content;
            else if (cmd === "D:") this.meta.key = content;
            else if (cmd === "P:") this.meta.meter = content;
            else if (cmd === "Q:") {
                // 将 Q 行按空格切分，过滤掉空项
                lastQ = content.split(/\s+/).filter(t => t.length > 0);
            } else if (cmd === "C:") {
                if (lastQ) {
                    const cTokens = content.split(/\s+/).filter(t => t.length > 0);
                    this.scoreGroups.push({ q: lastQ, c: cTokens });
                    lastQ = null;
                }
            }
        });
        // 如果最后一行 Q 没配对 C
        if (lastQ) this.scoreGroups.push({ q: lastQ, c: [] });
    }

    render() {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        const width = 800;
        const padding = 40;
        let y = 40;

        // 1. 标题和元信息
        if (this.meta.title) {
            this.drawText(svg, width/2, y, this.meta.title, 26, "middle", true);
            y += 40;
        }
        if (this.meta.key || this.meta.meter) {
            this.drawText(svg, padding, y, `1 = ${this.meta.key || 'C'}  ${this.meta.meter || '4/4'}`, 18);
            if (this.meta.author) this.drawText(svg, width - padding, y, this.meta.author, 16, "end");
            y += 50;
        }

        // 2. 渲染每一行乐谱
        this.scoreGroups.forEach(group => {
            y = this.renderGroup(svg, group, y, width, padding);
        });

        svg.setAttribute("viewBox", `0 0 ${width} ${y + 20}`);
        svg.setAttribute("width", "100%");
        return svg;
    }

    renderGroup(svg, group, startY, width, padding) {
        const qList = group.q;
        const cList = group.c;
        
        // 关键：计算槽位。以 Q 行的 token 数量为基准
        const totalSlots = qList.length;
        const slotWidth = (width - 2 * padding) / (totalSlots - 1 || 1);
        
        let cIdx = 0;
        qList.forEach((token, i) => {
            const x = padding + (i * slotWidth);
            
            // 绘制小节线
            if (token === "|") {
                this.drawLine(svg, x, startY - 15, x, startY + 15, 2);
                // 歌词如果也是小节线，跳过
                if (cList[cIdx] === "|") cIdx++;
                return;
            }

            // 解析音符核心 (支持 1-7, 0, -)
            const noteMatch = token.match(/[0-7-]/);
            if (noteMatch) {
                const noteChar = noteMatch[0];
                
                // 渲染音符（或增时线）
                if (noteChar === "-") {
                    this.drawLine(svg, x - 10, startY, x + 10, startY, 1.5);
                } else {
                    this.drawText(svg, x, startY + 8, noteChar, 22, "middle", true);
                }

                // 渲染修饰符
                if (token.includes("'")) this.drawCircle(svg, x, startY - 18, 2); // 高音点
                if (token.includes(",")) this.drawCircle(svg, x, startY + 18, 2); // 低音点
                if (token.includes("_")) this.drawLine(svg, x - 12, startY + 15, x + 12, startY + 15, 1.5); // 减时线

                // 渲染歌词：强制对齐到音符下方
                if (cIdx < cList.length && cList[cIdx] !== "|") {
                    this.drawText(svg, x, startY + 45, cList[cIdx], 16, "middle", false, "#444");
                    cIdx++;
                } else if (cList[cIdx] === "|") {
                    // 如果歌词里误写了小节线，跳过它找下一个词
                    cIdx++;
                    if (cIdx < cList.length) {
                        this.drawText(svg, x, startY + 45, cList[cIdx], 16, "middle", false, "#444");
                        cIdx++;
                    }
                }
            }
        });

        return startY + 100; // 返回下一行的起始 Y 坐标
    }

    // 辅助方法
    drawText(svg, x, y, txt, size, anchor, bold=false, color="#000") {
        const el = document.createElementNS("http://www.w3.org/2000/svg", "text");
        el.setAttribute("x", x); el.setAttribute("y", y);
        el.setAttribute("font-size", size);
        el.setAttribute("text-anchor", anchor);
        el.setAttribute("font-family", "monospace, sans-serif");
        if (bold) el.setAttribute("font-weight", "bold");
        el.style.fill = color;
        el.textContent = txt;
        svg.appendChild(el);
    }

    drawLine(svg, x1, y1, x2, y2, weight) {
        const el = document.createElementNS("http://www.w3.org/2000/svg", "line");
        el.setAttribute("x1", x1); el.setAttribute("y1", y1);
        el.setAttribute("x2", x2); el.setAttribute("y2", y2);
        el.setAttribute("stroke", "black");
        el.setAttribute("stroke-width", weight);
        svg.appendChild(el);
    }

    drawCircle(svg, cx, cy, r) {
        const el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        el.setAttribute("cx", cx); el.setAttribute("cy", cy);
        el.setAttribute("r", r);
        el.setAttribute("fill", "black");
        svg.appendChild(el);
    }
}
