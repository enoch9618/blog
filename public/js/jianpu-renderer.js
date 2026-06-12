class JianpuRenderer {
    constructor(text) {
        this.raw = text;
        this.meta = { title: '', author: '', key: 'C', meter: '4/4' };
        this.sections = []; // [{q: [], l: []}]
        this.parse();
    }

    parse() {
        const lines = this.raw.split('\n').map(s => s.trim());
        
        lines.forEach(line => {
            const head = line.substring(0, 2).toUpperCase();
            const body = line.substring(2).trim();

            if (head === "B:") this.meta.title = body;
            else if (head === "Z:") this.meta.author = body;
            else if (head === "D:") this.meta.key = body;
            else if (head === "P:") this.meta.meter = body;
            else if (head === "Q:") {
                // 每遇到一个 Q: 就开辟一个新段落
                this.sections.push({ 
                    q: body.split(/\s+/).filter(t => t), 
                    l: [] 
                });
            } 
            else if (head === "L:" || head === "C:") {
                // L: 或 C: 都视为歌词，关联到当前最新的 Q: 段落
                if (this.sections.length > 0) {
                    const currentSection = this.sections[this.sections.length - 1];
                    const lyricTokens = body.split(/\s+/).filter(t => t);
                    // 允许一个 Q: 对应多行歌词（这里简单合并，或者你可以扩展支持多行）
                    currentSection.l = currentSection.l.concat(lyricTokens);
                }
            }
        });
    }

    render() {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        const W = 800; 
        const PAD = 40;
        let y = 40;

        // 1. 元数据渲染
        if (this.meta.title) {
            this.drawText(svg, W/2, y, this.meta.title, 28, "middle", true);
            y += 45;
        }
        this.drawText(svg, PAD, y, `1 = ${this.meta.key}  ${this.meta.meter}`, 18);
        if (this.meta.author) this.drawText(svg, W - PAD, y, this.meta.author, 16, "end");
        y += 60; // 留出第一行乐谱的距离

        // 2. 段落渲染
        this.sections.forEach(sec => {
            y = this.renderSection(svg, sec, y, W, PAD);
        });

        svg.setAttribute("viewBox", `0 0 ${W} ${y + 50}`);
        svg.setAttribute("style", "max-width: 100%; height: auto; background: white;");
        return svg;
    }

    renderSection(svg, sec, startY, W, PAD) {
        const qArr = sec.q;
        const lArr = sec.l;
        // 计算每个 token 占用的平均宽度
        const slotW = (W - 2 * PAD) / (qArr.length > 1 ? qArr.length - 1 : 1);
        let lIdx = 0;

        qArr.forEach((token, i) => {
            const x = PAD + i * slotW;

            // 1. 跳过单纯的连音线符号（不占位或仅占位）
            if (token === "(" || token === ")") return;

            // 2. 小节线渲染
            if (token.match(/[|:|!]/)) {
                this.drawBar(svg, x, startY, token);
                // 如果歌词里也有小节线占位符，消耗掉它
                if (lArr[lIdx] === "|") lIdx++;
                return;
            }

            // 3. 音符解析 (1-7, 0, - 及其后缀)
            const match = token.match(/^([0-7-])(['|,]*)([.]*)(_*)$/);
            if (match) {
                const [_, note, oct, dots, beams] = match;

                // 绘制音符或增时线
                if (note === "-") {
                    this.drawLine(svg, x - 10, startY, x + 10, startY, 2);
                } else {
                    this.drawText(svg, x, startY + 8, note, 24, "middle", true);
                }

                // 高低音点
                if (oct) {
                    const isHigh = oct.includes("'");
                    for (let j = 0; j < oct.length; j++) {
                        const off = isHigh ? -(22 + j * 7) : (20 + j * 7);
                        this.drawCircle(svg, x, startY + off, 2);
                    }
                }

                // 附点
                if (dots) {
                    for (let j = 0; j < dots.length; j++) {
                        this.drawCircle(svg, x + 15 + j * 6, startY + 4, 1.5);
                    }
                }

                // 减时线
                if (beams) {
                    for (let j = 0; j < beams.length; j++) {
                        const off = 16 + j * 6;
                        this.drawLine(svg, x - 12, startY + off, x + 12, startY + off, 1.5);
                    }
                }

                // 4. 歌词渲染 (核心对齐逻辑)
                if (lIdx < lArr.length && lArr[lIdx] !== "|") {
                    this.drawText(svg, x, startY + 50, lArr[lIdx], 16, "middle", false, "#333");
                    lIdx++;
                }
            }
        });

        return startY + 110; // 返回下一行的 Y 坐标
    }

    // 基础绘图函数
    drawText(svg, x, y, str, size, anchor="start", bold=false, color="#000") {
        const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        t.setAttribute("x", x); t.setAttribute("y", y);
        t.setAttribute("font-size", size);
        t.setAttribute("text-anchor", anchor);
        t.setAttribute("font-family", "serif, sans-serif");
        if (bold) t.setAttribute("font-weight", "bold");
        t.style.fill = color;
        t.textContent = str;
        svg.appendChild(t);
    }

    drawLine(svg, x1, y1, x2, y2, w) {
        const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
        l.setAttribute("x1", x1); l.setAttribute("y1", y1);
        l.setAttribute("x2", x2); l.setAttribute("y2", y2);
        l.setAttribute("stroke", "black");
        l.setAttribute("stroke-width", w);
        svg.appendChild(l);
    }

    drawCircle(svg, cx, cy, r) {
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", cx); c.setAttribute("cy", cy);
        c.setAttribute("r", r);
        c.setAttribute("fill", "black");
        svg.appendChild(c);
    }

    drawBar(svg, x, y, type) {
        const h = 20;
        if (type === "|") this.drawLine(svg, x, y - 15, x, y + 15, 1.5);
        else if (type === "||") {
            this.drawLine(svg, x - 2, y - 15, x - 2, y + 15, 1);
            this.drawLine(svg, x + 2, y - 15, x + 2, y + 15, 3);
        }
        else if (type === "|:" || type === ":|") {
            this.drawLine(svg, x, y - 15, x, y + 15, 2.5);
            const dotX = type === "|:" ? x + 7 : x - 7;
            this.drawCircle(svg, dotX, y - 6, 1.8);
            this.drawCircle(svg, dotX, y + 6, 1.8);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.jianpu-render-target').forEach(el => {
        const source = el.getAttribute('data-source').trim();
        const renderer = new JianpuRenderer(source);
        el.innerHTML = '';
        el.appendChild(renderer.render());
    });
});