// src/components/CanvasArea/renderers/BubbleRenderer.tsx
import { SpeechBubble, Panel } from "../../../types";

export class BubbleRenderer {
  // 吹き出し描画機能
  static drawBubbles(
    ctx: CanvasRenderingContext2D,
    speechBubbles: SpeechBubble[],
    panels: Panel[],
    selectedBubble: SpeechBubble | null
  ) {
    speechBubbles.forEach((bubble) => {
      const panel = panels.find((p) => p.id === bubble.panelId);
      if (!panel) return;
      BubbleRenderer.drawBubble(ctx, bubble, panel, selectedBubble);
    });
  }

  // 個別吹き出し描画（絶対座標のみ）
static drawBubble(
  ctx: CanvasRenderingContext2D,
  bubble: SpeechBubble,
  panel: Panel,
  selectedBubble: SpeechBubble | null
) {
  // 常に絶対座標で描画
  const bubbleX = bubble.x - bubble.width / 2;
  const bubbleY = bubble.y - bubble.height / 2;

  // 選択状態の背景
  if (bubble === selectedBubble) {
    ctx.fillStyle = "rgba(255, 20, 147, 0.2)";
    ctx.fillRect(bubbleX - 5, bubbleY - 5, bubble.width + 10, bubble.height + 10);
    ctx.strokeStyle = "#ff1493";
    ctx.lineWidth = 2;
    ctx.strokeRect(bubbleX - 5, bubbleY - 5, bubble.width + 10, bubble.height + 10);
    
    BubbleRenderer.drawBubbleResizeHandles(ctx, bubbleX, bubbleY, bubble.width, bubble.height);
  }

    // 吹き出しの種類によって形状を変える
    switch (bubble.type) {
      case "普通":
        BubbleRenderer.drawNormalBubble(ctx, bubbleX, bubbleY, bubble.width, bubble.height);
        break;
      case "叫び":
        BubbleRenderer.drawShoutBubble(ctx, bubbleX, bubbleY, bubble.width, bubble.height);
        break;
      case "小声":
        BubbleRenderer.drawWhisperBubble(ctx, bubbleX, bubbleY, bubble.width, bubble.height);
        break;
      case "心の声":
        BubbleRenderer.drawThoughtBubble(ctx, bubbleX, bubbleY, bubble.width, bubble.height);
        break;
      default:
        BubbleRenderer.drawNormalBubble(ctx, bubbleX, bubbleY, bubble.width, bubble.height);
    }

    // 吹き出しの尻尾（しっぽ）を描画
    BubbleRenderer.drawBubbleTail(ctx, bubbleX, bubbleY, bubble.width, bubble.height, bubble.type);

    // 縦書きテキスト
    ctx.fillStyle = "#333";
    ctx.font = "12px Arial";
    if (bubble.vertical) {
      // 縦書き描画（改良版）
      const chars = bubble.text.split("");
      const startX = bubbleX + bubble.width / 2 - 6;
      const startY = bubbleY + 20;
      chars.forEach((char, index) => {
        ctx.fillText(
          char,
          startX,
          startY + index * 14
        );
      });
    } else {
      // 横書き
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        bubble.text,
        bubbleX + bubble.width / 2,
        bubbleY + bubble.height / 2
      );
    }
  }

  // 吹き出しリサイズハンドル描画（8方向）
  static drawBubbleResizeHandles(
    ctx: CanvasRenderingContext2D,
    bubbleX: number,
    bubbleY: number,
    width: number,
    height: number
  ) {
    const handleSize = 16;
    
    // 8方向のハンドル
    const positions = [
      { x: bubbleX - handleSize/2, y: bubbleY - handleSize/2, type: "corner" }, // 左上
      { x: bubbleX + width/2 - handleSize/2, y: bubbleY - handleSize/2, type: "edge" }, // 上
      { x: bubbleX + width - handleSize/2, y: bubbleY - handleSize/2, type: "corner" }, // 右上
      { x: bubbleX + width - handleSize/2, y: bubbleY + height/2 - handleSize/2, type: "edge" }, // 右
      { x: bubbleX + width - handleSize/2, y: bubbleY + height - handleSize/2, type: "corner" }, // 右下
      { x: bubbleX + width/2 - handleSize/2, y: bubbleY + height - handleSize/2, type: "edge" }, // 下
      { x: bubbleX - handleSize/2, y: bubbleY + height - handleSize/2, type: "corner" }, // 左下
      { x: bubbleX - handleSize/2, y: bubbleY + height/2 - handleSize/2, type: "edge" }, // 左
    ];

    positions.forEach((pos) => {
      if (pos.type === "corner") {
        // 角：四角形（比例リサイズ）
        ctx.fillStyle = "#ff1493";
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.fillRect(pos.x, pos.y, handleSize, handleSize);
        ctx.strokeRect(pos.x, pos.y, handleSize, handleSize);
      } else {
        // 辺：円形（縦横リサイズ）
        ctx.fillStyle = "#1493ff";
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos.x + handleSize/2, pos.y + handleSize/2, handleSize/2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    });
  }

  // 普通の吹き出し（楕円形）
  static drawNormalBubble(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radiusX = width / 2;
    const radiusY = height / 2;

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // 叫び声の吹き出し（ギザギザ）
  static drawShoutBubble(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    ctx.beginPath();
    
    // ギザギザの点を計算
    const points = [];
    const segments = 16; // ギザギザの数
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      const isOuter = i % 2 === 0;
      const radiusX = isOuter ? width / 2 : width / 2.5;
      const radiusY = isOuter ? height / 2 : height / 2.5;
      
      const px = centerX + Math.cos(angle) * radiusX;
      const py = centerY + Math.sin(angle) * radiusY;
      points.push({ x: px, y: py });
    }
    
    // パスを描画
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(point => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
    
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // 小声の吹き出し（点線）
  static drawWhisperBubble(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radiusX = width / 2;
    const radiusY = height / 2;

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    
    // 点線で描画
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]); // 点線をリセット
  }

  // 心の声（雲形）
  static drawThoughtBubble(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    // 雲を表現する複数の円
    const circles = [
      { x: centerX - width * 0.3, y: centerY - height * 0.2, r: width * 0.25 },
      { x: centerX + width * 0.2, y: centerY - height * 0.3, r: width * 0.2 },
      { x: centerX + width * 0.3, y: centerY + height * 0.1, r: width * 0.22 },
      { x: centerX - width * 0.2, y: centerY + height * 0.2, r: width * 0.18 },
      { x: centerX, y: centerY, r: width * 0.3 },
    ];
    
    ctx.fillStyle = "white";
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    
    circles.forEach(circle => {
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    });
  }

  // 吹き出しの尻尾
  static drawBubbleTail(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    type: string
  ) {
    if (type === "心の声") {
      // 思考泡（小さい円）
      const bubbles = [
        { x: x + width * 0.2, y: y + height + 10, r: 4 },
        { x: x + width * 0.1, y: y + height + 20, r: 2 },
      ];
      
      ctx.fillStyle = "white";
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      
      bubbles.forEach(bubble => {
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      });
    } else {
      // 通常の尻尾（三角形）
      const tailX = x + width * 0.2;
      const tailY = y + height;
      
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(tailX - 10, tailY + 15);
      ctx.lineTo(tailX + 15, tailY + 8);
      ctx.closePath();
      
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // 8方向ハンドルクリック判定（戻り値を修正）
  static isBubbleResizeHandleClicked(
    mouseX: number,
    mouseY: number,
    bubble: SpeechBubble,
    panel: Panel
  ): { isClicked: boolean; direction: string } {
    const bubbleX = bubble.x - bubble.width / 2;
    const bubbleY = bubble.y - bubble.height / 2;
    const handleSize = 12;
    const tolerance = 8;

    const positions = [
      { x: bubbleX - handleSize/2, y: bubbleY - handleSize/2, type: "nw" },
      { x: bubbleX + bubble.width/2 - handleSize/2, y: bubbleY - handleSize/2, type: "n" },
      { x: bubbleX + bubble.width - handleSize/2, y: bubbleY - handleSize/2, type: "ne" },
      { x: bubbleX + bubble.width - handleSize/2, y: bubbleY + bubble.height/2 - handleSize/2, type: "e" },
      { x: bubbleX + bubble.width - handleSize/2, y: bubbleY + bubble.height - handleSize/2, type: "se" },
      { x: bubbleX + bubble.width/2 - handleSize/2, y: bubbleY + bubble.height - handleSize/2, type: "s" },
      { x: bubbleX - handleSize/2, y: bubbleY + bubble.height - handleSize/2, type: "sw" },
      { x: bubbleX - handleSize/2, y: bubbleY + bubble.height/2 - handleSize/2, type: "w" },
    ];

    for (const pos of positions) {
      if (
        mouseX >= pos.x - tolerance &&
        mouseX <= pos.x + handleSize + tolerance &&
        mouseY >= pos.y - tolerance &&
        mouseY <= pos.y + handleSize + tolerance
      ) {
        console.log(`リサイズハンドル ${pos.type} クリック検出!`);
        return { isClicked: true, direction: pos.type };
      }
    }
    
    return { isClicked: false, direction: "" };
  }

  // 検索も絶対座標のみ
  static findBubbleAt(
    mouseX: number, 
    mouseY: number, 
    speechBubbles: SpeechBubble[], 
    panels: Panel[]
  ): SpeechBubble | null {
    for (let i = speechBubbles.length - 1; i >= 0; i--) {
      const bubble = speechBubbles[i];
      
      const bubbleX = bubble.x - bubble.width / 2;
      const bubbleY = bubble.y - bubble.height / 2;

      if (
        mouseX >= bubbleX &&
        mouseX <= bubbleX + bubble.width &&
        mouseY >= bubbleY &&
        mouseY <= bubbleY + bubble.height
      ) {
        return bubble;
      }
    }
    return null;
  }

  // 吹き出しの自由移動対応（パネル外も可能）
  static findBubbleAtGlobal(
    mouseX: number, 
    mouseY: number, 
    speechBubbles: SpeechBubble[], 
    panels: Panel[]
  ): SpeechBubble | null {
    for (let i = speechBubbles.length - 1; i >= 0; i--) {
      const bubble = speechBubbles[i];
      const panel = panels.find((p) => p.id === bubble.panelId);
      if (!panel) continue;

      // 絶対座標で計算（パネル外も含む）
      const bubbleX = panel.x + panel.width * bubble.x - bubble.width / 2;
      const bubbleY = panel.y + panel.height * bubble.y - bubble.height / 2;

      if (
        mouseX >= bubbleX &&
        mouseX <= bubbleX + bubble.width &&
        mouseY >= bubbleY &&
        mouseY <= bubbleY + bubble.height
      ) {
        return bubble;
      }
    }
    return null;
  }
}

