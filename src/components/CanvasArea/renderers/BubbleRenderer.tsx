// src/components/CanvasArea/renderers/BubbleRenderer.tsx (リサイズ修正版)
import { SpeechBubble, Panel } from "../../../types";

export class BubbleRenderer {
  // 吹き出し描画メイン関数
  static drawBubbles(
    ctx: CanvasRenderingContext2D,
    bubbles: SpeechBubble[],
    panels: Panel[],
    selectedBubble: SpeechBubble | null
  ) {
    bubbles.forEach(bubble => {
      this.drawSingleBubble(ctx, bubble, panels, selectedBubble);
    });
  }

  // 単一吹き出し描画
  static drawSingleBubble(
    ctx: CanvasRenderingContext2D,
    bubble: SpeechBubble,
    panels: Panel[],
    selectedBubble: SpeechBubble | null
  ) {
    const panel = panels.find(p => p.id === bubble.panelId) || panels[0];
    if (!panel) return;

    ctx.save();

    // 吹き出し背景描画
    this.drawBubbleBackground(ctx, bubble);
    
    // テキスト描画
    this.drawBubbleText(ctx, bubble);
    
    // 選択状態の場合、リサイズハンドル描画
    if (selectedBubble && selectedBubble.id === bubble.id) {
      this.drawResizeHandles(ctx, bubble);
    }

    ctx.restore();
  }

  // 吹き出し背景描画
  static drawBubbleBackground(ctx: CanvasRenderingContext2D, bubble: SpeechBubble) {
    const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";
    
    ctx.fillStyle = isDarkMode ? "#2d2d2d" : "white";
    ctx.strokeStyle = isDarkMode ? "#555" : "#333";
    ctx.lineWidth = 2;

    // 吹き出し形状に応じた描画
    switch (bubble.type) {
      case "speech":
        this.drawSpeechBubble(ctx, bubble);
        break;
      case "thought":
        this.drawThoughtBubble(ctx, bubble);
        break;
      case "shout":
        this.drawShoutBubble(ctx, bubble);
        break;
      case "whisper":
        this.drawWhisperBubble(ctx, bubble);
        break;
      default:
        this.drawSpeechBubble(ctx, bubble);
    }
  }

  // 基本的な吹き出し形状
  static drawSpeechBubble(ctx: CanvasRenderingContext2D, bubble: SpeechBubble) {
    const cornerRadius = 8;
    
    ctx.beginPath();
    ctx.roundRect(bubble.x, bubble.y, bubble.width, bubble.height, cornerRadius);
    ctx.fill();
    ctx.stroke();

    // 吹き出しの尻尾
    const tailX = bubble.x + bubble.width * 0.2;
    const tailY = bubble.y + bubble.height;
    
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(tailX - 10, tailY + 15);
    ctx.lineTo(tailX + 10, tailY + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 思考吹き出し
  static drawThoughtBubble(ctx: CanvasRenderingContext2D, bubble: SpeechBubble) {
    ctx.beginPath();
    ctx.ellipse(
      bubble.x + bubble.width / 2,
      bubble.y + bubble.height / 2,
      bubble.width / 2,
      bubble.height / 2,
      0, 0, Math.PI * 2
    );
    ctx.fill();
    ctx.stroke();

    // 思考の泡
    const bubbleSize1 = 8;
    const bubbleSize2 = 5;
    const bubbleX = bubble.x + bubble.width * 0.2;
    const bubbleY = bubble.y + bubble.height + 10;

    ctx.beginPath();
    ctx.arc(bubbleX, bubbleY, bubbleSize1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(bubbleX - 8, bubbleY + 8, bubbleSize2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 叫び吹き出し
  static drawShoutBubble(ctx: CanvasRenderingContext2D, bubble: SpeechBubble) {
    const spikes = 8;
    const spikeLength = 10;
    
    ctx.beginPath();
    
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i / (spikes * 2)) * Math.PI * 2;
      const radius = (i % 2 === 0) ? 
        Math.min(bubble.width, bubble.height) / 2 + spikeLength :
        Math.min(bubble.width, bubble.height) / 2;
      
      const x = bubble.x + bubble.width / 2 + Math.cos(angle) * radius;
      const y = bubble.y + bubble.height / 2 + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // ささやき吹き出し
  static drawWhisperBubble(ctx: CanvasRenderingContext2D, bubble: SpeechBubble) {
    ctx.setLineDash([5, 5]);
    
    ctx.beginPath();
    ctx.roundRect(bubble.x, bubble.y, bubble.width, bubble.height, 8);
    ctx.fill();
    ctx.stroke();
    
    ctx.setLineDash([]);
  }

  // テキスト描画
  static drawBubbleText(ctx: CanvasRenderingContext2D, bubble: SpeechBubble) {
    const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";
    
    ctx.fillStyle = isDarkMode ? "#fff" : "#000";
    ctx.font = "14px 'Noto Sans JP', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const centerX = bubble.x + bubble.width / 2;
    const centerY = bubble.y + bubble.height / 2;

    if (bubble.vertical) {
      // 縦書き処理
      const lines = bubble.text.split('');
      const lineHeight = 18;
      const startY = centerY - (lines.length * lineHeight) / 2;
      
      lines.forEach((char, index) => {
        ctx.fillText(char, centerX, startY + index * lineHeight);
      });
    } else {
      // 横書き処理
      const maxWidth = bubble.width - 20;
      const lines = this.wrapText(ctx, bubble.text, maxWidth);
      const lineHeight = 18;
      const startY = centerY - (lines.length * lineHeight) / 2;
      
      lines.forEach((line, index) => {
        ctx.fillText(line, centerX, startY + index * lineHeight);
      });
    }
  }

  // テキスト折り返し処理
  static wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split('');
    const lines: string[] = [];
    let currentLine = '';

    for (const char of words) {
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  // 🆕 8方向リサイズハンドル描画（修正版）
  static drawResizeHandles(ctx: CanvasRenderingContext2D, bubble: SpeechBubble) {
    const handleSize = 8;
    const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";
    
    ctx.fillStyle = isDarkMode ? "#ff6b35" : "#ff8833";
    ctx.strokeStyle = isDarkMode ? "#fff" : "#000";
    ctx.lineWidth = 1;

    // 8方向のハンドル位置
    const handles = [
      { x: bubble.x - handleSize/2, y: bubble.y - handleSize/2, dir: "nw" }, // 左上
      { x: bubble.x + bubble.width/2 - handleSize/2, y: bubble.y - handleSize/2, dir: "n" }, // 上
      { x: bubble.x + bubble.width - handleSize/2, y: bubble.y - handleSize/2, dir: "ne" }, // 右上
      { x: bubble.x + bubble.width - handleSize/2, y: bubble.y + bubble.height/2 - handleSize/2, dir: "e" }, // 右
      { x: bubble.x + bubble.width - handleSize/2, y: bubble.y + bubble.height - handleSize/2, dir: "se" }, // 右下
      { x: bubble.x + bubble.width/2 - handleSize/2, y: bubble.y + bubble.height - handleSize/2, dir: "s" }, // 下
      { x: bubble.x - handleSize/2, y: bubble.y + bubble.height - handleSize/2, dir: "sw" }, // 左下
      { x: bubble.x - handleSize/2, y: bubble.y + bubble.height/2 - handleSize/2, dir: "w" } // 左
    ];

    handles.forEach(handle => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
      ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
    });
  }

  // 🆕 8方向リサイズハンドル判定（修正版）
  static isBubbleResizeHandleClicked(
    mouseX: number, 
    mouseY: number, 
    bubble: SpeechBubble, 
    panel: Panel
  ): { isClicked: boolean; direction: string } {
    const handleSize = 8;
    const tolerance = 2; // クリック判定を少し緩く

    // 8方向のハンドル位置と方向
    const handles = [
      { x: bubble.x - handleSize/2, y: bubble.y - handleSize/2, dir: "nw" },
      { x: bubble.x + bubble.width/2 - handleSize/2, y: bubble.y - handleSize/2, dir: "n" },
      { x: bubble.x + bubble.width - handleSize/2, y: bubble.y - handleSize/2, dir: "ne" },
      { x: bubble.x + bubble.width - handleSize/2, y: bubble.y + bubble.height/2 - handleSize/2, dir: "e" },
      { x: bubble.x + bubble.width - handleSize/2, y: bubble.y + bubble.height - handleSize/2, dir: "se" },
      { x: bubble.x + bubble.width/2 - handleSize/2, y: bubble.y + bubble.height - handleSize/2, dir: "s" },
      { x: bubble.x - handleSize/2, y: bubble.y + bubble.height - handleSize/2, dir: "sw" },
      { x: bubble.x - handleSize/2, y: bubble.y + bubble.height/2 - handleSize/2, dir: "w" }
    ];

    for (const handle of handles) {
      if (mouseX >= handle.x - tolerance && 
          mouseX <= handle.x + handleSize + tolerance &&
          mouseY >= handle.y - tolerance && 
          mouseY <= handle.y + handleSize + tolerance) {
        console.log(`🎯 リサイズハンドル検出: ${handle.dir} at (${handle.x}, ${handle.y})`);
        return { isClicked: true, direction: handle.dir };
      }
    }

    return { isClicked: false, direction: "" };
  }

  // 吹き出し位置判定
  static findBubbleAt(
    x: number, 
    y: number, 
    bubbles: SpeechBubble[], 
    panels: Panel[]
  ): SpeechBubble | null {
    // 後ろから検索（上に描画されたものを優先）
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const bubble = bubbles[i];
      
      if (x >= bubble.x && 
          x <= bubble.x + bubble.width &&
          y >= bubble.y && 
          y <= bubble.y + bubble.height) {
        return bubble;
      }
    }
    
    return null;
  }

  // 🆕 8方向リサイズ実行（BubbleRenderer.tsxに追加）
  static resizeBubble(
    bubble: SpeechBubble,
    direction: string,
    deltaX: number,
    deltaY: number,
    originalBounds: { x: number; y: number; width: number; height: number }
  ): SpeechBubble {
    let newX = bubble.x;
    let newY = bubble.y;
    let newWidth = bubble.width;
    let newHeight = bubble.height;

    const minWidth = 60;
    const minHeight = 40;

    // 中心座標で管理されているため、座標変換が必要
    const bubbleLeft = bubble.x - bubble.width / 2;
    const bubbleTop = bubble.y - bubble.height / 2;

    switch (direction) {
      case "nw": // 左上
        const newLeft_nw = Math.min(bubbleLeft + originalBounds.width - minWidth, bubbleLeft + deltaX);
        const newTop_nw = Math.min(bubbleTop + originalBounds.height - minHeight, bubbleTop + deltaY);
        newWidth = (bubbleLeft + bubble.width) - newLeft_nw;
        newHeight = (bubbleTop + bubble.height) - newTop_nw;
        newX = newLeft_nw + newWidth / 2;
        newY = newTop_nw + newHeight / 2;
        break;
        
      case "n": // 上
        const newTop_n = Math.min(bubbleTop + originalBounds.height - minHeight, bubbleTop + deltaY);
        newHeight = (bubbleTop + bubble.height) - newTop_n;
        newY = newTop_n + newHeight / 2;
        break;
        
      case "ne": // 右上
        const newTop_ne = Math.min(bubbleTop + originalBounds.height - minHeight, bubbleTop + deltaY);
        newWidth = Math.max(minWidth, originalBounds.width + deltaX);
        newHeight = (bubbleTop + bubble.height) - newTop_ne;
        newY = newTop_ne + newHeight / 2;
        break;
        
      case "e": // 右
        newWidth = Math.max(minWidth, originalBounds.width + deltaX);
        break;
        
      case "se": // 右下
        newWidth = Math.max(minWidth, originalBounds.width + deltaX);
        newHeight = Math.max(minHeight, originalBounds.height + deltaY);
        break;
        
      case "s": // 下
        newHeight = Math.max(minHeight, originalBounds.height + deltaY);
        break;
        
      case "sw": // 左下
        const newLeft_sw = Math.min(bubbleLeft + originalBounds.width - minWidth, bubbleLeft + deltaX);
        newWidth = (bubbleLeft + bubble.width) - newLeft_sw;
        newHeight = Math.max(minHeight, originalBounds.height + deltaY);
        newX = newLeft_sw + newWidth / 2;
        break;
        
      case "w": // 左
        const newLeft_w = Math.min(bubbleLeft + originalBounds.width - minWidth, bubbleLeft + deltaX);
        newWidth = (bubbleLeft + bubble.width) - newLeft_w;
        newX = newLeft_w + newWidth / 2;
        break;
    }

    return {
      ...bubble,
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    };
  }
}