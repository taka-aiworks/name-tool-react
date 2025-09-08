// src/components/CanvasArea/renderers/CharacterRenderer.tsx (完全修正版)
import { Character, Panel } from "../../../types";

export class CharacterRenderer {
  // キャラクター群描画
  static drawCharacters(
    ctx: CanvasRenderingContext2D,
    characters: Character[],
    panels: Panel[],
    selectedCharacter: Character | null
  ) {
    characters.forEach((character) => {
      const panel = panels.find((p) => p.id === character.panelId);
      if (!panel) return;
      CharacterRenderer.drawCharacter(ctx, character, panel, selectedCharacter);
    });
  }

  // 個別キャラクター描画（絶対座標対応）
  static drawCharacter(
    ctx: CanvasRenderingContext2D,
    character: Character,
    panel: Panel,
    selectedCharacter: Character | null
  ) {
    // 絶対座標か相対座標かで分岐
    let charX, charY, charWidth, charHeight;
    
    if (character.isGlobalPosition) {
      // 絶対座標（吹き出しと同じ方式）
      charWidth = CharacterRenderer.getCharacterWidth(character);
      charHeight = CharacterRenderer.getCharacterHeight(character);
      charX = character.x - charWidth / 2;
      charY = character.y - charHeight / 2;
    } else {
      // 従来の相対座標
      charWidth = 60 * character.scale;
      charHeight = 40 * character.scale;
      charX = panel.x + panel.width * character.x - charWidth / 2;
      charY = panel.y + panel.height * character.y - charHeight / 2;
    }

    // 選択状態の背景
    if (character === selectedCharacter) {
      ctx.fillStyle = "rgba(255, 102, 0, 0.2)";
      ctx.fillRect(charX - 5, charY - 5, charWidth + 10, charHeight + 10);
      ctx.strokeStyle = "#ff6600";
      ctx.lineWidth = 2;
      ctx.strokeRect(charX - 5, charY - 5, charWidth + 10, charHeight + 10);
      
      // リサイズハンドル（吹き出しと同じ方式）
      CharacterRenderer.drawCharacterResizeHandles(
        ctx,
        charX,
        charY,
        charWidth,
        charHeight
      );
    }

    // キャラクター本体描画
    CharacterRenderer.drawCharacterBody(ctx, character, charX, charY, charWidth, charHeight);

    // 名前表示
    ctx.fillStyle = "#333";
    ctx.font = `${8 * character.scale}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(
      character.name,
      charX + charWidth / 2,
      charY + charHeight + 15
    );
  }

  // キャラクター幅計算（表示タイプ対応）
  static getCharacterWidth(character: Character): number {
    const baseWidth = 60;
    let typeMultiplier = 1.0;
    
    switch (character.viewType) {
      case "face":
        typeMultiplier = 0.8;  // 顔のみは小さめ
        break;
      case "halfBody":
        typeMultiplier = 1.0;  // 基本サイズ
        break;
      case "fullBody":
        typeMultiplier = 1.2;  // 全身は大きめ
        break;
      default:
        typeMultiplier = 1.0;
    }
    
    return baseWidth * character.scale * typeMultiplier;
  }

  // キャラクター高さ計算（表示タイプ対応）
  static getCharacterHeight(character: Character): number {
    const baseHeight = 40;
    let typeMultiplier = 1.0;
    
    switch (character.viewType) {
      case "face":
        typeMultiplier = 1.0;   // 顔のみ：正方形に近い
        break;
      case "halfBody":
        typeMultiplier = 1.5;   // 上半身：縦長
        break;
      case "fullBody":
        typeMultiplier = 2.0;   // 全身：かなり縦長
        break;
      default:
        typeMultiplier = 1.0;
    }
    
    return baseHeight * character.scale * typeMultiplier;
  }

  // キャラクター本体描画（向き対応版）
  static drawCharacterBody(
    ctx: CanvasRenderingContext2D,
    character: Character,
    charX: number,
    charY: number,
    charWidth: number,
    charHeight: number
  ) {
    // 全体の枠
    ctx.fillStyle = "rgba(0, 102, 255, 0.1)";
    ctx.fillRect(charX, charY, charWidth, charHeight);
    ctx.strokeStyle = "#0066ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(charX, charY, charWidth, charHeight);

    // 表示タイプに応じた描画
    switch (character.viewType) {
      case "face":
        CharacterRenderer.drawFaceOnly(ctx, character, charX, charY, charWidth, charHeight);
        break;
      case "halfBody":
        CharacterRenderer.drawHalfBody(ctx, character, charX, charY, charWidth, charHeight);
        break;
      case "fullBody":
        CharacterRenderer.drawFullBody(ctx, character, charX, charY, charWidth, charHeight);
        break;
      default:
        CharacterRenderer.drawHalfBody(ctx, character, charX, charY, charWidth, charHeight);
    }
  }

  // 顔のみ描画（向き対応）
  static drawFaceOnly(
    ctx: CanvasRenderingContext2D,
    character: Character,
    charX: number,
    charY: number,
    charWidth: number,
    charHeight: number
  ) {
    const headSize = Math.min(charWidth, charHeight) * 0.8;
    const headX = charX + charWidth / 2 - headSize / 2;
    const headY = charY + charHeight / 2 - headSize / 2;
    
    // 顔
    ctx.fillStyle = "#ffcc99";
    ctx.beginPath();
    ctx.arc(
      headX + headSize / 2,
      headY + headSize / 2,
      headSize / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.stroke();

    // 向きに応じて顔の特徴を描画
    CharacterRenderer.drawFaceFeatures(ctx, character, headX, headY, headSize);
  }

  // 上半身描画（向き対応）
  static drawHalfBody(
    ctx: CanvasRenderingContext2D,
    character: Character,
    charX: number,
    charY: number,
    charWidth: number,
    charHeight: number
  ) {
    const headSize = charWidth * 0.4;
    const headX = charX + charWidth / 2 - headSize / 2;
    const headY = charY + charHeight * 0.1;
    
    // 頭部
    ctx.fillStyle = "#ffcc99";
    ctx.beginPath();
    ctx.arc(
      headX + headSize / 2,
      headY + headSize / 2,
      headSize / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.stroke();

    // 向きに応じて顔の特徴を描画
    CharacterRenderer.drawFaceFeatures(ctx, character, headX, headY, headSize);

    // 体（上半身）- 向きに応じて調整
    const bodyWidth = charWidth * 0.6;
    const bodyHeight = charHeight * 0.5;
    const bodyX = charX + charWidth / 2 - bodyWidth / 2;
    const bodyY = headY + headSize;
    
    // 向きに応じて体の色を変更
    ctx.fillStyle = character.faceAngle === "back" ? "#2E7D32" : "#4CAF50";
    ctx.fillRect(bodyX, bodyY, bodyWidth, bodyHeight);
    ctx.strokeRect(bodyX, bodyY, bodyWidth, bodyHeight);

    // 肩や腕の表現（簡略化）
    if (character.faceAngle !== "back") {
      // 正面・横向きの場合は腕を描画
      const armWidth = bodyWidth * 0.2;
      const armHeight = bodyHeight * 0.8;
      
      // 左腕
      ctx.fillStyle = "#ffcc99";
      ctx.fillRect(bodyX - armWidth / 2, bodyY + 10, armWidth, armHeight);
      
      // 右腕
      ctx.fillRect(bodyX + bodyWidth - armWidth / 2, bodyY + 10, armWidth, armHeight);
    }
  }

  // 全身描画（向き対応）
  static drawFullBody(
    ctx: CanvasRenderingContext2D,
    character: Character,
    charX: number,
    charY: number,
    charWidth: number,
    charHeight: number
  ) {
    const headSize = charWidth * 0.3;
    const headX = charX + charWidth / 2 - headSize / 2;
    const headY = charY + charHeight * 0.05;
    
    // 頭部
    ctx.fillStyle = "#ffcc99";
    ctx.beginPath();
    ctx.arc(
      headX + headSize / 2,
      headY + headSize / 2,
      headSize / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.stroke();

    // 向きに応じて顔の特徴を描画
    CharacterRenderer.drawFaceFeatures(ctx, character, headX, headY, headSize);

    // 体（上半身）
    const bodyWidth = charWidth * 0.5;
    const bodyHeight = charHeight * 0.3;
    const bodyX = charX + charWidth / 2 - bodyWidth / 2;
    const bodyY = headY + headSize;
    
    ctx.fillStyle = character.faceAngle === "back" ? "#2E7D32" : "#4CAF50";
    ctx.fillRect(bodyX, bodyY, bodyWidth, bodyHeight);
    ctx.strokeRect(bodyX, bodyY, bodyWidth, bodyHeight);

    // 脚
    const legWidth = charWidth * 0.4;
    const legHeight = charHeight * 0.4;
    const legX = charX + charWidth / 2 - legWidth / 2;
    const legY = bodyY + bodyHeight;
    ctx.fillStyle = "#2196F3";
    ctx.fillRect(legX, legY, legWidth, legHeight);
    ctx.strokeRect(legX, legY, legWidth, legHeight);
  }

  // 顔の特徴描画（向き・視線対応）
  static drawFaceFeatures(
    ctx: CanvasRenderingContext2D,
    character: Character,
    headX: number,
    headY: number,
    headSize: number
  ) {
    if (character.faceAngle === "back") {
      // 後ろ向きの場合は髪の毛だけ描画
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(headX + headSize * 0.2, headY + headSize * 0.1, headSize * 0.6, headSize * 0.3);
      return;
    }

    const eyeSize = headSize * 0.08;
    let leftEyeX, rightEyeX, eyeY;

    // 顔の向きに応じて目の位置を調整
    switch (character.faceAngle) {
      case "left":
        leftEyeX = headX + headSize * 0.25;
        rightEyeX = headX + headSize * 0.5;
        eyeY = headY + headSize * 0.4;
        break;
      case "right":
        leftEyeX = headX + headSize * 0.5;
        rightEyeX = headX + headSize * 0.75;
        eyeY = headY + headSize * 0.4;
        break;
      case "front":
      default:
        leftEyeX = headX + headSize * 0.3;
        rightEyeX = headX + headSize * 0.7;
        eyeY = headY + headSize * 0.4;
        break;
    }

    // 目を描画
    ctx.fillStyle = "#333";
    
    // 左目 - 右向き以外で表示
    if (character.faceAngle !== "right") {
      ctx.beginPath();
      ctx.arc(leftEyeX, eyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 右目 - 左向き以外で表示
    if (character.faceAngle !== "left") {
      ctx.beginPath();
      ctx.arc(rightEyeX, eyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // 視線方向の表現（瞳の位置調整）
    if (character.eyeDirection !== "center") {
      ctx.fillStyle = "#fff";
      const pupilSize = eyeSize * 0.3;
      let offsetX = 0, offsetY = 0;

      switch (character.eyeDirection) {
        case "left":
          offsetX = -eyeSize * 0.3;
          break;
        case "right":
          offsetX = eyeSize * 0.3;
          break;
        case "up":
          offsetY = -eyeSize * 0.3;
          break;
        case "down":
          offsetY = eyeSize * 0.3;
          break;
      }

      // 瞳のハイライト - 左目
      if (character.faceAngle !== "right") {
        ctx.beginPath();
        ctx.arc(leftEyeX + offsetX, eyeY + offsetY, pupilSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // 瞳のハイライト - 右目
      if (character.faceAngle !== "left") {
        ctx.beginPath();
        ctx.arc(rightEyeX + offsetX, eyeY + offsetY, pupilSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 鼻（簡略化）
    if (character.faceAngle === "front") {
      ctx.fillStyle = "#ffaa88";
      ctx.fillRect(
        headX + headSize * 0.48,
        headY + headSize * 0.5,
        headSize * 0.04,
        headSize * 0.08
      );
    }

    // 口（簡略化）
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const mouthY = headY + headSize * 0.65;
    
    switch (character.faceAngle) {
      case "left":
        ctx.arc(headX + headSize * 0.4, mouthY, headSize * 0.06, 0, Math.PI);
        break;
      case "right":
        ctx.arc(headX + headSize * 0.6, mouthY, headSize * 0.06, 0, Math.PI);
        break;
      case "front":
      default:
        ctx.arc(headX + headSize * 0.5, mouthY, headSize * 0.08, 0, Math.PI);
        break;
    }
    ctx.stroke();
  }

  // リサイズハンドル描画（吹き出しと同じ方式）
  static drawCharacterResizeHandles(
    ctx: CanvasRenderingContext2D,
    charX: number,
    charY: number,
    width: number,
    height: number
  ) {
    const handleSize = 16;
    
    // 8方向のハンドル
    const positions = [
      { x: charX - handleSize/2, y: charY - handleSize/2, type: "corner" }, // 左上
      { x: charX + width/2 - handleSize/2, y: charY - handleSize/2, type: "edge" }, // 上
      { x: charX + width - handleSize/2, y: charY - handleSize/2, type: "corner" }, // 右上
      { x: charX + width - handleSize/2, y: charY + height/2 - handleSize/2, type: "edge" }, // 右
      { x: charX + width - handleSize/2, y: charY + height - handleSize/2, type: "corner" }, // 右下
      { x: charX + width/2 - handleSize/2, y: charY + height - handleSize/2, type: "edge" }, // 下
      { x: charX - handleSize/2, y: charY + height - handleSize/2, type: "corner" }, // 左下
      { x: charX - handleSize/2, y: charY + height/2 - handleSize/2, type: "edge" }, // 左
    ];

    positions.forEach((pos) => {
      if (pos.type === "corner") {
        // 角：四角形（比例リサイズ）
        ctx.fillStyle = "#ff6600";
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.fillRect(pos.x, pos.y, handleSize, handleSize);
        ctx.strokeRect(pos.x, pos.y, handleSize, handleSize);
      } else {
        // 辺：円形（縦横リサイズ）
        ctx.fillStyle = "#ff9900";
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos.x + handleSize/2, pos.y + handleSize/2, handleSize/2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    });
  }

  // キャラクター検索（絶対座標対応）
  static findCharacterAt(
    mouseX: number,
    mouseY: number,
    characters: Character[],
    panels: Panel[]
  ): Character | null {
    for (let i = characters.length - 1; i >= 0; i--) {
      const character = characters[i];
      const panel = panels.find((p) => p.id === character.panelId);
      if (!panel) continue;

      let charX, charY, charWidth, charHeight;
      
      if (character.isGlobalPosition) {
        // 絶対座標
        charWidth = CharacterRenderer.getCharacterWidth(character);
        charHeight = CharacterRenderer.getCharacterHeight(character);
        charX = character.x - charWidth / 2;
        charY = character.y - charHeight / 2;
      } else {
        // 相対座標
        charWidth = 60 * character.scale;
        charHeight = 40 * character.scale;
        charX = panel.x + panel.width * character.x - charWidth / 2;
        charY = panel.y + panel.height * character.y - charHeight / 2;
      }

      if (
        mouseX >= charX &&
        mouseX <= charX + charWidth &&
        mouseY >= charY &&
        mouseY <= charY + charHeight
      ) {
        return character;
      }
    }
    return null;
  }

  // リサイズハンドルクリック判定（吹き出しと同じ方式）
  static isCharacterResizeHandleClicked(
    mouseX: number,
    mouseY: number,
    character: Character,
    panel: Panel
  ): { isClicked: boolean; direction: string } {
    let charX, charY, charWidth, charHeight;
    
    if (character.isGlobalPosition) {
      // 絶対座標
      charWidth = CharacterRenderer.getCharacterWidth(character);
      charHeight = CharacterRenderer.getCharacterHeight(character);
      charX = character.x - charWidth / 2;
      charY = character.y - charHeight / 2;
    } else {
      // 相対座標
      charWidth = 60 * character.scale;
      charHeight = 40 * character.scale;
      charX = panel.x + panel.width * character.x - charWidth / 2;
      charY = panel.y + panel.height * character.y - charHeight / 2;
    }

    const handleSize = 12;
    const tolerance = 8;

    const positions = [
      { x: charX - handleSize/2, y: charY - handleSize/2, type: "nw" },
      { x: charX + charWidth/2 - handleSize/2, y: charY - handleSize/2, type: "n" },
      { x: charX + charWidth - handleSize/2, y: charY - handleSize/2, type: "ne" },
      { x: charX + charWidth - handleSize/2, y: charY + charHeight/2 - handleSize/2, type: "e" },
      { x: charX + charWidth - handleSize/2, y: charY + charHeight - handleSize/2, type: "se" },
      { x: charX + charWidth/2 - handleSize/2, y: charY + charHeight - handleSize/2, type: "s" },
      { x: charX - handleSize/2, y: charY + charHeight - handleSize/2, type: "sw" },
      { x: charX - handleSize/2, y: charY + charHeight/2 - handleSize/2, type: "w" },
    ];

    for (const pos of positions) {
      if (
        mouseX >= pos.x - tolerance &&
        mouseX <= pos.x + handleSize + tolerance &&
        mouseY >= pos.y - tolerance &&
        mouseY <= pos.y + handleSize + tolerance
      ) {
        console.log(`キャラクターリサイズハンドル ${pos.type} クリック検出!`);
        return { isClicked: true, direction: pos.type };
      }
    }
    
    return { isClicked: false, direction: "" };
  }

  // 従来のリサイズハンドル判定（後方互換性）
  static isResizeHandleClicked(
    mouseX: number,
    mouseY: number,
    character: Character,
    panel: Panel
  ): boolean {
    const result = CharacterRenderer.isCharacterResizeHandleClicked(mouseX, mouseY, character, panel);
    return result.isClicked;
  }
}