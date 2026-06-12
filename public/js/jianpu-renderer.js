class JianpuRenderer {
    constructor(text) {
        this.raw = text;
        this.meta = { title: '', author: '', key: 'C', meter: '4/4' };
        this.sections = [];
        this.parse();
    }

    parse() {
        const lines = this.raw.split('\n').map(s => s.trim());
        let lastQ = null;
        lines.forEach(line => {
            const head = line.substring(0, 2).toUpperCase();
            const body = line.substring(2).trim();
            if (head === "B:") this.meta.title = body;
            else if (head === "D:") this.meta.key = body;
            else if (head === "P:") this.meta.meter = body;
            else if (head === "Z:") this.meta.author = body;
            else if (head === "Q:") {
                lastQ = body.split(/\s+/).filter(t => t);
            } else if (head === "L:" || head === "C:") {
                if (lastQ) {
                    // 1. 过滤掉辅助线 | 
                    const rawL = body.split(/\s+/).filter(t => t && t !== "|");
                    const processedL = [];
                    rawL.forEach(token => {
                        // 2. 检查是否是纯标点符号
                        if (/^[，。？！、；：,.?!;:]+$/.test(token) && processedL.length > 0) {
                            // 如果是纯标点，追加到上一个词里，并标记它含有标点
                            const lastItem = processedL[processedL.length - 1];
                            lastItem.punc += token;
                        } else {
                            // 识别词汇和它自带的尾随标点
                            const match = token.match(/^([^，。？！、；：,.?!;:]+)([，。？！、；：,.?!;:]*)$/);
                            if (match) {
                                processedL.push({ text: match[1], punc: match[2] });
                            } else {
                                processedL.push({ text: token, punc: '' });
                            }
                        }
                    });
                    this.sections.push({ q: lastQ, l: processedL });
                    lastQ = null;
                }
            }
        });
        if (lastQ) this.sections.push({ q: lastQ, l: [] });
    }

    render() {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        const W = 800, PAD = 40; 
        let y = 45;

        if (this.meta.title) {
            this.drawText(svg, W/2, y, this.meta.title, 28, "middle", true);
            y += 50;
        }
        this.drawText(svg, PAD, y, `1 = ${this.meta.key}  ${this.meta.meter}`, 18);
        if (this.meta.author) this.drawText(svg, W - PAD, y, this.meta.author, 16, "end");
        y += 75;

        this.sections.forEach(sec => {
            y = this.renderLine(svg, sec, y, W, PAD);
        });

        svg.setAttribute("viewBox", `0 0 ${W} ${y + 40}`);
        svg.setAttribute("style", "width:100%; height:auto; background:white;");
        return svg;
    }

    renderLine(svg, sec, startY, W, PAD) {
        const qArr = sec.q;
        const lArr = sec.l;
        const slotW = (W - 2 * PAD) / (qArr.length > 1 ? qArr.length - 1 : 1);
        let lIdx = 0; 

        qArr.forEach((token, i) => {
            const x = PAD + i * slotW;

            // 绘制小节线
            if (token.match(/^[|:!]+$/)) {
                this.drawBar(svg, x, startY, token);
                return;
            }

            const match = token.match(/^([0-7-])(['|,]*)([.]*)(_*)$/);
            if (match) {
                const [_, note, oct, dots, beams] = match;

                if (note === "-") {
                    this.drawLine(svg, x - 12, startY, x + 12, startY, 2);
                } else {
                    // 绘制音符
                    this.drawText(svg, x, startY + 8, note, 24, "middle", true);
                    
                    // 绘制歌词：关键对齐算法
                    if (lIdx < lArr.length) {
                        const wordObj = lArr[lIdx];
                        // 核心：只对汉字文本进行居中，标点符号另行追加
                        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                        
                        // 1. 绘制汉字（绝对居中）
                        const t1 = this.drawText(g, x, startY + 55, wordObj.text, 16, "middle", false, "#333");
                        
                        // 2. 绘制标点（靠左对齐在汉字右侧，不参与居中计算）
                        if (wordObj.punc) {
                            // 估算汉字宽度的一半偏移量，让标点紧跟其后
                            this.drawText(g, x + 9, startY + 55, wordObj.punc, 16, "start", false, "#666");
                        }
                        
                        svg.appendChild(g);
                        lIdx++; 
                    }
                }

                // 装饰符
                if (oct) {
                    const high = oct.includes("'");
                    for (let j=0; j<oct.length; j++) 
                        this.drawCircle(svg, x, startY + (high? -(22+j*7) : (22+j*7)), 2);
                }
                if (dots) {
                    for (let j=0; j<dots.length; j++) 
                        this.drawCircle(svg, x + 16 + j*6, startY + 4, 1.5);
                }
                if (beams) {
                    for (let j=0; j<beams.length; j++) 
                        this.drawLine(svg, x-14, startY+(16+j*6), x+14, startY+(16+j*6), 1.6);
                }
            }
        });

        return startY + 120;
    }

    drawText(parent, x, y, t, s, a, b, c) {
        const el = document.createElementNS("http://www.w3.org/2000/svg", "text");
        el.setAttribute("x", x); el.setAttribute("y", y);
        el.setAttribute("font-size", s); el.setAttribute("text-anchor", a);
        el.setAttribute("font-family", "Noto Serif SC, SimSun, serif");
        if (b) el.setAttribute("font-weight", "bold");
        el.style.fill = c || "#000";
        el.textContent = t;
        parent.appendChild(el);
        return el;
    }

    drawLine(svg, x1, y1, x2, y2, w) {
        const el = document.createElementNS("http://www.w3.org/2000/svg", "line");
        el.setAttribute("x1", x1); el.setAttribute("y1", y1);
        el.setAttribute("x2", x2); el.setAttribute("y2", y2);
        el.setAttribute("stroke", "black"); el.setAttribute("stroke-width", w);
        svg.appendChild(el);
    }

    drawCircle(svg, cx, cy, r) {
        const el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        el.setAttribute("cx", cx); el.setAttribute("cy", cy); el.setAttribute("r", r);
        el.setAttribute("fill", "black");
        svg.appendChild(el);
    }

    drawBar(svg, x, y, type) {
        const h = 20;
        if (type === "|") this.drawLine(svg, x, y-h, x, y+h, 1.5);
        else if (type === "||") {
            this.drawLine(svg, x-3, y-h, x-3, y+h, 1);
            this.drawLine(svg, x+3, y-h, x+3, y+h, 3);
        } else if (type === "|:" || type === ":|") {
            this.drawLine(svg, x, y-h, x, y+h, 2.5);
            const dx = (type === "|:") ? 8 : -8;
            this.drawCircle(svg, x+dx, y-6, 2);
            this.drawCircle(svg, x+dx, y+6, 2);
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