// src/components/CanvasArea/renderers/BubbleRenderer.tsx - 文字折り返し強化版
import { SpeechBubble, Panel } from "../../../types";

export class BubbleRenderer {
  // 吹き出し描画メイン関数（editingBubble対応版）
  static drawBubbles(
    ctx: CanvasRenderingContext2D,
    bubbles: SpeechBubble[],
    panels: Panel[],
    selectedBubble: SpeechBubble | null,
    editingBubble?: SpeechBubble | null  // 🔧 5つ目の引数を追加
  ) {
    bubbles.forEach(bubble => {
      this.drawSingleBubble(ctx, bubble, panels, selectedBubble, editingBubble);
    });
  }

  // 座標変換ヘルパー関数
  static calculateBubblePosition(bubble: SpeechBubble, panel: Panel): { x: number; y: number; width: number; height: number } {
    if (bubble.isGlobalPosition) {
      // 絶対座標の場合：サイズを拡大
      const scaleFactor = 2.0; // 2倍に拡大
      return {
        x: bubble.x,
        y: bubble.y,
        width: bubble.width * scaleFactor,
        height: bubble.height * scaleFactor
      };
    } else {
      // 相対座標の場合：パネルサイズに基づいて計算（拡大なし）
      const x = panel.x + (bubble.x * panel.width);
      const y = panel.y + (bubble.y * panel.height);
      const width = bubble.width * panel.width;
      const height = bubble.height * panel.height;
      
      return {
        x: x,
        y: y,
        width: width,
        height: height
      };
    }
  }

  // 単一吹き出し描画（座標変換対応・編集中も表示）
  static drawSingleBubble(
    ctx: CanvasRenderingContext2D,
    bubble: SpeechBubble,
    panels: Panel[],
    selectedBubble: SpeechBubble | null,
    editingBubble?: SpeechBubble | null
  ) {
    const panel = panels.find(p => p.id === bubble.panelId) || panels[0];
    if (!panel) {
      console.warn(`⚠️ パネルが見つかりません: bubble=${bubble.id}, panelId=${bubble.panelId}`);
      return;
    }

    // 座標変換を適用
    const bubblePos = this.calculateBubblePosition(bubble, panel);
    const transformedBubble = { ...bubble, ...bubblePos };

    ctx.save();

    // 🔧 編集中の吹き出しは半透明で表示
    if (editingBubble && editingBubble.id === bubble.id) {
      ctx.globalAlpha = 0.7;
    }

    // 吹き出し背景描画
    this.drawBubbleBackground(ctx, transformedBubble);
    
    // テキスト描画（強化版）
    this.drawBubbleTextEnhanced(ctx, transformedBubble);
    
    // 選択状態の場合、リサイズハンドル描画
    if (selectedBubble && selectedBubble.id === bubble.id) {
      this.drawResizeHandles(ctx, transformedBubble);
    }

    ctx.restore();
  }

  // 吹き出し背景描画（形状完全分離版）
  static drawBubbleBackground(ctx: CanvasRenderingContext2D, bubble: SpeechBubble) {
    const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";
    
    // 基本色設定
    ctx.fillStyle = isDarkMode ? "#2d2d2d" : "white";
    ctx.strokeStyle = isDarkMode ? "#555" : "#333";
    ctx.lineWidth = 2;

    // 🔧 型に応じて確実に異なる形状を描画
    switch (bubble.type) {
      case "speech":
      case "普通":
      case "normal":
        this.drawSpeechBubble(ctx, bubble);
        break;
        
      case "thought":
      case "心の声":
        this.drawThoughtBubble(ctx, bubble);
        break;
        
      case "shout":
      case "叫び":
        this.drawShoutBubble(ctx, bubble);
        break;
        
      case "whisper":
      case "小声":
        this.drawWhisperBubble(ctx, bubble);
        break;
        
      default:
        this.drawSpeechBubble(ctx, bubble);
    }
  }

  // 通常の吹き出し（角丸四角形＋尻尾）
  static drawSpeechBubble(ctx: CanvasRenderingContext2D, bubble: SpeechBubble) {
    const cornerRadius = 12;
    
    // メイン吹き出し部分
    ctx.beginPath();
    ctx.roundRect(bubble.x, bubble.y, bubble.width, bubble.height, cornerRadius);
    ctx.fill();
    ctx.stroke();

    // 吹き出しの尻尾（三角形）
    const tailX = bubble.x + bubble.width * 0.15;
    const tailY = bubble.y + bubble.height;
    
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(tailX - 15, tailY + 20);
    ctx.lineTo(tailX + 15, tailY + 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 思考吹き出し（楕円形＋小さな泡）
  static drawThoughtBubble(ctx: CanvasRenderingContext2D, bubble: SpeechBubble) {
    // メインの楕円
    ctx.beginPath();
    ctx.ellipse(
      bubble.x + bubble.width / 2,
      bubble.y + bubble.height / 2,
      bubble.width / 2 - 5,
      bubble.height / 2 - 5,
      0, 0, Math.PI * 2
    );
    ctx.fill();
    ctx.stroke();

    // 思考の小さな泡（3つ）
    const bubblePositions = [
      { x: bubble.x + bubble.width * 0.2, y: bubble.y + bubble.height + 15, size: 12 },
      { x: bubble.x + bubble.width * 0.15, y: bubble.y + bubble.height + 35, size: 8 },
      { x: bubble.x + bubble.width * 0.1, y: bubble.y + bubble.height + 50, size: 5 }
    ];

    bubblePositions.forEach(pos => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, pos.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  // 叫び吹き出し（ギザギザの爆発型）
  static drawShoutBubble(ctx: CanvasRenderingContext2D, bubble: SpeechBubble) {
    const centerX = bubble.x + bubble.width / 2;
    const centerY = bubble.y + bubble.height / 2;
    const spikes = 12;
    const innerRadius = Math.min(bubble.width, bubble.height) / 2 - 10;
    const outerRadius = Math.min(bubble.width, bubble.height) / 2 + 15;
    
    ctx.beginPath();
    
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i / (spikes * 2)) * Math.PI * 2;
      const radius = (i % 2 === 0) ? outerRadius : innerRadius;
      
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 叫び効果線を追加
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const startRadius = outerRadius + 5;
      const endRadius = outerRadius + 25;
      
      const startX = centerX + Math.cos(angle) * startRadius;
      const startY = centerY + Math.sin(angle) * startRadius;
      const endX = centerX + Math.cos(angle) * endRadius;
      const endY = centerY + Math.sin(angle) * endRadius;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    
    // 線幅を元に戻す
    ctx.lineWidth = 2;
  }

  // ささやき吹き出し（点線の枠＋小さめ）
  static drawWhisperBubble(ctx: CanvasRenderingContext2D, bubble: SpeechBubble) {
    // 点線パターン設定
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 1.5;
    
    // 角を少し丸く
    const cornerRadius = 15;
    
    ctx.beginPath();
    ctx.roundRect(bubble.x + 5, bubble.y + 5, bubble.width - 10, bubble.height - 10, cornerRadius);
    ctx.fill();
    ctx.stroke();
    
    // 点線をリセット
    ctx.setLineDash([]);
    ctx.lineWidth = 2;
    
    // 小さな尻尾（点線）
    ctx.setLineDash([4, 3]);
    const tailX = bubble.x + bubble.width * 0.3;
    const tailY = bubble.y + bubble.height;
    
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(tailX - 8, tailY + 12);
    ctx.lineTo(tailX + 8, tailY + 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 点線をリセット
    ctx.setLineDash([]);
  }

  // 🆕 テキスト描画（強化版：編集中は特別表示）
  static drawBubbleTextEnhanced(ctx: CanvasRenderingContext2D, bubble: SpeechBubble) {
    if (!bubble.text || bubble.text.trim() === "") {
      // 🔧 テキストが空の場合は「編集中...」を表示
      ctx.fillStyle = "#888";
      ctx.font = "12px 'Noto Sans JP', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("編集中...", bubble.x + bubble.width / 2, bubble.y + bubble.height / 2);
      return;
    }

    const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";
    
    ctx.fillStyle = isDarkMode ? "#fff" : "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 吹き出し内のテキスト描画エリアを計算（余白を確保）
    const padding = 12;
    const textArea = {
      x: bubble.x + padding,
      y: bubble.y + padding,
      width: bubble.width - (padding * 2),
      height: bubble.height - (padding * 2)
    };

    // 最小サイズチェック
    if (textArea.width <= 0 || textArea.height <= 0) return;

    if (bubble.vertical) {
      // 縦書きモード
      this.drawVerticalText(ctx, bubble.text, textArea, bubble.fontSize);
    } else {
      // 横書きモード（文字折り返し対応）
      this.drawHorizontalText(ctx, bubble.text, textArea, bubble.fontSize);
    }
  }

  // 🆕 横書きテキスト描画（自動折り返し・フォントサイズ調整）
  static drawHorizontalText(ctx: CanvasRenderingContext2D, text: string, area: {x: number, y: number, width: number, height: number}, customFontSize?: number) {
    // 基本フォントサイズから開始（カスタムサイズがあればそれを使用）
    let fontSize = customFontSize || 32;
    let lines: string[] = [];
    let lineHeight = 0;
    
    // フォントサイズを調整してテキストがエリア内に収まるようにする
    const minSize = Math.max(18, customFontSize ? customFontSize * 0.6 : 18);
    for (let size = fontSize; size >= minSize; size -= 1) {
      ctx.font = `${size}px 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif`;
      lineHeight = size * 1.2;
      
      lines = this.wrapTextAdvanced(ctx, text, area.width);
      
      const totalHeight = lines.length * lineHeight;
      
      if (totalHeight <= area.height) {
        fontSize = size;
        break;
      }
    }

    // 最終的なフォント設定
    ctx.font = `${fontSize}px 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif`;
    
    // 描画開始位置を計算（中央揃え）
    const totalTextHeight = lines.length * lineHeight;
    const startY = area.y + (area.height - totalTextHeight) / 2 + lineHeight / 2;
    const centerX = area.x + area.width / 2;

    // 各行を描画
    lines.forEach((line, index) => {
      const y = startY + index * lineHeight;
      ctx.fillText(line, centerX, y);
    });

    console.log(`💬 横書きテキスト描画: "${text.substring(0, 10)}..." フォントサイズ:${fontSize} 行数:${lines.length}`);
  }

  // 🆕 縦書きテキスト描画（改良版）
  static drawVerticalText(ctx: CanvasRenderingContext2D, text: string, area: {x: number, y: number, width: number, height: number}, customFontSize?: number) {
    // 縦書き用基本設定（カスタムサイズがあればそれを使用）
    let fontSize = customFontSize || 32;
    const chars = Array.from(text); // Unicode対応の文字分割
    
    // 縦書きレイアウト計算
    const maxColumns = Math.floor(area.width / (fontSize * 1.2));
    const charsPerColumn = Math.floor(area.height / (fontSize * 1.2));
    
    // フォントサイズ調整
    const minSize = Math.max(18, customFontSize ? customFontSize * 0.6 : 18);
    for (let size = fontSize; size >= minSize; size -= 1) {
      const columnWidth = size * 1.2;
      const charHeight = size * 1.2;
      
      const columns = Math.ceil(chars.length / Math.floor(area.height / charHeight));
      const totalWidth = columns * columnWidth;
      
      if (totalWidth <= area.width) {
        fontSize = size;
        break;
      }
    }

    ctx.font = `${fontSize}px 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif`;
    
    const columnWidth = fontSize * 1.2;
    const charHeight = fontSize * 1.2;
    const charsPerCol = Math.floor(area.height / charHeight);
    const totalColumns = Math.ceil(chars.length / charsPerCol);
    
    // 描画開始位置（右から左へ）
    const startX = area.x + area.width - columnWidth / 2;
    const startY = area.y + (area.height - (charsPerCol * charHeight)) / 2 + charHeight / 2;

    // 各列を描画
    for (let col = 0; col < totalColumns; col++) {
      const x = startX - (col * columnWidth);
      
      for (let charIndex = 0; charIndex < charsPerCol; charIndex++) {
        const textIndex = col * charsPerCol + charIndex;
        if (textIndex >= chars.length) break;
        
        const char = chars[textIndex];
        const y = startY + charIndex * charHeight;
        
        ctx.fillText(char, x, y);
      }
    }

  }

  // 🆕 高度なテキスト折り返し処理（日本語対応）
  static wrapTextAdvanced(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const lines: string[] = [];
    const paragraphs = text.split('\n'); // 改行で段落分割

    for (const paragraph of paragraphs) {
      if (paragraph.trim() === '') {
        lines.push(''); // 空行を保持
        continue;
      }

      const words = this.segmentJapaneseText(paragraph);
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine + word;
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
    }

    return lines;
  }

  // 🆕 日本語テキストのセグメント化（改行に適した単位で分割）
  static segmentJapaneseText(text: string): string[] {
    const segments: string[] = [];
    let current = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      current += char;

      // 分割ポイントの判定
      const shouldBreak = this.isBreakablePoint(char, nextChar);

      if (shouldBreak || i === text.length - 1) {
        segments.push(current);
        current = '';
      }
    }

    return segments.filter(seg => seg.length > 0);
  }

  // 🆕 改行可能ポイントの判定
  static isBreakablePoint(char: string, nextChar?: string): boolean {
    if (!nextChar) return true;

    const code = char.charCodeAt(0);
    const nextCode = nextChar.charCodeAt(0);

    // 句読点、記号の後は改行可能
    if (/[。、！？．，]/.test(char)) return true;
    
    // ひらがな・カタカナの境界
    if ((code >= 0x3040 && code <= 0x309F) && // ひらがな
        (nextCode >= 0x30A0 && nextCode <= 0x30FF)) return true; // カタカナ
    
    // 漢字とひらがなの境界
    if ((code >= 0x4E00 && code <= 0x9FAF) && // 漢字
        (nextCode >= 0x3040 && nextCode <= 0x309F)) return true; // ひらがな

    // 英数字と日本語の境界
    if (/[a-zA-Z0-9]/.test(char) && /[ぁ-ゖァ-ヾ一-鶴]/.test(nextChar)) return true;
    if (/[ぁ-ゖァ-ヾ一-鶴]/.test(char) && /[a-zA-Z0-9]/.test(nextChar)) return true;

    // スペースの後は改行可能
    if (/\s/.test(char)) return true;

    // デフォルトは文字単位で改行可能（2文字以上の場合）
    return false;
  }

  // 8方向リサイズハンドル描画
  static drawResizeHandles(ctx: CanvasRenderingContext2D, bubble: SpeechBubble) {
    const handleSize = 12;
    const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";
    
    ctx.fillStyle = "#ff6b35";
    ctx.strokeStyle = isDarkMode ? "#fff" : "#000";
    ctx.lineWidth = 2;

    // 8方向のハンドル位置
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

    handles.forEach(handle => {
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

  // リサイズハンドル判定
  static isBubbleResizeHandleClicked(
    mouseX: number, 
    mouseY: number, 
    bubble: SpeechBubble, 
    panel: Panel
  ): { isClicked: boolean; direction: string } {
    const bubblePos = this.calculateBubblePosition(bubble, panel);
    const transformedBubble = { ...bubble, ...bubblePos };
    
    const handleSize = 12;
    const tolerance = 8;

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
    console.log(`🔎 findBubbleAt呼び出し: click=(${x},${y}), bubbles=${bubbles.length}個`);
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const bubble = bubbles[i];
      const panel = panels.find(p => p.id === bubble.panelId) || panels[0];
      if (!panel) continue;
      
      const bubblePos = this.calculateBubblePosition(bubble, panel);
      console.log(`  吹き出し${i}: id=${bubble.id}, 元座標=(${bubble.x},${bubble.y}), 画面座標=(${bubblePos.x},${bubblePos.y}), サイズ=${bubblePos.width}x${bubblePos.height}, isGlobal=${bubble.isGlobalPosition}`);
      
      if (x >= bubblePos.x && 
          x <= bubblePos.x + bubblePos.width &&
          y >= bubblePos.y && 
          y <= bubblePos.y + bubblePos.height) {
        console.log(`  ✅ ヒット！`);
        return bubble;
      }
    }
    
    return null;
  }

  // リサイズ実行
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

    switch (direction) {
      case "nw":
        newWidth = Math.max(minWidth, originalBounds.width - deltaX);
        newHeight = Math.max(minHeight, originalBounds.height - deltaY);
        newX = originalBounds.x + originalBounds.width - newWidth;
        newY = originalBounds.y + originalBounds.height - newHeight;
        break;
      case "n":
        newHeight = Math.max(minHeight, originalBounds.height - deltaY);
        newY = originalBounds.y + originalBounds.height - newHeight;
        break;
      case "ne":
        newWidth = Math.max(minWidth, originalBounds.width + deltaX);
        newHeight = Math.max(minHeight, originalBounds.height - deltaY);
        newY = originalBounds.y + originalBounds.height - newHeight;
        break;
      case "e":
        newWidth = Math.max(minWidth, originalBounds.width + deltaX);
        break;
      case "se":
        newWidth = Math.max(minWidth, originalBounds.width + deltaX);
        newHeight = Math.max(minHeight, originalBounds.height + deltaY);
        break;
      case "s":
        newHeight = Math.max(minHeight, originalBounds.height + deltaY);
        break;
      case "sw":
        newWidth = Math.max(minWidth, originalBounds.width - deltaX);
        newHeight = Math.max(minHeight, originalBounds.height + deltaY);
        newX = originalBounds.x + originalBounds.width - newWidth;
        break;
      case "w":
        newWidth = Math.max(minWidth, originalBounds.width - deltaX);
        newX = originalBounds.x + originalBounds.width - newWidth;
        break;
      default:
        return bubble;
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