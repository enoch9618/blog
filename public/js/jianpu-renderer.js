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
                // 彻底过滤掉括号
                lastQ = body.split(/\s+/).filter(t => t && t !== "(" && t !== ")");
            } else if (head === "L:" || head === "C:") {
                if (lastQ) {
                    const rawL = body.split(/\s+/).filter(t => t && t !== "|");
                    let rowLabel = "";
                    if (rawL.length > 0 && /^[一二三四五六七八九十副]$/.test(rawL[0])) {
                        rowLabel = rawL.shift();
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
        const W = 1000; // 拓宽画布，提供更好的间距
        const PAD_L = 90;
        const PAD_R = 40;
        let y = 60;

        if (this.meta.title) {
            this.drawText(svg, W/2, y, this.meta.title, 38, "middle", true);
            y += 80;
        }
        this.drawText(svg, PAD_L, y, `1 = ${this.meta.key}  ${this.meta.meter}`, 26);
        if (this.meta.author) this.drawText(svg, W - PAD_R, y, this.meta.author, 22, "end");
        y += 110;

        this.sections.forEach(sec => {
            y = this.renderLine(svg, sec, y, W, PAD_L, PAD_R);
        });

        svg.setAttribute("viewBox", `0 0 ${W} ${y + 60}`);
        svg.setAttribute("style", "width:100%; height:auto; background:white;");
        return svg;
    }

    renderLine(svg, sec, startY, W, PAD_L, PAD_R) {
        if (sec.label) {
            this.drawText(svg, 20, startY + 80, sec.label, 30, "start", true, "#d32f2f");
        }

        const qArr = sec.q;
        const lArr = sec.l;
        // 关键：每行都根据自己的 token 数量撑满 W 宽度，实现列宽一致
        const slotW = (W - PAD_L - PAD_R) / (qArr.length > 1 ? qArr.length - 1 : 1);
        let lIdx = 0; 

        qArr.forEach((token, i) => {
            const x = PAD_L + i * slotW;

            if (token.match(/^[|:!]+$/)) {
                this.drawBar(svg, x, startY, token);
                return;
            }

            const match = token.match(/^([0-7-])(['|,]*)([.]*)(_*)$/);
            if (match) {
                const [_, note, oct, dots, beams] = match;

                // 渲染音符/增时线
                if (note === "-") {
                    this.drawLine(svg, x - 15, startY, x + 15, startY, 3.5);
                } else {
                    this.drawText(svg, x, startY + 12, note, 38, "middle", true);
                    if (lIdx < lArr.length) {
                        const wordObj = lArr[lIdx];
                        if (wordObj.text !== "_") {
                            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                            this.drawText(g, x, startY + 85, wordObj.text, 32, "middle", false, "#000");
                            if (wordObj.punc) {
                                this.drawText(g, x + 18, startY + 85, wordObj.punc, 26, "start", false, "#444");
                            }
                            svg.appendChild(g);
                        }
                        lIdx++; 
                    }
                }

                // 高低音点
                if (oct) {
                    const high = oct.includes("'");
                    for (let j=0; j<oct.length; j++) 
                        this.drawCircle(svg, x, startY + (high? -(32+j*10) : (32+j*10)), 3);
                }
                // 附点
                if (dots) {
                    for (let j=0; j<dots.length; j++) 
                        this.drawCircle(svg, x + 24 + j*8, startY + 6, 2.5);
                }
                
                // 减时线（带智能连通逻辑）
                if (beams) {
                    const beamCount = beams.length;
                    const nextToken = qArr[i+1];
                    // 判断下一个音符是否也是带相同数量减时线的音符
                    const isNextLinked = nextToken && nextToken.includes('_') && !nextToken.match(/^[|:!]+$/);

                    for (let j=0; j<beamCount; j++) {
                        const dy = 25 + j * 10;
                        const xStart = x - 15;
                        // 如果下一个音符也带线，则线段延长到下一个槽位，实现连通
                        const xEnd = isNextLinked ? (x + slotW + 15) : (x + 15);
                        this.drawLine(svg, xStart, startY + dy, xEnd, startY + dy, 3);
                    }
                }
            }
        });

        return startY + 200; // 行距
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
        const h1 = 25, h2 = 30;
        if (type === "|") this.drawLine(svg, x, y-h1, x, y+h2, 2.5);
        else if (type === "||") {
            this.drawLine(svg, x-5, y-h1, x-5, y+h2, 1.5);
            this.drawLine(svg, x+5, y-h1, x+5, y+h2, 5);
        } else if (type === "|:" || type === ":|") {
            this.drawLine(svg, x, y-h1, x, y+h2, 4);
            const dx = (type === "|:") ? 15 : -15;
            this.drawCircle(svg, x+dx, y-10, 3.5);
            this.drawCircle(svg, x+dx, y+12, 3.5);
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