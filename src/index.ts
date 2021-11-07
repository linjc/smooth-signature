interface IOptions {
  width?: number;
  height?: number;
  color?: string;
  bgColor?: string;
  scale?: number;
  openSmooth?: boolean;
  minWidth?: number;
  maxWidth?: number;
  minSpeed?: number;
  maxWidthDiffRate?: number;
  maxHistoryLength?: number;
  onStart?: (event: any) => void;
  onEnd?: (event: any) => void;
}

interface IPoint {
  x: number;
  y: number;
  t: number;
  speed?: number;
  distance?: number;
  lineWidth?: number;
  lastX?: number;
  lastY?: number;
}

class SmoothSignature {
  constructor(canvas: HTMLCanvasElement, options: IOptions) {
    this.init(canvas, options)
  }
  canvas: HTMLCanvasElement = {} as any;
  ctx: CanvasRenderingContext2D = {} as any;
  width = 320;
  height = 200;
  scale = Math.max(window.devicePixelRatio || 1, 2);
  color = 'black';
  bgColor = '';
  canDraw = false;
  openSmooth = true;
  minWidth = 2;
  maxWidth = 6;
  minSpeed = 1.5;
  maxWidthDiffRate = 20;
  points: IPoint[] = [];
  canAddHistory = true;
  historyList: HTMLCanvasElement[] = [];
  maxHistoryLength = 20;
  onStart: any = () => { }
  onEnd: any = () => { }

  init(canvas: HTMLCanvasElement, options: IOptions = {}) {
    if (!canvas) return;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.width = options.width || canvas.clientWidth || this.width;
    this.height = options.height || canvas.clientHeight || this.height;
    this.scale = options.scale || this.scale;
    this.color = options.color || this.color;
    this.bgColor = options.bgColor || this.bgColor;
    this.openSmooth = options.openSmooth || this.openSmooth;
    this.minWidth = options.minWidth || this.minWidth;
    this.maxWidth = options.maxWidth || this.maxWidth;
    this.minSpeed = options.minSpeed || this.minSpeed;
    this.maxWidthDiffRate = options.maxWidthDiffRate || this.maxWidthDiffRate;
    this.maxHistoryLength = options.maxHistoryLength || this.maxHistoryLength;
    this.onStart = options.onStart;
    this.onEnd = options.onEnd;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.canvas.height = this.height * this.scale;
    this.canvas.width = this.width * this.scale;
    this.ctx.scale(this.scale, this.scale);
    this.ctx.lineCap = 'round';
    this.drawBgColor();
    this.addListener();
  }

  addListener = () => {
    this.removeListener();
    if ('ontouchstart' in window) {
      this.canvas.addEventListener('touchstart', this.onDrawStart);
      this.canvas.addEventListener('touchmove', this.onDrawMove);
      document.addEventListener('touchcancel', this.onDrawEnd);
      document.addEventListener('touchend', this.onDrawEnd);
    } else {
      this.canvas.addEventListener('mousedown', this.onDrawStart);
      this.canvas.addEventListener('mousemove', this.onDrawMove);
      document.addEventListener('mouseup', this.onDrawEnd);
    }
  }

  removeListener = () => {
    this.canvas.removeEventListener('touchstart', this.onDrawStart);
    this.canvas.removeEventListener('touchmove', this.onDrawMove);
    document.removeEventListener('touchend', this.onDrawEnd);
    document.removeEventListener('touchcancel', this.onDrawEnd);
    this.canvas.removeEventListener('mousedown', this.onDrawStart);
    this.canvas.removeEventListener('mousemove', this.onDrawMove);
    document.removeEventListener('mouseup', this.onDrawEnd);
  }

  onDrawStart = (e: any) => {
    e.preventDefault();
    this.canDraw = true;
    this.canAddHistory = true;
    this.ctx.strokeStyle = this.color;
    this.initPoint(e);
    this.onStart && this.onStart(e);
  }

  onDrawMove = (e: any) => {
    e.preventDefault();
    if (!this.canDraw) return;
    this.initPoint(e);
    this.onDraw();
  }

  onDraw = () => {
    if (this.points.length < 3) return;
    this.addHistory();
    const point = this.points.slice(-1)[0];
    const prePoint = this.points.slice(-2, -1)[0];
    const onDraw = () => {
      if (this.openSmooth) {
        this.drawSmoothLine(prePoint, point);
      } else {
        this.drawNoSmoothLine(prePoint, point);
      }
    }
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(() => onDraw());
    } else {
      onDraw()
    }
  }

  onDrawEnd = (e: any) => {
    if (!this.canDraw) return;
    this.canDraw = false;
    this.canAddHistory = true;
    this.points = [];
    this.onEnd && this.onEnd(e);
  }

  getLineWidth = (speed: number) => {
    const minSpeed = this.minSpeed > 10 ? 10 : this.minSpeed < 1 ? 1 : this.minSpeed;
    const addWidth = (this.maxWidth - this.minWidth) * speed / minSpeed;
    const lineWidth = Math.max(this.maxWidth - addWidth, this.minWidth);
    return Math.min(lineWidth, this.maxWidth);
  }

  initPoint = (event: any) => {
    const t = Date.now();
    const rect = this.canvas.getBoundingClientRect();
    const e = event.touches && event.touches[0] || event;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const point: IPoint = { x, y, t }
    if (this.openSmooth) {
      const prePoint = this.points.slice(-1)[0];
      const prePoint2 = this.points.slice(-2, -1)[0];
      if (prePoint) {
        point.distance = Math.sqrt(Math.pow(point.x - prePoint.x, 2) + Math.pow(point.y - prePoint.y, 2));
        point.speed = point.distance / ((point.t - prePoint.t) || 0.1);
        point.lineWidth = this.getLineWidth(point.speed);
        if (prePoint2 && prePoint2.lineWidth && prePoint.lineWidth) {
          const rate = (point.lineWidth - prePoint.lineWidth) / prePoint.lineWidth;
          let maxRate = this.maxWidthDiffRate / 100;
          maxRate = maxRate > 1 ? 1 : maxRate < 0.01 ? 0.01 : maxRate;
          if (Math.abs(rate) > maxRate) {
            const per = rate > 0 ? maxRate : -maxRate;
            point.lineWidth = prePoint.lineWidth * (1 + per);
          }
        }
      }
    }
    this.points.push(point);
    this.points = this.points.slice(-3);
  }

  drawSmoothLine = (prePoint: any, point: any) => {
    const perW = (point.x - prePoint.x) * 0.33;
    const perH = (point.y - prePoint.y) * 0.33;
    const x1 = prePoint.x + perW;
    const y1 = prePoint.y + perH;
    const x2 = x1 + perW;
    const y2 = y1 + perH;
    point.lastX = x2;
    point.lastY = y2;
    if (typeof prePoint.lastX === 'number') {
      const lineWidth = (prePoint.lineWidth + point.lineWidth) / 2;
      this.drawCurveLine(prePoint.lastX, prePoint.lastY, prePoint.x, prePoint.y, x1, y1, lineWidth);
    }
    this.drawLine(x1, y1, x2, y2, point.lineWidth);
  }

  drawNoSmoothLine = (prePoint: any, point: any) => {
    const halfW = (point.x - prePoint.x) / 2;
    const halfH = (point.y - prePoint.y) / 2;
    point.lastX = prePoint.x + halfW;
    point.lastY = prePoint.y + halfH;
    if (typeof prePoint.lastX === 'number') {
      this.drawCurveLine(
        prePoint.lastX, prePoint.lastY,
        prePoint.x, prePoint.y,
        point.lastX, point.lastY,
        this.maxWidth
      );
    }
  }

  drawLine = (x1: number, y1: number, x2: number, y2: number, lineWidth: number) => {
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  drawCurveLine = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, lineWidth: number) => {
    this.ctx.lineWidth = lineWidth
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.quadraticCurveTo(x2, y2, x3, y3);
    this.ctx.stroke();
  }

  drawBgColor = () => {
    if (!this.bgColor) return;
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  addHistory = () => {
    if (!this.maxHistoryLength || !this.canAddHistory) return;
    this.canAddHistory = false;
    const canvas = document.createElement('canvas');
    canvas.width = this.canvas.width;
    canvas.height = this.canvas.height;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.drawImage(this.canvas, 0, 0, canvas.width, canvas.height);
    this.historyList.push(canvas);
    this.historyList = this.historyList.slice(-this.maxHistoryLength);
  }

  clear = () => {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawBgColor();
    this.historyList.length = 0;
  }

  undo = () => {
    if (!this.historyList.length) return;
    const canvas = this.historyList.splice(-1)[0];
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.drawImage(canvas, 0, 0, this.width, this.height);
  }

  toDataURL = (type = 'image/png', quality = 1) => {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.drawImage(this.canvas, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL(type, quality);
  }

  getPNG = () => {
    return this.toDataURL();
  }

  getJPG = (quality = 0.8) => {
    return this.toDataURL('image/jpeg', quality);
  }

  isEmpty = () => {
    const canvas = document.createElement('canvas');
    canvas.width = this.canvas.width;
    canvas.height = this.canvas.height;
    if (this.bgColor) {
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      ctx.fillStyle = this.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    return canvas.toDataURL() === this.canvas.toDataURL();
  }

  getRotateCanvas = (degree = 90) => {
    if (degree > 0) {
      degree = degree > 90 ? 180 : 90;
    } else {
      degree = degree < -90 ? 180 : -90;
    }
    const canvas = document.createElement('canvas');
    const w = this.width;
    const h = this.height;
    if (degree === 180) {
      canvas.width = w;
      canvas.height = h;
    } else {
      canvas.width = h;
      canvas.height = w;
    }
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.rotate(degree * Math.PI / 180);
    if (degree === 90) { // 顺时针90度
      ctx.drawImage(this.canvas, 0, -h, w, h);
    } else if (degree === -90) { // 逆时针90度
      ctx.drawImage(this.canvas, -w, 0, w, h);
    } else if (degree === 180) {
      ctx.drawImage(this.canvas, -w, -h, w, h);
    }
    return canvas;
  }
}

export default SmoothSignature;