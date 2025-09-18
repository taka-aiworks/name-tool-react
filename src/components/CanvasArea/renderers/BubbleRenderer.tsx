// src/components/CanvasArea/renderers/BubbleRenderer.tsx (座標変換対応版)
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

  // 🔧 座標変換ヘルパー関数（新規追加）
  static calculateBubblePosition(bubble: SpeechBubble, panel: Panel): { x: number; y: number; width: number; height: number } {
    if (bubble.isGlobalPosition) {
      // 絶対座標の場合：そのまま使用
      return {
        x: bubble.x,
        y: bubble.y,
        width: bubble.width,
        height: bubble.height
      };
    } else {
      // 🔧 相対座標の場合：パネル内座標に変換
      const x = panel.x + (bubble.x * panel.width);
      const y = panel.y + (bubble.y * panel.height);
      
      console.log(`💬 吹き出し座標変換: "${bubble.text}"`);
      console.log(`   相対座標: (${bubble.x.toFixed(3)}, ${bubble.y.toFixed(3)})`);
      console.log(`   パネル: x=${panel.x}, y=${panel.y}, w=${panel.width}, h=${panel.height}`);
      console.log(`   絶対座標: (${x.toFixed(1)}, ${y.toFixed(1)})`);
      
      return {
        x: x,
        y: y,
        width: bubble.width,
        height: bubble.height
      };
    }
  }

  // 単一吹き出し描画（座標変換対応）
  static drawSingleBubble(
    ctx: CanvasRenderingContext2D,
    bubble: SpeechBubble,
    panels: Panel[],
    selectedBubble: SpeechBubble | null
  ) {
    const panel = panels.find(p => p.id === bubble.panelId) || panels[0];
    if (!panel) return;

    // 🔧 座標変換を適用
    const bubblePos = this.calculateBubblePosition(bubble, panel);
    const transformedBubble = { ...bubble, ...bubblePos };

    ctx.save();

    // 吹き出し背景描画
    this.drawBubbleBackground(ctx, transformedBubble);
    
    // テキスト描画
    this.drawBubbleText(ctx, transformedBubble);
    
    // 選択状態の場合、リサイズハンドル描画
    if (selectedBubble && selectedBubble.id === bubble.id) {
      this.drawResizeHandles(ctx, transformedBubble);
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

  // 🆕 8方向リサイズハンドル描画（強化版）
  static drawResizeHandles(ctx: CanvasRenderingContext2D, bubble: SpeechBubble) {
    const handleSize = 12; // サイズを大きく
    const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";
    
    ctx.fillStyle = "#ff6b35";
    ctx.strokeStyle = isDarkMode ? "#fff" : "#000";
    ctx.lineWidth = 2;

    // 🔧 8方向のハンドル位置（座標計算を明確化）
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
      // 角のハンドルは四角、辺のハンドルは丸で区別
      if (["nw", "ne", "se", "sw"].includes(handle.dir)) {
        // 角：四角いハンドル
        ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
        ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
      } else {
        // 辺：丸いハンドル
        ctx.beginPath();
        ctx.arc(handle.x + handleSize/2, handle.y + handleSize/2, handleSize/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    });
  }

  // 🆕 8方向リサイズハンドル判定（座標変換対応版）
  static isBubbleResizeHandleClicked(
    mouseX: number, 
    mouseY: number, 
    bubble: SpeechBubble, 
    panel: Panel
  ): { isClicked: boolean; direction: string } {
    // 🔧 座標変換を適用してから判定
    const bubblePos = this.calculateBubblePosition(bubble, panel);
    const transformedBubble = { ...bubble, ...bubblePos };
    
    const handleSize = 12;
    const tolerance = 8;

    console.log("🔍 吹き出しリサイズハンドル判定開始:", {
      mouseX, mouseY,
      originalPos: { x: bubble.x, y: bubble.y },
      transformedPos: { x: transformedBubble.x, y: transformedBubble.y },
      bubbleSize: { width: transformedBubble.width, height: transformedBubble.height }
    });

    // 🔧 8方向のハンドル位置（変換済み座標で判定）
    const handles = [
      { x: transformedBubble.x - handleSize/2, y: transformedBubble.y - handleSize/2, dir: "nw" },
      { x: transformedBubble.x + transformedBubble.width/2 - handleSize/2, y: transformedBubble.y - handleSize/2, dir: "n" },
      { x: transformedBubble.x + transformedBubble.width - handleSize/2, y: transformedBubble.y - handleSize/2, dir: "ne" },
      { x: transformedBubble.x + transformedBubble.width - handleSize/2, y: transformedBubble.y + transformedBubble.height/2 - handleSize/2, dir: "e" },
      { x: transformedBubble.x + transformedBubble.width - handleSize/2, y: transformedBubble.y + transformedBubble.height - handleSize/2, dir: "se" },
      { x: transformedBubble.x + transformedBubble.width/2 - handleSize/2, y: transformedBubble.y + transformedBubble.height - handleSize/2, dir: "s" },
      { x: transformedBubble.x - handleSize/2, y: transformedBubble.y + transformedBubble.height - handleSize/2, dir: "sw" },
      { x: transformedBubble.x - handleSize/2, y: transformedBubble.y + transformedBubble.height/2 - handleSize/2, dir: "w" }
    ];

    for (const handle of handles) {
      const inRangeX = mouseX >= handle.x - tolerance && mouseX <= handle.x + handleSize + tolerance;
      const inRangeY = mouseY >= handle.y - tolerance && mouseY <= handle.y + handleSize + tolerance;
      
      if (inRangeX && inRangeY) {
        console.log(`🎯 吹き出しリサイズハンドル ${handle.dir} クリック検出!`);
        return { isClicked: true, direction: handle.dir };
      }
    }

    console.log("❌ リサイズハンドルクリック判定: 該当なし");
    return { isClicked: false, direction: "" };
  }

  // 吹き出し位置判定（座標変換対応版）
  static findBubbleAt(
    x: number, 
    y: number, 
    bubbles: SpeechBubble[], 
    panels: Panel[]
  ): SpeechBubble | null {
    // 後ろから検索（上に描画されたものを優先）
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const bubble = bubbles[i];
      const panel = panels.find(p => p.id === bubble.panelId) || panels[0];
      if (!panel) continue;
      
      // 🔧 座標変換を適用してから判定
      const bubblePos = this.calculateBubblePosition(bubble, panel);
      
      if (x >= bubblePos.x && 
          x <= bubblePos.x + bubblePos.width &&
          y >= bubblePos.y && 
          y <= bubblePos.y + bubblePos.height) {
        return bubble;
      }
    }
    
    return null;
  }

  // 🆕 8方向リサイズ実行（完全修正版）
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

    console.log("🔧 吹き出しリサイズ実行:", {
      direction,
      deltaX, deltaY,
      currentSize: { width: bubble.width, height: bubble.height },
      currentPos: { x: bubble.x, y: bubble.y },
      originalBounds
    });

    // 🔧 各方向の処理を明確化
    switch (direction) {
      case "nw": // 左上
        newWidth = Math.max(minWidth, originalBounds.width - deltaX);
        newHeight = Math.max(minHeight, originalBounds.height - deltaY);
        newX = originalBounds.x + originalBounds.width - newWidth;
        newY = originalBounds.y + originalBounds.height - newHeight;
        break;
        
      case "n": // 上
        newHeight = Math.max(minHeight, originalBounds.height - deltaY);
        newY = originalBounds.y + originalBounds.height - newHeight;
        break;
        
      case "ne": // 右上
        newWidth = Math.max(minWidth, originalBounds.width + deltaX);
        newHeight = Math.max(minHeight, originalBounds.height - deltaY);
        newY = originalBounds.y + originalBounds.height - newHeight;
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
        newWidth = Math.max(minWidth, originalBounds.width - deltaX);
        newHeight = Math.max(minHeight, originalBounds.height + deltaY);
        newX = originalBounds.x + originalBounds.width - newWidth;
        break;
        
      case "w": // 左
        newWidth = Math.max(minWidth, originalBounds.width - deltaX);
        newX = originalBounds.x + originalBounds.width - newWidth;
        break;
        
      default:
        console.warn("⚠️ 不明なリサイズ方向:", direction);
        return bubble;
    }

    const result = {
      ...bubble,
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    };

    console.log("✅ 吹き出しリサイズ結果:", {
      newPos: { x: newX, y: newY },
      newSize: { width: newWidth, height: newHeight }
    });

    return result;
  }
}