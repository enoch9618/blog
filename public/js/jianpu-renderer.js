class JianpuRenderer {
    constructor(text) {
        this.raw = text || "";
        this.meta = { title: '', author: '', key: 'C', meter: '4/4', mNum: 4, mDen: 4 };
        this.sections = [];
        this.parse();
    }

    parse() {
        const lines = this.raw.split('\n').map(s => s.trim());
        let lastQ = null;
        lines.forEach(line => {
            if (!line) return;
            const head = line.substring(0, 2).toUpperCase();
            const body = line.substring(2).trim();
            if (head === "B:") this.meta.title = body;
            else if (head === "D:") this.meta.key = body;
            else if (head === "P:") {
                this.meta.meter = body;
                const m = body.match(/(\d+)\/(\d+)/);
                if (m) { this.meta.mNum = parseInt(m[1]); this.meta.mDen = parseInt(m[2]); }
            }
            else if (head === "Z:") this.meta.author = body;
            else if (head === "Q:") {
                const tokens = body.split(/\s+/).filter(t => t);
                const qData = { notes: [], slurs: [] };
                let slurStack = [];
                tokens.forEach(t => {
                    if (t === "(") slurStack.push({ start: qData.notes.length });
                    else if (t === ")") {
                        if (slurStack.length > 0) {
                            let s = slurStack.pop();
                            s.end = qData.notes.length - 1;
                            qData.slurs.push(s);
                        }
                    } else qData.notes.push(t);
                });
                lastQ = qData;
            } else if (head === "L:" || head === "C:") {
                if (lastQ) {
                    const rawL = body.split(/\s+/).filter(t => t && t !== "|");
                    let rowLabel = "";
                    if (rawL.length > 0 && /^[一二三四五六七八九十副]$/.test(rawL[0])) rowLabel = rawL.shift();
                    const processedL = [];
                    rawL.forEach(token => {
                        const puncRegex = /^[，。？！、；：,.?!;:]+$/;
                        if (puncRegex.test(token) && processedL.length > 0) {
                            processedL[processedL.length - 1].punc += token;
                        } else {
                            const match = token.match(/^([^，。？！、；：,.?!;:]+)([，。？！、；：,.?!;:]*)$/);
                            if (match) processedL.push({ text: match[1], punc: match[2] });
                            else processedL.push({ text: token, punc: '' });
                        }
                    });
                    this.sections.push({ q: lastQ.notes, slurs: lastQ.slurs, l: processedL, label: rowLabel });
                    lastQ = null;
                }
            }
        });
        if (lastQ) this.sections.push({ q: lastQ.notes, slurs: lastQ.slurs, l: [], label: "" });
    }

    render() {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        const W = 1000, PAD_L = 90, PAD_R = 40;
        let y = 60;

        if (this.meta.title) {
            this.drawText(svg, W/2, y, this.meta.title, 42, "middle", true);
            y += 80;
        }
        this.drawText(svg, PAD_L, y, `1 = ${this.meta.key}  ${this.meta.meter}`, 26, "start", true);
        if (this.meta.author) this.drawText(svg, W - PAD_R, y, this.meta.author, 22, "end");
        y += 100;

        this.sections.forEach(sec => {
            y = this.renderLine(svg, sec, y, W, PAD_L, PAD_R);
        });

        svg.setAttribute("viewBox", `0 0 ${W} ${y + 60}`);
        svg.setAttribute("style", "width:100%; height:auto; background:white;");
        return svg;
    }

    renderLine(svg, sec, startY, W, PAD_L, PAD_R) {
        if (sec.label) {
            this.drawText(svg, 25, startY + 12, sec.label, 28, "start", true, "#d32f2f");
        }

        const qArr = sec.q, lArr = sec.l;
        const availableW = W - PAD_L - PAD_R;
        const slotW = qArr.length > 1 ? availableW / (qArr.length - 1) : availableW;
        let lIdx = 0, measureClock = 0;
        const breakThreshold = (this.meta.mNum === 6 && this.meta.mDen === 8) ? 1.5 : 1.0;
        const noteXCoords = [];

        qArr.forEach((token, i) => {
            const x = PAD_L + i * slotW;
            noteXCoords.push(x);

            if (token.match(/^[|:!]+$/)) {
                this.drawBar(svg, x, startY, token);
                measureClock = 0; 
                return;
            }

            const match = token.match(/^([#b]?)([0-7-])(['|,]*)([.]*)(_*)$/);
            if (match) {
                const [_, acc, note, oct, dots, beams] = match;
                let dur = 1.0;
                if (beams) dur = 1 / Math.pow(2, beams.length);
                if (dots) dur *= 1.5;

                if (acc) {
                    const accChar = acc === '#' ? '♯' : '♭';
                    this.drawText(svg, x - 22, startY + 5, accChar, 24, "middle");
                }

                if (note === "-") {
                    this.drawLine(svg, x - 18, startY + 2, x + 18, startY + 2, 2.5); 
                } else {
                    this.drawText(svg, x, startY + 12, note, 42, "middle", note !== "0");
                    if (lIdx < lArr.length) {
                        const word = lArr[lIdx];
                        if (word.text !== "_") {
                            this.drawText(svg, x, startY + 95, word.text, 30, "middle");
                            if (word.punc) this.drawText(svg, x + 20, startY + 95, word.punc, 24, "start", false, "#444");
                        }
                        lIdx++;
                    }
                }

                if (oct) {
                    const isHigh = oct.includes("'");
                    for (let j=0; j<oct.length; j++) {
                        const dy = isHigh ? -(35 + j*12) : (35 + j*12);
                        this.drawCircle(svg, x, startY + dy, 3.5);
                    }
                }

                if (dots) {
                    for (let j=0; j<dots.length; j++) {
                        this.drawCircle(svg, x + 28 + j*10, startY + 5, 3);
                    }
                }

                if (beams) {
                    const nxt = qArr[i+1];
                    const currentTimeEnd = Number((measureClock + dur).toFixed(4));
                    const isBreakPoint = (currentTimeEnd % breakThreshold === 0);
                    let connect = nxt && nxt.includes('_') && !nxt.match(/^[|:!]+$/) && !isBreakPoint;
                    for (let j=0; j<beams.length; j++) {
                        const dy = 28 + j * 12;
                        const xEnd = connect ? (x + slotW) : (x + 18);
                        this.drawLine(svg, x - 18, startY + dy, xEnd, startY + dy, 3);
                    }
                }
                measureClock += dur;
            }
        });

        if (sec.slurs) {
            sec.slurs.forEach(s => {
                const x1 = noteXCoords[s.start], x2 = noteXCoords[s.end];
                if (x1 !== undefined && x2 !== undefined) this.drawArtisticSlur(svg, x1, x2, startY - 35);
            });
        }
        return startY + 200; 
    }

    drawArtisticSlur(svg, x1, x2, y) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const dist = x2 - x1;
        const h = Math.min(30, dist * 0.25);
        const thick = 4; 
        const xStart = x1 - 5, xEnd = x2 + 5;
        const d = `M ${xStart} ${y} 
                   C ${xStart + dist*0.2} ${y - h} ${xEnd - dist*0.2} ${y - h} ${xEnd} ${y}
                   C ${xEnd - dist*0.2} ${y - h + thick} ${xStart + dist*0.2} ${y - h + thick} ${xStart} ${y} Z`;
        path.setAttribute("d", d);
        path.setAttribute("fill", "black");
        svg.appendChild(path);
    }

    drawText(parent, x, y, t, s, a, b=false, c="#000") {
        const el = document.createElementNS("http://www.w3.org/2000/svg", "text");
        el.setAttribute("x", x); el.setAttribute("y", y);
        el.setAttribute("font-size", s); el.setAttribute("text-anchor", a);
        el.setAttribute("font-family", "serif, SimSun");
        if (b) el.setAttribute("font-weight", "bold");
        el.style.fill = c;
        el.textContent = t;
        parent.appendChild(el);
    }

    drawLine(svg, x1, y1, x2, y2, w) {
        const el = document.createElementNS("http://www.w3.org/2000/svg", "line");
        el.setAttribute("x1", x1); el.setAttribute("y1", y1);
        el.setAttribute("x2", x2); el.setAttribute("y2", y2);
        el.setAttribute("stroke", "black"); el.setAttribute("stroke-width", w);
        el.setAttribute("stroke-linecap", "round");
        svg.appendChild(el);
    }

    drawCircle(svg, cx, cy, r) {
        const el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        el.setAttribute("cx", cx); el.setAttribute("cy", cy); el.setAttribute("r", r);
        el.setAttribute("fill", "black");
        svg.appendChild(el);
    }

    drawBar(svg, x, y, type) {
        const top = y - 20, bot = y + 30;
        if (type === "|") {
            this.drawLine(svg, x, top, x, bot, 2);
        } else if (type === "||") {
            this.drawLine(svg, x - 4, top, x - 4, bot, 1.5);
            this.drawLine(svg, x + 4, top, x + 4, bot, 5);
        } else if (type === "|:" || type === ":|") {
            const isLeft = type === "|:";
            this.drawLine(svg, x, top, x, bot, isLeft ? 5 : 2);
            this.drawLine(svg, x + (isLeft? -8 : 8), top, x + (isLeft? -8 : 8), bot, isLeft ? 2 : 5);
            const dotX = x + (isLeft ? 15 : -15);
            this.drawCircle(svg, dotX, y - 5, 3.5);
            this.drawCircle(svg, dotX, y + 15, 3.5);
        }
    }
}

// 关键点：这一段代码必须在脚本最后执行！
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.jianpu-render-target').forEach(el => {
        const source = el.getAttribute('data-source');
        if (source) {
            const renderer = new JianpuRenderer(source.trim());
            el.innerHTML = '';
            el.appendChild(renderer.render());
        }
    });
});