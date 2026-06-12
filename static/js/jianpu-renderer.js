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
                    const rawL = body.split(/\s+/).filter(t => t && t !== "|");
                    let rowLabel = "";
                    
                    // --- 智能识别行首标签（一、二、三... 或 副） ---
                    if (rawL.length > 0) {
                        const firstToken = rawL[0];
                        if (/^[一二三四五六七八九十副]$/.test(firstToken)) {
                            rowLabel = rawL.shift(); // 移出数组，作为标签处理
                        }
                    }

                    const processedL = [];
                    rawL.forEach(token => {
                        if (/^[，。？！、；：,.?!;:]+$/.test(token) && processedL.length > 0) {
                            processedL[processedL.length - 1].punc += token;
                        } else {
                            const match = token.match(/^([^，。？！、；：,.?!;:]+)([，。？！、；：,.?!;:]*)$/);
                            if (match) {
                                processedL.push({ text: match[1], punc: match[2] });
                            } else {
                                processedL.push({ text: token, punc: '' });
                            }
                        }
                    });
                    this.sections.push({ q: lastQ, l: processedL, label: rowLabel });
                    lastQ = null;
                }
            }
        });
        if (lastQ) this.sections.push({ q: lastQ, l: [], label: "" });
    }

    render() {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        const W = 800, PAD = 50; // 稍微加大左边距
        let y = 45;

        if (this.meta.title) {
            this.drawText(svg, W/2, y, this.meta.title, 32, "middle", true);
            y += 60;
        }
        this.drawText(svg, PAD, y, `1 = ${this.meta.key}  ${this.meta.meter}`, 20);
        if (this.meta.author) this.drawText(svg, W - PAD, y, this.meta.author, 18, "end");
        y += 85;

        this.sections.forEach(sec => {
            y = this.renderLine(svg, sec, y, W, PAD);
        });

        svg.setAttribute("viewBox", `0 0 ${W} ${y + 50}`);
        svg.setAttribute("style", "width:100%; height:auto; background:white;");
        return svg;
    }

    renderLine(svg, sec, startY, W, PAD) {
        // --- 渲染行首标签（一、二、副等） ---
        if (sec.label) {
            // 放在左边距位置，不占用音符位
            this.drawText(svg, PAD - 35, startY + 65, sec.label, 22, "start", true, "#000");
        }

        const qArr = sec.q;
        const lArr = sec.l;
        const slotW = (W - 2 * PAD) / (qArr.length > 1 ? qArr.length - 1 : 1);
        let lIdx = 0; 

        qArr.forEach((token, i) => {
            const x = PAD + i * slotW;
            if (token === "(" || token === ")") return;
            if (token.match(/^[|:!]+$/)) {
                this.drawBar(svg, x, startY, token);
                return;
            }

            const match = token.match(/^([0-7-])(['|,]*)([.]*)(_*)$/);
            if (match) {
                const [_, note, oct, dots, beams] = match;
                if (note === "-") {
                    this.drawLine(svg, x - 12, startY, x + 12, startY, 2.5);
                } else {
                    this.drawText(svg, x, startY + 8, note, 26, "middle", true);
                    if (lIdx < lArr.length) {
                        const wordObj = lArr[lIdx];
                        if (wordObj.text !== "_") {
                            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                            this.drawText(g, x, startY + 65, wordObj.text, 22, "middle", false, "#000");
                            if (wordObj.punc) {
                                this.drawText(g, x + 12, startY + 65, wordObj.punc, 20, "start", false, "#444");
                            }
                            svg.appendChild(g);
                        }
                        lIdx++; 
                    }
                }

                if (oct) {
                    const high = oct.includes("'");
                    for (let j=0; j<oct.length; j++) 
                        this.drawCircle(svg, x, startY + (high? -(24+j*8) : (24+j*8)), 2.2);
                }
                if (dots) {
                    for (let j=0; j<dots.length; j++) 
                        this.drawCircle(svg, x + 18 + j*6, startY + 4, 1.8);
                }
                if (beams) {
                    for (let j=0; j<beams.length; j++) 
                        this.drawLine(svg, x-16, startY+(18+j*7), x+16, startY+(18+j*7), 2);
                }
            }
        });

        return startY + 150;
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
        const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
        l.setAttribute("x1", x1); l.setAttribute("y1", y1);
        l.setAttribute("x2", x2); l.setAttribute("y2", y2);
        l.setAttribute("stroke", "black"); l.setAttribute("stroke-width", w);
        svg.appendChild(l);
    }

    drawCircle(svg, cx, cy, r) {
        const el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        el.setAttribute("cx", cx); el.setAttribute("cy", cy); el.setAttribute("r", r);
        el.setAttribute("fill", "black");
        svg.appendChild(el);
    }

    drawBar(svg, x, y, type) {
        if (type === "|") this.drawLine(svg, x, y-15, x, y+20, 1.8);
        else if (type === "||") {
            this.drawLine(svg, x-4, y-15, x-4, y+20, 1);
            this.drawLine(svg, x+4, y-15, x+4, y+20, 3.5);
        } else if (type === "|:" || type === ":|") {
            this.drawLine(svg, x, y-15, x, y+20, 3);
            const dx = (type === "|:") ? 10 : -10;
            this.drawCircle(svg, x+dx, y-6, 2.5);
            this.drawCircle(svg, x+dx, y+8, 2.5);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.jianpu-render-target').forEach(el => {
        const renderer = new JianpuRenderer(el.getAttribute('data-source').trim());
        el.innerHTML = '';
        el.appendChild(renderer.render());
    });
});