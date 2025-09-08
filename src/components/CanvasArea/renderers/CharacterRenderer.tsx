// src/components/CanvasArea/renderers/CharacterRenderer.tsx (人間化版)
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

  // 個別キャラクター描画
  static drawCharacter(
    ctx: CanvasRenderingContext2D,
    character: Character,
    panel: Panel,
    selectedCharacter: Character | null
  ) {
    let charX, charY, charWidth, charHeight;
    
    if (character.isGlobalPosition) {
      charWidth = CharacterRenderer.getCharacterWidth(character);
      charHeight = CharacterRenderer.getCharacterHeight(character);
      charX = character.x - charWidth / 2;
      charY = character.y - charHeight / 2;
    } else {
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
      
      CharacterRenderer.drawCharacterResizeHandles(ctx, charX, charY, charWidth, charHeight);
    }

    // キャラクター本体描画
    CharacterRenderer.drawCharacterBody(ctx, character, charX, charY, charWidth, charHeight);

    // 名前表示
    ctx.fillStyle = "#333";
    ctx.font = `${Math.max(8, 6 * character.scale)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(character.name, charX + charWidth / 2, charY + charHeight + 12);
  }

  // 幅・高さ計算（改良）
  static getCharacterWidth(character: Character): number {
    const baseWidth = 50; // 50に縮小
    let typeMultiplier = 1.0;
    
    switch (character.viewType) {
      case "face": typeMultiplier = 0.8; break;
      case "halfBody": typeMultiplier = 1.0; break;
      case "fullBody": typeMultiplier = 1.1; break; // 少し縮小
      default: typeMultiplier = 1.0;
    }
    
    return baseWidth * character.scale * typeMultiplier;
  }

  static getCharacterHeight(character: Character): number {
    const baseHeight = 60; // 60に拡大（頭身バランス改善）
    let typeMultiplier = 1.0;
    
    switch (character.viewType) {
      case "face": typeMultiplier = 0.8; break;
      case "halfBody": typeMultiplier = 1.2; break; // 少し縮小
      case "fullBody": typeMultiplier = 1.8; break; // 少し縮小
      default: typeMultiplier = 1.0;
    }
    
    return baseHeight * character.scale * typeMultiplier;
  }

  // キャラクター本体描画（簡略化・枠線なし）
  static drawCharacterBody(
    ctx: CanvasRenderingContext2D,
    character: Character,
    charX: number,
    charY: number,
    charWidth: number,
    charHeight: number
  ) {
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

  // 顔のみ描画
  static drawFaceOnly(
    ctx: CanvasRenderingContext2D,
    character: Character,
    charX: number,
    charY: number,
    charWidth: number,
    charHeight: number
  ) {
    const headSize = Math.min(charWidth, charHeight) * 0.9;
    const headX = charX + charWidth / 2 - headSize / 2;
    const headY = charY + charHeight / 2 - headSize / 2;
    
    CharacterRenderer.drawHead(ctx, character, headX, headY, headSize);
  }

  // 上半身描画（改良）
  static drawHalfBody(
    ctx: CanvasRenderingContext2D,
    character: Character,
    charX: number,
    charY: number,
    charWidth: number,
    charHeight: number
  ) {
    const headSize = charWidth * 0.45; // 頭を少し大きく
    const headX = charX + charWidth / 2 - headSize / 2;
    const headY = charY + charHeight * 0.05; // 頭の位置を上に
    
    // 体の描画
    CharacterRenderer.drawBodyHalf(ctx, character, charX, charY, charWidth, charHeight, headY + headSize);
    
    // 頭部は最後に描画（髪が体に重なるように）
    CharacterRenderer.drawHead(ctx, character, headX, headY, headSize);
  }

  // 全身描画（改良）
  static drawFullBody(
    ctx: CanvasRenderingContext2D,
    character: Character,
    charX: number,
    charY: number,
    charWidth: number,
    charHeight: number
  ) {
    const headSize = charWidth * 0.35; // 頭のサイズ調整
    const headX = charX + charWidth / 2 - headSize / 2;
    const headY = charY + charHeight * 0.02;
    
    // 体の描画
    CharacterRenderer.drawBodyFull(ctx, character, charX, charY, charWidth, charHeight, headY + headSize);
    
    // 頭部は最後に描画
    CharacterRenderer.drawHead(ctx, character, headX, headY, headSize);
  }

  // 頭部描画（大幅改良）
  static drawHead(
    ctx: CanvasRenderingContext2D,
    character: Character,
    headX: number,
    headY: number,
    headSize: number
  ) {
    const direction = character.bodyDirection || character.faceAngle || "front";
    
    // 肌色の頭（より自然な楕円）
    ctx.fillStyle = "#FFCCAA";
    ctx.beginPath();
    
    // 少し縦長の頭にする
    const headWidth = headSize * 0.85;
    const headHeight = headSize;
    ctx.ellipse(
      headX + headSize / 2, 
      headY + headSize / 2, 
      headWidth / 2, 
      headHeight / 2, 
      0, 0, Math.PI * 2
    );
    ctx.fill();
    
    // 頭の輪郭（薄く）
    ctx.strokeStyle = "#E8B887";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // 髪の毛（先に描画）
    CharacterRenderer.drawHair(ctx, character, headX, headY, headSize, direction);

    // 後ろ向きの場合は顔の特徴を描画しない
    if (direction === "back") {
      return;
    }

    // 顔の特徴描画
    CharacterRenderer.drawFaceFeatures(ctx, character, headX, headY, headSize, direction);
  }

  // 体描画（上半身・改良版）
  static drawBodyHalf(
    ctx: CanvasRenderingContext2D,
    character: Character,
    charX: number,
    charY: number,
    charWidth: number,
    charHeight: number,
    bodyStartY: number
  ) {
    const direction = character.bodyDirection || character.faceAngle || "front";
    const bodyWidth = charWidth * 0.7; // 体幅を広く
    const bodyHeight = charHeight * 0.55; // 体高を調整
    const bodyX = charX + charWidth / 2 - bodyWidth / 2;
    const bodyY = bodyStartY;

    // 体の向きに応じた描画（簡略化：4方向のみ）
    switch (direction) {
      case "back":
        CharacterRenderer.drawBodyBack(ctx, bodyX, bodyY, bodyWidth, bodyHeight);
        break;
      case "left":
        CharacterRenderer.drawBodySide(ctx, bodyX, bodyY, bodyWidth, bodyHeight, "left");
        break;
      case "right":
        CharacterRenderer.drawBodySide(ctx, bodyX, bodyY, bodyWidth, bodyHeight, "right");
        break;
      case "front":
      default:
        CharacterRenderer.drawBodyFront(ctx, bodyX, bodyY, bodyWidth, bodyHeight);
        break;
    }
  }

  // 正面向きの体（改良）
  static drawBodyFront(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    // 胴体（より自然な形）
    ctx.fillStyle = "#4CAF50";
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8); // 角丸
    ctx.fill();
    
    ctx.strokeStyle = "#2E7D32";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 両肩・腕（より自然に）
    const armW = w * 0.18;
    const armH = h * 0.75;
    
    // 左腕
    ctx.fillStyle = "#FFCCAA";
    ctx.beginPath();
    ctx.roundRect(x - armW / 2, y + h * 0.1, armW, armH, 4);
    ctx.fill();
    ctx.strokeStyle = "#E8B887";
    ctx.lineWidth = 0.5;
    ctx.stroke();
    
    // 右腕
    ctx.beginPath();
    ctx.roundRect(x + w - armW / 2, y + h * 0.1, armW, armH, 4);
    ctx.fill();
    ctx.stroke();

    // 服の装飾（ボタンなど）
    ctx.fillStyle = "#2E7D32";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h * 0.2 + i * h * 0.2, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 後ろ向きの体（改良）
  static drawBodyBack(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    // 胴体（後ろ向き）
    ctx.fillStyle = "#2E7D32";
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    
    ctx.strokeStyle = "#1B5E20";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 肩のライン
    ctx.strokeStyle = "#1B5E20";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.15, y + h * 0.1);
    ctx.lineTo(x + w * 0.85, y + h * 0.1);
    ctx.stroke();
  }

  // 横向きの体（改良）
  static drawBodySide(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, direction: "left" | "right") {
    // 胴体（横向きは幅を狭く）
    const sideW = w * 0.6;
    const sideX = x + (w - sideW) / 2;
    
    ctx.fillStyle = "#4CAF50";
    ctx.beginPath();
    ctx.roundRect(sideX, y, sideW, h, 6);
    ctx.fill();
    
    ctx.strokeStyle = "#2E7D32";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 見える腕（1本のみ）
    const armW = w * 0.12;
    const armH = h * 0.75;
    const armX = direction === "left" ? sideX - armW / 2 : sideX + sideW - armW / 2;
    
    ctx.fillStyle = "#FFCCAA";
    ctx.beginPath();
    ctx.roundRect(armX, y + h * 0.1, armW, armH, 3);
    ctx.fill();
    
    ctx.strokeStyle = "#E8B887";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // 全身の体描画（改良）
  static drawBodyFull(
    ctx: CanvasRenderingContext2D,
    character: Character,
    charX: number,
    charY: number,
    charWidth: number,
    charHeight: number,
    bodyStartY: number
  ) {
    // 上半身
    CharacterRenderer.drawBodyHalf(ctx, character, charX, charY, charWidth, charHeight * 0.5, bodyStartY);
    
    // 下半身（脚）
    const legStartY = bodyStartY + charHeight * 0.3;
    const legWidth = charWidth * 0.5;
    const legHeight = charHeight * 0.45;
    const legX = charX + charWidth / 2 - legWidth / 2;
    
    // ズボン
    ctx.fillStyle = "#1976D2";
    ctx.beginPath();
    ctx.roundRect(legX, legStartY, legWidth, legHeight, 6);
    ctx.fill();
    
    ctx.strokeStyle = "#1565C0";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 靴
    const feetWidth = legWidth * 1.1;
    const feetHeight = charHeight * 0.06;
    const feetX = charX + charWidth / 2 - feetWidth / 2;
    const feetY = legStartY + legHeight;
    
    ctx.fillStyle = "#5D4037";
    ctx.beginPath();
    ctx.roundRect(feetX, feetY, feetWidth, feetHeight, 3);
    ctx.fill();
    
    ctx.strokeStyle = "#3E2723";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // 髪の毛描画（大幅改良）
  static drawHair(
    ctx: CanvasRenderingContext2D,
    character: Character,
    headX: number,
    headY: number,
    headSize: number,
    direction: string
  ) {
    // キャラクタータイプ別の髪色とスタイル
    let hairColor = "#8B4513";
    let hairStyle = "normal";
    
    switch (character.type) {
      case "heroine": 
        hairColor = "#D2691E"; 
        hairStyle = "long";
        break;
      case "rival": 
        hairColor = "#2F4F4F"; 
        hairStyle = "spiky";
        break;
      case "friend":
        hairColor = "#A0522D";
        hairStyle = "curly";
        break;
      default: 
        hairColor = "#8B4513";
        hairStyle = "normal";
    }
    
    ctx.fillStyle = hairColor;

    // 髪型とキャラタイプに応じた描画
    switch (hairStyle) {
      case "long": // ヒロイン：長い髪
        CharacterRenderer.drawLongHair(ctx, headX, headY, headSize, direction);
        break;
      case "spiky": // ライバル：尖った髪
        CharacterRenderer.drawSpikyHair(ctx, headX, headY, headSize, direction);
        break;
      case "curly": // 友人：ウェーブ髪
        CharacterRenderer.drawCurlyHair(ctx, headX, headY, headSize, direction);
        break;
      default: // 主人公：普通の髪
        CharacterRenderer.drawNormalHair(ctx, headX, headY, headSize, direction);
    }
  }

  // 普通の髪（主人公）
  static drawNormalHair(ctx: CanvasRenderingContext2D, headX: number, headY: number, headSize: number, direction: string) {
    const hairHeight = headSize * 0.4;
    const hairWidth = headSize * 0.8;
    
    switch (direction) {
      case "back":
        // 後ろ向き：髪の毛メイン
        ctx.beginPath();
        ctx.roundRect(headX + headSize * 0.1, headY, hairWidth, hairHeight, 8);
        ctx.fill();
        break;
      case "left":
        // 左向き：左側の髪
        ctx.beginPath();
        ctx.roundRect(headX, headY, hairWidth * 0.7, hairHeight, 6);
        ctx.fill();
        break;
      case "right":
        // 右向き：右側の髪
        ctx.beginPath();
        ctx.roundRect(headX + headSize * 0.3, headY, hairWidth * 0.7, hairHeight, 6);
        ctx.fill();
        break;
      default:
        // 正面：前髪とサイド
        ctx.beginPath();
        ctx.roundRect(headX + headSize * 0.1, headY, hairWidth, hairHeight, 6);
        ctx.fill();
    }
  }

  // 長い髪（ヒロイン）
  static drawLongHair(ctx: CanvasRenderingContext2D, headX: number, headY: number, headSize: number, direction: string) {
    const hairHeight = headSize * 0.5;
    const hairWidth = headSize * 0.9;
    
    // 基本の髪
    ctx.beginPath();
    ctx.roundRect(headX + headSize * 0.05, headY, hairWidth, hairHeight, 8);
    ctx.fill();
    
    if (direction !== "back") {
      // サイドの長い髪
      const sideHairW = headSize * 0.15;
      const sideHairH = headSize * 0.8;
      
      // 左サイド
      ctx.beginPath();
      ctx.roundRect(headX - sideHairW / 2, headY + headSize * 0.3, sideHairW, sideHairH, 4);
      ctx.fill();
      
      // 右サイド
      ctx.beginPath();
      ctx.roundRect(headX + headSize - sideHairW / 2, headY + headSize * 0.3, sideHairW, sideHairH, 4);
      ctx.fill();
    }
  }

  // 尖った髪（ライバル）
  static drawSpikyHair(ctx: CanvasRenderingContext2D, headX: number, headY: number, headSize: number, direction: string) {
    if (direction === "back") {
      // 後ろ向きは普通の髪
      CharacterRenderer.drawNormalHair(ctx, headX, headY, headSize, direction);
      return;
    }
    
    // 尖った髪の毛を複数描画
    for (let i = 0; i < 5; i++) {
      const spikeX = headX + headSize * (0.15 + i * 0.15);
      const spikeY = headY;
      const spikeW = headSize * 0.08;
      const spikeH = headSize * 0.3;
      
      ctx.beginPath();
      ctx.moveTo(spikeX, spikeY + spikeH);
      ctx.lineTo(spikeX + spikeW / 2, spikeY);
      ctx.lineTo(spikeX + spikeW, spikeY + spikeH);
      ctx.closePath();
      ctx.fill();
    }
  }

  // ウェーブ髪（友人）
  static drawCurlyHair(ctx: CanvasRenderingContext2D, headX: number, headY: number, headSize: number, direction: string) {
    const hairHeight = headSize * 0.45;
    const hairWidth = headSize * 0.85;
    
    // ベースの髪
    ctx.beginPath();
    ctx.roundRect(headX + headSize * 0.075, headY, hairWidth, hairHeight, 10);
    ctx.fill();
    
    if (direction !== "back") {
      // ウェーブの装飾
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 2;
      
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const waveY = headY + headSize * (0.1 + i * 0.1);
        ctx.arc(headX + headSize * 0.2, waveY, headSize * 0.03, 0, Math.PI * 2);
        ctx.arc(headX + headSize * 0.5, waveY, headSize * 0.03, 0, Math.PI * 2);
        ctx.arc(headX + headSize * 0.8, waveY, headSize * 0.03, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 顔の特徴描画（改良）
  static drawFaceFeatures(
    ctx: CanvasRenderingContext2D,
    character: Character,
    headX: number,
    headY: number,
    headSize: number,
    direction: string
  ) {
    // 後方互換性
    let eyeDirection = character.eyeDirection || "front";
    if ((eyeDirection as string) === "center") eyeDirection = "front";
    
    const expression = character.faceExpression || "normal";
    
    CharacterRenderer.drawEyesHuman(ctx, headX, headY, headSize, direction, eyeDirection, expression);
    CharacterRenderer.drawNoseHuman(ctx, headX, headY, headSize, direction);
    CharacterRenderer.drawMouthHuman(ctx, headX, headY, headSize, direction, expression);
    CharacterRenderer.drawEyebrowsHuman(ctx, headX, headY, headSize, direction, expression);
  }

  // 人間らしい目描画
  static drawEyesHuman(
    ctx: CanvasRenderingContext2D,
    headX: number,
    headY: number,
    headSize: number,
    bodyDirection: string,
    eyeDirection: string,
    expression: string
  ) {
    let leftEyeX, rightEyeX, eyeY;
    let showLeftEye = true, showRightEye = true;
    const eyeWidth = headSize * 0.08;
    const eyeHeight = headSize * 0.06;

    // 体の向きに応じた目の位置
    switch (bodyDirection) {
      case "left":
        leftEyeX = headX + headSize * 0.3;
        rightEyeX = headX + headSize * 0.55;
        eyeY = headY + headSize * 0.35;
        showRightEye = false;
        break;
      case "right":
        leftEyeX = headX + headSize * 0.45;
        rightEyeX = headX + headSize * 0.7;
        eyeY = headY + headSize * 0.35;
        showLeftEye = false;
        break;
      default:
        leftEyeX = headX + headSize * 0.3;
        rightEyeX = headX + headSize * 0.7;
        eyeY = headY + headSize * 0.35;
    }

    // 白目を描画
    if (showLeftEye) {
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.ellipse(leftEyeX, eyeY, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    if (showRightEye) {
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.ellipse(rightEyeX, eyeY, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 黒目・瞳の描画
    const pupilSize = eyeWidth * 0.6;
    let offsetX = 0, offsetY = 0;

    // 視線方向のオフセット
    switch (eyeDirection) {
      case "left": offsetX = -eyeWidth * 0.2; break;
      case "right": offsetX = eyeWidth * 0.2; break;
      case "up": offsetY = -eyeHeight * 0.2; break;
      case "down": offsetY = eyeHeight * 0.2; break;
    }

    // 黒目
    if (showLeftEye) {
      ctx.fillStyle = "#2E2E2E";
      ctx.beginPath();
      ctx.ellipse(leftEyeX + offsetX, eyeY + offsetY, pupilSize, pupilSize, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // ハイライト
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(leftEyeX + offsetX - pupilSize * 0.3, eyeY + offsetY - pupilSize * 0.3, pupilSize * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    if (showRightEye) {
      ctx.fillStyle = "#2E2E2E";
      ctx.beginPath();
      ctx.ellipse(rightEyeX + offsetX, eyeY + offsetY, pupilSize, pupilSize, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // ハイライト
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(rightEyeX + offsetX - pupilSize * 0.3, eyeY + offsetY - pupilSize * 0.3, pupilSize * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // まつげ
    if (showLeftEye) {
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(leftEyeX - eyeWidth, eyeY - eyeHeight);
      ctx.quadraticCurveTo(leftEyeX, eyeY - eyeHeight * 1.2, leftEyeX + eyeWidth, eyeY - eyeHeight);
      ctx.stroke();
    }
    
    if (showRightEye) {
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rightEyeX - eyeWidth, eyeY - eyeHeight);
      ctx.quadraticCurveTo(rightEyeX, eyeY - eyeHeight * 1.2, rightEyeX + eyeWidth, eyeY - eyeHeight);
      ctx.stroke();
    }
  }

  // 眉毛描画
  static drawEyebrowsHuman(
    ctx: CanvasRenderingContext2D,
    headX: number,
    headY: number,
    headSize: number,
    bodyDirection: string,
    expression: string
  ) {
    let leftBrowX, rightBrowX, browY;
    let showLeftBrow = true, showRightBrow = true;

    switch (bodyDirection) {
      case "left":
        leftBrowX = headX + headSize * 0.3;
        rightBrowX = headX + headSize * 0.55;
        browY = headY + headSize * 0.25;
        showRightBrow = false;
        break;
      case "right":
        leftBrowX = headX + headSize * 0.45;
        rightBrowX = headX + headSize * 0.7;
        browY = headY + headSize * 0.25;
        showLeftBrow = false;
        break;
      default:
        leftBrowX = headX + headSize * 0.3;
        rightBrowX = headX + headSize * 0.7;
        browY = headY + headSize * 0.25;
    }

    ctx.strokeStyle = "#5D4037";
    ctx.lineWidth = 2;

    // 表情に応じた眉毛の角度
    let browAngle = 0;
    switch (expression) {
      case "angry": browAngle = -0.2; break;
      case "worried": browAngle = 0.2; break;
      case "surprised": browAngle = 0.1; break;
      default: browAngle = 0;
    }

    if (showLeftBrow) {
      ctx.beginPath();
      ctx.moveTo(leftBrowX - headSize * 0.06, browY + browAngle * headSize * 0.1);
      ctx.lineTo(leftBrowX + headSize * 0.06, browY - browAngle * headSize * 0.1);
      ctx.stroke();
    }

    if (showRightBrow) {
      ctx.beginPath();
      ctx.moveTo(rightBrowX - headSize * 0.06, browY - browAngle * headSize * 0.1);
      ctx.lineTo(rightBrowX + headSize * 0.06, browY + browAngle * headSize * 0.1);
      ctx.stroke();
    }
  }

  // 鼻描画
  static drawNoseHuman(
    ctx: CanvasRenderingContext2D,
    headX: number,
    headY: number,
    headSize: number,
    bodyDirection: string
  ) {
    if (bodyDirection === "left" || bodyDirection === "right" || bodyDirection === "back") {
      return; // 横向き・後ろ向きは鼻を描画しない
    }

    const noseX = headX + headSize * 0.5;
    const noseY = headY + headSize * 0.45;
    
    // 小さな鼻
    ctx.strokeStyle = "#E8B887";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(noseX, noseY);
    ctx.lineTo(noseX - headSize * 0.01, noseY + headSize * 0.02);
    ctx.lineTo(noseX + headSize * 0.01, noseY + headSize * 0.02);
    ctx.stroke();
  }

  // 口描画（表情対応改良版）
  static drawMouthHuman(
    ctx: CanvasRenderingContext2D,
    headX: number,
    headY: number,
    headSize: number,
    bodyDirection: string,
    expression: string
  ) {
    let mouthX = headX + headSize * 0.5;
    const mouthY = headY + headSize * 0.6;
    
    // 向きに応じた口の位置調整
    switch (bodyDirection) {
      case "left": mouthX = headX + headSize * 0.4; break;
      case "right": mouthX = headX + headSize * 0.6; break;
    }

    ctx.strokeStyle = "#D84315";
    ctx.fillStyle = "#FF8A80";
    ctx.lineWidth = 1.5;

    // 表情に応じた口の形（大幅改良）
    switch (expression) {
      case "smile":
        // 笑顔：上向きの弧
        ctx.beginPath();
        ctx.arc(mouthX, mouthY - headSize * 0.01, headSize * 0.04, 0, Math.PI);
        ctx.stroke();
        break;
        
      case "sad":
        // 悲しい：下向きの弧
        ctx.beginPath();
        ctx.arc(mouthX, mouthY + headSize * 0.02, headSize * 0.03, Math.PI, 0);
        ctx.stroke();
        break;
        
      case "angry":
        // 怒り：への字
        ctx.beginPath();
        ctx.moveTo(mouthX - headSize * 0.03, mouthY);
        ctx.lineTo(mouthX, mouthY + headSize * 0.02);
        ctx.lineTo(mouthX + headSize * 0.03, mouthY);
        ctx.stroke();
        break;
        
      case "surprised":
        // 驚き：小さな円
        ctx.beginPath();
        ctx.arc(mouthX, mouthY, headSize * 0.015, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
        
      case "embarrassed":
        // 照れ：小さな笑顔
        ctx.beginPath();
        ctx.arc(mouthX, mouthY, headSize * 0.02, 0, Math.PI);
        ctx.stroke();
        break;
        
      case "worried":
        // 心配：波線
        ctx.beginPath();
        ctx.moveTo(mouthX - headSize * 0.02, mouthY);
        ctx.quadraticCurveTo(mouthX, mouthY + headSize * 0.01, mouthX + headSize * 0.02, mouthY);
        ctx.stroke();
        break;
        
      case "sleepy":
        // 眠い：小さな線
        ctx.beginPath();
        ctx.moveTo(mouthX - headSize * 0.015, mouthY);
        ctx.lineTo(mouthX + headSize * 0.015, mouthY);
        ctx.stroke();
        break;
        
      default: // normal
        // 普通：小さな弧
        ctx.beginPath();
        ctx.arc(mouthX, mouthY, headSize * 0.02, 0, Math.PI);
        ctx.stroke();
    }
  }

  // 既存のメソッド（変更なし）
  static drawCharacterResizeHandles(
    ctx: CanvasRenderingContext2D,
    charX: number,
    charY: number,
    width: number,
    height: number
  ) {
    const handleSize = 16;
    const positions = [
      { x: charX - handleSize/2, y: charY - handleSize/2, type: "corner" },
      { x: charX + width/2 - handleSize/2, y: charY - handleSize/2, type: "edge" },
      { x: charX + width - handleSize/2, y: charY - handleSize/2, type: "corner" },
      { x: charX + width - handleSize/2, y: charY + height/2 - handleSize/2, type: "edge" },
      { x: charX + width - handleSize/2, y: charY + height - handleSize/2, type: "corner" },
      { x: charX + width/2 - handleSize/2, y: charY + height - handleSize/2, type: "edge" },
      { x: charX - handleSize/2, y: charY + height - handleSize/2, type: "corner" },
      { x: charX - handleSize/2, y: charY + height/2 - handleSize/2, type: "edge" },
    ];

    positions.forEach((pos) => {
      if (pos.type === "corner") {
        ctx.fillStyle = "#ff6600";
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.fillRect(pos.x, pos.y, handleSize, handleSize);
        ctx.strokeRect(pos.x, pos.y, handleSize, handleSize);
      } else {
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
        charWidth = CharacterRenderer.getCharacterWidth(character);
        charHeight = CharacterRenderer.getCharacterHeight(character);
        charX = character.x - charWidth / 2;
        charY = character.y - charHeight / 2;
      } else {
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

  static isCharacterResizeHandleClicked(
    mouseX: number,
    mouseY: number,
    character: Character,
    panel: Panel
  ): { isClicked: boolean; direction: string } {
    let charX, charY, charWidth, charHeight;
    
    if (character.isGlobalPosition) {
      charWidth = CharacterRenderer.getCharacterWidth(character);
      charHeight = CharacterRenderer.getCharacterHeight(character);
      charX = character.x - charWidth / 2;
      charY = character.y - charHeight / 2;
    } else {
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
        return { isClicked: true, direction: pos.type };
      }
    }
    
    return { isClicked: false, direction: "" };
  }

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