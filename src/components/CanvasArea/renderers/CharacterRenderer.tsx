// src/components/CanvasArea/renderers/CharacterRenderer.tsx (人間らしい表現・大幅改良版)
import { Character, Panel } from "../../../types";

export class CharacterRenderer {
  // キャラクター群描画（🔧 修正版）
  static drawCharacters(
    ctx: CanvasRenderingContext2D,
    characters: Character[],
    panels: Panel[],
    selectedCharacter: Character | null
  ) {
    characters.forEach((character) => {
      // 🔧 パネルID照合を厳格にチェック
      const panel = panels.find((p) => {
        // 数値と文字列の両方に対応
        return String(p.id) === String(character.panelId);
      });
      
      // 🔧 デバッグログ追加
      if (!panel) {
        console.warn(`⚠️ パネルが見つかりません - キャラクター: ${character.name}, パネルID: ${character.panelId}`);
        console.log("利用可能なパネル:", panels.map(p => ({ id: p.id, type: typeof p.id })));
        console.log("キャラクターのパネルID:", character.panelId, typeof character.panelId);
        
        // 🆕 緊急回避：最初のパネルを使用
        const fallbackPanel = panels[0];
        if (fallbackPanel) {
          console.log(`🚑 緊急回避: パネル${fallbackPanel.id}を使用`);
          CharacterRenderer.drawCharacter(ctx, character, fallbackPanel, selectedCharacter);
        }
        return;
      }
      
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
    const baseWidth = 50;
    let typeMultiplier = 1.0;
    
    switch (character.viewType) {
      case "face": typeMultiplier = 0.8; break;
      case "halfBody": typeMultiplier = 1.0; break;
      case "fullBody": typeMultiplier = 1.1; break;
      default: typeMultiplier = 1.0;
    }
    
    return baseWidth * character.scale * typeMultiplier;
  }

  static getCharacterHeight(character: Character): number {
    const baseHeight = 60;
    let typeMultiplier = 1.0;
    
    switch (character.viewType) {
      case "face": typeMultiplier = 0.8; break;
      case "halfBody": typeMultiplier = 1.2; break;
      case "fullBody": typeMultiplier = 1.8; break;
      default: typeMultiplier = 1.0;
    }
    
    return baseHeight * character.scale * typeMultiplier;
  }

  // キャラクター本体描画（表示タイプ別）
  static drawCharacterBody(
    ctx: CanvasRenderingContext2D,
    character: Character,
    charX: number,
    charY: number,
    charWidth: number,
    charHeight: number
  ) {
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

  // 上半身描画
  static drawHalfBody(
    ctx: CanvasRenderingContext2D,
    character: Character,
    charX: number,
    charY: number,
    charWidth: number,
    charHeight: number
  ) {
    const headSize = charWidth * 0.45;
    const headX = charX + charWidth / 2 - headSize / 2;
    const headY = charY + charHeight * 0.05;
    
    // 体を先に描画
    CharacterRenderer.drawBodyHalf(ctx, character, charX, charY, charWidth, charHeight, headY + headSize);
    
    // 頭部は最後に描画（髪が体に重なるように）
    CharacterRenderer.drawHead(ctx, character, headX, headY, headSize);
  }

  // 全身描画
  static drawFullBody(
    ctx: CanvasRenderingContext2D,
    character: Character,
    charX: number,
    charY: number,
    charWidth: number,
    charHeight: number
  ) {
    const headSize = charWidth * 0.35;
    const headX = charX + charWidth / 2 - headSize / 2;
    const headY = charY + charHeight * 0.02;
    
    // 体を先に描画
    CharacterRenderer.drawBodyFull(ctx, character, charX, charY, charWidth, charHeight, headY + headSize);
    
    // 頭部は最後に描画
    CharacterRenderer.drawHead(ctx, character, headX, headY, headSize);
  }

  // ===== 頭部描画（完全分離版） =====
  static drawHead(
    ctx: CanvasRenderingContext2D,
    character: Character,
    headX: number,
    headY: number,
    headSize: number
  ) {
    const direction = character.bodyDirection || character.faceAngle || "front";
    
    // 1. 頭の基本形状
    CharacterRenderer.drawHeadShape(ctx, headX, headY, headSize);
    
    // 2. 髪の毛（顔の特徴より先に）
    CharacterRenderer.drawHair(ctx, character, headX, headY, headSize, direction);

    // 後ろ向きの場合は顔の特徴を描画しない
    if (direction === "back" || direction === "leftBack" || direction === "rightBack") {
      return;
    }

    // 3. 顔の特徴（目・鼻・口・眉毛）
    CharacterRenderer.drawFaceFeatures(ctx, character, headX, headY, headSize, direction);
  }

  // 頭の基本形状
  static drawHeadShape(
    ctx: CanvasRenderingContext2D,
    headX: number,
    headY: number,
    headSize: number
  ) {
    // 肌色の頭（自然な楕円）
    ctx.fillStyle = "#FFCCAA";
    ctx.beginPath();
    
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
  }

  // ===== 髪の毛描画（完全分離・キャラクター別） =====
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
      case "long":
        CharacterRenderer.drawLongHair(ctx, headX, headY, headSize, direction);
        break;
      case "spiky":
        CharacterRenderer.drawSpikyHair(ctx, headX, headY, headSize, direction);
        break;
      case "curly":
        CharacterRenderer.drawCurlyHair(ctx, headX, headY, headSize, direction);
        break;
      default:
        CharacterRenderer.drawNormalHair(ctx, headX, headY, headSize, direction);
    }
  }

  // 普通の髪（主人公）
  static drawNormalHair(ctx: CanvasRenderingContext2D, headX: number, headY: number, headSize: number, direction: string) {
    const hairHeight = headSize * 0.4;
    const hairWidth = headSize * 0.8;
    
    switch (direction) {
      case "back":
      case "leftBack":
      case "rightBack":
        // 後ろ向き：髪の毛全体
        ctx.beginPath();
        ctx.roundRect(headX + headSize * 0.1, headY, hairWidth, headSize * 0.8, 8);
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
    
    if (direction !== "back" && direction !== "leftBack" && direction !== "rightBack") {
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
    if (direction === "back" || direction === "leftBack" || direction === "rightBack") {
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
    
    if (direction !== "back" && direction !== "leftBack" && direction !== "rightBack") {
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

  // ===== 顔の特徴描画（完全分離版） =====
  static drawFaceFeatures(
    ctx: CanvasRenderingContext2D,
    character: Character,
    headX: number,
    headY: number,
    headSize: number,
    direction: string
  ) {
    const eyeDirection = character.eyeDirection || "front";
    const expression = character.faceExpression || "normal";
    
    // 眉毛 → 目 → 鼻 → 口の順番で描画
    CharacterRenderer.drawEyebrows(ctx, headX, headY, headSize, direction, expression);
    CharacterRenderer.drawEyes(ctx, headX, headY, headSize, direction, eyeDirection, expression);
    CharacterRenderer.drawNose(ctx, headX, headY, headSize, direction);
    CharacterRenderer.drawMouth(ctx, headX, headY, headSize, direction, expression);
  }

  // ===== 眉毛描画（表情対応） =====
  static drawEyebrows(
    ctx: CanvasRenderingContext2D,
    headX: number,
    headY: number,
    headSize: number,
    bodyDirection: string,
    expression: string
  ) {
    let leftBrowX, rightBrowX, browY;
    let showLeftBrow = true, showRightBrow = true;

    // 向きに応じた位置設定
    switch (bodyDirection) {
      case "left":
      case "leftFront":
        leftBrowX = headX + headSize * 0.3;
        rightBrowX = headX + headSize * 0.55;
        browY = headY + headSize * 0.25;
        showRightBrow = false;
        break;
      case "right":
      case "rightFront":
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

    // 表情に応じた眉毛の角度と形
    let browAngle = 0;
    let browThickness = 2;
    
    switch (expression) {
      case "angry": 
        browAngle = -0.3; 
        browThickness = 3;
        break;
      case "worried": 
        browAngle = 0.2; 
        break;
      case "surprised": 
        browAngle = 0.1; 
        browY -= headSize * 0.02;
        break;
      case "sad":
        browAngle = 0.15;
        break;
      default: 
        browAngle = 0;
    }

    ctx.lineWidth = browThickness;

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

  // ===== 目描画（大幅改良・表情対応） =====
  static drawEyes(
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
    let eyeWidth = headSize * 0.08;
    let eyeHeight = headSize * 0.06;

    // 体の向きに応じた目の位置
    switch (bodyDirection) {
      case "left":
      case "leftFront":
        leftEyeX = headX + headSize * 0.3;
        rightEyeX = headX + headSize * 0.55;
        eyeY = headY + headSize * 0.35;
        showRightEye = false;
        break;
      case "right":
      case "rightFront":
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

    // 表情に応じた目の形状調整
    switch (expression) {
      case "surprised":
        eyeWidth *= 1.3;
        eyeHeight *= 1.4;
        break;
      case "sleepy":
        eyeHeight *= 0.3;
        eyeY += headSize * 0.02;
        break;
      case "angry":
        eyeHeight *= 0.8;
        eyeY += headSize * 0.01;
        break;
      case "smile":
      case "embarrassed":
        eyeHeight *= 0.7;
        eyeY += headSize * 0.01;
        break;
    }

    // 白目を描画
    if (showLeftEye) {
      CharacterRenderer.drawSingleEye(ctx, leftEyeX, eyeY, eyeWidth, eyeHeight, eyeDirection, expression);
    }
    
    if (showRightEye) {
      CharacterRenderer.drawSingleEye(ctx, rightEyeX, eyeY, eyeWidth, eyeHeight, eyeDirection, expression);
    }
  }

  // 単一の目を描画
  static drawSingleEye(
    ctx: CanvasRenderingContext2D,
    eyeX: number,
    eyeY: number,
    eyeWidth: number,
    eyeHeight: number,
    eyeDirection: string,
    expression: string
  ) {
    // 眠い場合は線のみ
    if (expression === "sleepy") {
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(eyeX - eyeWidth, eyeY);
      ctx.lineTo(eyeX + eyeWidth, eyeY);
      ctx.stroke();
      return;
    }

    // 白目
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 黒目・瞳の描画
    const pupilSize = eyeWidth * 0.6;
    let offsetX = 0, offsetY = 0;

    // 視線方向のオフセット
    switch (eyeDirection) {
      case "left": offsetX = -eyeWidth * 0.3; break;
      case "right": offsetX = eyeWidth * 0.3; break;
      case "up": offsetY = -eyeHeight * 0.3; break;
      case "down": offsetY = eyeHeight * 0.3; break;
    }

    // 表情に応じた瞳の大きさ
    let finalPupilSize = pupilSize;
    switch (expression) {
      case "surprised":
        finalPupilSize *= 0.8;
        break;
      case "angry":
        finalPupilSize *= 1.1;
        break;
    }

    // 黒目
    ctx.fillStyle = "#2E2E2E";
    ctx.beginPath();
    ctx.ellipse(eyeX + offsetX, eyeY + offsetY, finalPupilSize, finalPupilSize, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // ハイライト
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(
      eyeX + offsetX - finalPupilSize * 0.3, 
      eyeY + offsetY - finalPupilSize * 0.3, 
      finalPupilSize * 0.3, 
      0, Math.PI * 2
    );
    ctx.fill();

    // まつげ（表情に応じて）
    if (expression !== "angry") {
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(eyeX - eyeWidth, eyeY - eyeHeight);
      ctx.quadraticCurveTo(eyeX, eyeY - eyeHeight * 1.2, eyeX + eyeWidth, eyeY - eyeHeight);
      ctx.stroke();
    }
  }

  // ===== 鼻描画 =====
  static drawNose(
    ctx: CanvasRenderingContext2D,
    headX: number,
    headY: number,
    headSize: number,
    bodyDirection: string
  ) {
    if (bodyDirection === "left" || bodyDirection === "right" || 
        bodyDirection === "back" || bodyDirection === "leftBack" || bodyDirection === "rightBack") {
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

  // ===== 口描画（表情完全対応） =====
  static drawMouth(
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
      case "left": 
      case "leftFront":
        mouthX = headX + headSize * 0.4; 
        break;
      case "right": 
      case "rightFront":
        mouthX = headX + headSize * 0.6; 
        break;
    }

    ctx.strokeStyle = "#D84315";
    ctx.fillStyle = "#FF8A80";
    ctx.lineWidth = 1.5;

    // 表情に応じた口の形（大幅改良）
    switch (expression) {
      case "smile":
        // 笑顔：大きな上向きの弧
        ctx.strokeStyle = "#C62828";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mouthX, mouthY - headSize * 0.01, headSize * 0.05, 0, Math.PI);
        ctx.stroke();
        break;
        
      case "sad":
        // 悲しい：下向きの弧
        ctx.strokeStyle = "#5D4037";
        ctx.beginPath();
        ctx.arc(mouthX, mouthY + headSize * 0.02, headSize * 0.03, Math.PI, 0);
        ctx.stroke();
        break;
        
      case "angry":
        // 怒り：きつめのへの字
        ctx.strokeStyle = "#B71C1C";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mouthX - headSize * 0.04, mouthY);
        ctx.lineTo(mouthX, mouthY + headSize * 0.02);
        ctx.lineTo(mouthX + headSize * 0.04, mouthY);
        ctx.stroke();
        break;
        
      case "surprised":
        // 驚き：大きな楕円
        ctx.fillStyle = "#E91E63";
        ctx.beginPath();
        ctx.ellipse(mouthX, mouthY, headSize * 0.02, headSize * 0.03, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#AD1457";
        ctx.stroke();
        break;
        
      case "embarrassed":
        // 照れ：小さな笑顔（赤面効果付き）
        // 頬を赤く
        ctx.fillStyle = "rgba(255, 182, 193, 0.7)";
        ctx.beginPath();
        ctx.arc(mouthX - headSize * 0.15, mouthY - headSize * 0.05, headSize * 0.04, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(mouthX + headSize * 0.15, mouthY - headSize * 0.05, headSize * 0.04, 0, Math.PI * 2);
        ctx.fill();
        
        // 小さな笑顔
        ctx.strokeStyle = "#D84315";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouthX, mouthY, headSize * 0.02, 0, Math.PI);
        ctx.stroke();
        break;
        
      case "worried":
        // 心配：波線
        ctx.strokeStyle = "#5D4037";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(mouthX - headSize * 0.025, mouthY);
        ctx.quadraticCurveTo(mouthX - headSize * 0.01, mouthY + headSize * 0.01, mouthX, mouthY);
        ctx.quadraticCurveTo(mouthX + headSize * 0.01, mouthY - headSize * 0.01, mouthX + headSize * 0.025, mouthY);
        ctx.stroke();
        break;
        
      case "sleepy":
        // 眠い：小さな線
        ctx.strokeStyle = "#8D6E63";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mouthX - headSize * 0.015, mouthY);
        ctx.lineTo(mouthX + headSize * 0.015, mouthY);
        ctx.stroke();
        break;
        
      default: // normal
        // 普通：穏やかな弧
        ctx.strokeStyle = "#D84315";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouthX, mouthY, headSize * 0.02, 0, Math.PI);
        ctx.stroke();
    }
  }

  // ===== 体描画（ポーズ対応改良版） =====
  static drawBodyHalf(
    ctx: CanvasRenderingContext2D,
    character: Character,
    charX: number,
    charY: number,
    charWidth: number,
    charHeight: number,
    bodyStartY: number
  ) {
    const pose = character.bodyPose || "standing";
    const direction = character.bodyDirection || character.faceAngle || "front";
    const bodyWidth = charWidth * 0.7;
    const bodyHeight = charHeight * 0.55;
    const bodyX = charX + charWidth / 2 - bodyWidth / 2;
    const bodyY = bodyStartY;

    // ポーズに応じた体の描画
    switch (pose) {
      case "sitting":
        CharacterRenderer.drawSittingBody(ctx, bodyX, bodyY, bodyWidth, bodyHeight, direction);
        break;
      case "walking":
        CharacterRenderer.drawWalkingBody(ctx, bodyX, bodyY, bodyWidth, bodyHeight, direction);
        break;
      case "pointing":
        CharacterRenderer.drawPointingBody(ctx, bodyX, bodyY, bodyWidth, bodyHeight, direction);
        break;
      case "waving":
        CharacterRenderer.drawWavingBody(ctx, bodyX, bodyY, bodyWidth, bodyHeight, direction);
        break;
      case "arms_crossed":
        CharacterRenderer.drawArmsCrossedBody(ctx, bodyX, bodyY, bodyWidth, bodyHeight, direction);
        break;
      case "thinking":
        CharacterRenderer.drawThinkingBody(ctx, bodyX, bodyY, bodyWidth, bodyHeight, direction);
        break;
      default: // standing
        CharacterRenderer.drawStandingBody(ctx, bodyX, bodyY, bodyWidth, bodyHeight, direction);
    }
  }

  // 立っているポーズ
  static drawStandingBody(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    direction: string
  ) {
    switch (direction) {
      case "back":
      case "leftBack":
      case "rightBack":
        CharacterRenderer.drawBodyBack(ctx, x, y, w, h);
        break;
      case "left":
      case "leftFront":
        CharacterRenderer.drawBodySide(ctx, x, y, w, h, "left");
        break;
      case "right":
      case "rightFront":
        CharacterRenderer.drawBodySide(ctx, x, y, w, h, "right");
        break;
      default:
        CharacterRenderer.drawBodyFront(ctx, x, y, w, h);
    }
  }

  // 座っているポーズ
  static drawSittingBody(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    direction: string
  ) {
    // 胴体（少し短く）
    const torsoHeight = h * 0.6;
    ctx.fillStyle = "#4CAF50";
    ctx.beginPath();
    ctx.roundRect(x, y, w, torsoHeight, 8);
    ctx.fill();
    
    ctx.strokeStyle = "#2E7D32";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 座った脚
    const legY = y + torsoHeight - h * 0.1;
    ctx.fillStyle = "#1976D2";
    ctx.beginPath();
    ctx.roundRect(x + w * 0.1, legY, w * 0.8, h * 0.3, 4);
    ctx.fill();
    
    ctx.strokeStyle = "#1565C0";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 腕
    CharacterRenderer.drawArms(ctx, x, y, w, h, "sitting", direction);
  }

  // 歩いているポーズ
  static drawWalkingBody(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    direction: string
  ) {
    // 胴体（少し傾ける）
    ctx.save();
    ctx.translate(x + w/2, y + h/2);
    ctx.rotate(direction === "right" ? 0.05 : -0.05);
    
    ctx.fillStyle = "#4CAF50";
    ctx.beginPath();
    ctx.roundRect(-w/2, -h/2, w, h * 0.7, 8);
    ctx.fill();
    
    ctx.strokeStyle = "#2E7D32";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();

    // 歩行中の腕
    CharacterRenderer.drawArms(ctx, x, y, w, h, "walking", direction);
  }

  // 指さしポーズ
  static drawPointingBody(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    direction: string
  ) {
    // 胴体
    CharacterRenderer.drawBodyFront(ctx, x, y, w, h);
    
    // 指さしの腕（右腕を前に）
    const armW = w * 0.12;
    const armH = h * 0.6;
    
    ctx.fillStyle = "#FFCCAA";
    ctx.beginPath();
    ctx.roundRect(x + w, y + h * 0.2, armW * 2, armH, 4);
    ctx.fill();
    
    ctx.strokeStyle = "#E8B887";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 指
    ctx.fillStyle = "#FFCCAA";
    ctx.beginPath();
    ctx.roundRect(x + w + armW * 2, y + h * 0.3, armW * 0.5, armH * 0.3, 2);
    ctx.fill();
    ctx.stroke();
  }

  // 手を振るポーズ
  static drawWavingBody(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    direction: string
  ) {
    // 胴体
    CharacterRenderer.drawBodyFront(ctx, x, y, w, h);
    
    // 振っている腕（右腕を上に）
    const armW = w * 0.12;
    const armH = h * 0.5;
    
    ctx.save();
    ctx.translate(x + w + armW/2, y + h * 0.1);
    ctx.rotate(-0.3);
    
    ctx.fillStyle = "#FFCCAA";
    ctx.beginPath();
    ctx.roundRect(-armW/2, 0, armW, armH, 4);
    ctx.fill();
    
    ctx.strokeStyle = "#E8B887";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();

    // 左腕（通常）
    ctx.fillStyle = "#FFCCAA";
    ctx.beginPath();
    ctx.roundRect(x - armW/2, y + h * 0.1, armW, armH, 4);
    ctx.fill();
    ctx.stroke();
  }

  // 腕組みポーズ
  static drawArmsCrossedBody(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    direction: string
  ) {
    // 胴体
    CharacterRenderer.drawBodyFront(ctx, x, y, w, h);
    
    // 交差した腕
    const armW = w * 0.15;
    const armH = h * 0.4;
    
    // 右腕（左に交差）
    ctx.save();
    ctx.translate(x + w * 0.7, y + h * 0.3);
    ctx.rotate(-0.3);
    
    ctx.fillStyle = "#FFCCAA";
    ctx.beginPath();
    ctx.roundRect(-armW/2, 0, armW, armH, 4);
    ctx.fill();
    
    ctx.strokeStyle = "#E8B887";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();

    // 左腕（右に交差）
    ctx.save();
    ctx.translate(x + w * 0.3, y + h * 0.3);
    ctx.rotate(0.3);
    
    ctx.fillStyle = "#FFCCAA";
    ctx.beginPath();
    ctx.roundRect(-armW/2, 0, armW, armH, 4);
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }

  // 考えているポーズ
  static drawThinkingBody(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    direction: string
  ) {
    // 胴体
    CharacterRenderer.drawBodyFront(ctx, x, y, w, h);
    
    // 右手を顎に
    const armW = w * 0.12;
    const armH = h * 0.3;
    
    ctx.fillStyle = "#FFCCAA";
    ctx.beginPath();
    ctx.roundRect(x + w * 0.8, y + h * 0.1, armW, armH, 4);
    ctx.fill();
    
    ctx.strokeStyle = "#E8B887";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 左腕（普通）
    ctx.beginPath();
    ctx.roundRect(x - armW/2, y + h * 0.1, armW, h * 0.5, 4);
    ctx.fill();
    ctx.stroke();
  }

  // 腕の描画（ポーズ別）
  static drawArms(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    pose: string,
    direction: string
  ) {
    const armW = w * 0.18;
    const armH = h * 0.75;
    
    ctx.fillStyle = "#FFCCAA";
    ctx.strokeStyle = "#E8B887";
    ctx.lineWidth = 0.5;

    switch (pose) {
      case "walking":
        // 歩行中：腕を前後に
        // 左腕（前）
        ctx.save();
        ctx.translate(x, y + h * 0.1);
        ctx.rotate(0.2);
        ctx.beginPath();
        ctx.roundRect(-armW/2, 0, armW, armH, 4);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        
        // 右腕（後）
        ctx.save();
        ctx.translate(x + w, y + h * 0.1);
        ctx.rotate(-0.2);
        ctx.beginPath();
        ctx.roundRect(-armW/2, 0, armW, armH, 4);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        break;
        
      default:
        // 通常の腕
        ctx.beginPath();
        ctx.roundRect(x - armW / 2, y + h * 0.1, armW, armH, 4);
        ctx.fill();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.roundRect(x + w - armW / 2, y + h * 0.1, armW, armH, 4);
        ctx.fill();
        ctx.stroke();
    }
  }

  // 正面向きの体（改良）
  static drawBodyFront(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    // 胴体
    ctx.fillStyle = "#4CAF50";
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    
    ctx.strokeStyle = "#2E7D32";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 服の装飾（ボタン）
    ctx.fillStyle = "#2E7D32";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h * 0.2 + i * h * 0.2, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 両肩・腕
    CharacterRenderer.drawArms(ctx, x, y, w, h, "standing", "front");
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
    
    // ポーズに応じた脚の描画
    const pose = character.bodyPose || "standing";
    switch (pose) {
      case "walking":
        CharacterRenderer.drawWalkingLegs(ctx, legX, legStartY, legWidth, legHeight);
        break;
      case "sitting":
        // 座っている場合は脚を描画しない
        break;
      default:
        CharacterRenderer.drawStandingLegs(ctx, legX, legStartY, legWidth, legHeight);
    }
  }

  // 立っている脚
  static drawStandingLegs(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    // ズボン
    ctx.fillStyle = "#1976D2";
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();
    
    ctx.strokeStyle = "#1565C0";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 靴
    const feetWidth = w * 1.1;
    const feetHeight = h * 0.1;
    const feetX = x - (feetWidth - w) / 2;
    const feetY = y + h;
    
    ctx.fillStyle = "#5D4037";
    ctx.beginPath();
    ctx.roundRect(feetX, feetY, feetWidth, feetHeight, 3);
    ctx.fill();
    
    ctx.strokeStyle = "#3E2723";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // 歩いている脚
  static drawWalkingLegs(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    const legW = w * 0.4;
    
    // 左脚（前）
    ctx.save();
    ctx.translate(x + w * 0.2, y);
    ctx.rotate(0.1);
    
    ctx.fillStyle = "#1976D2";
    ctx.beginPath();
    ctx.roundRect(0, 0, legW, h, 4);
    ctx.fill();
    
    ctx.strokeStyle = "#1565C0";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();

    // 右脚（後）
    ctx.save();
    ctx.translate(x + w * 0.6, y);
    ctx.rotate(-0.1);
    
    ctx.fillStyle = "#1976D2";
    ctx.beginPath();
    ctx.roundRect(0, 0, legW, h, 4);
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();

    // 靴（2つ）
    CharacterRenderer.drawStandingLegs(ctx, x, y, w, h);
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

  // CharacterRenderer.tsx の isCharacterResizeHandleClicked 関数を修正

  static isCharacterResizeHandleClicked(
    mouseX: number,
    mouseY: number,
    character: Character,
    panel: Panel
  ): { isClicked: boolean; direction: string } {
    let charX, charY, charWidth, charHeight;
    
    // 🔧 座標計算を修正
    if (character.isGlobalPosition) {
      // グローバル座標の場合
      charWidth = CharacterRenderer.getCharacterWidth(character);
      charHeight = CharacterRenderer.getCharacterHeight(character);
      charX = character.x - charWidth / 2;
      charY = character.y - charHeight / 2;
    } else {
      // 相対座標の場合
      charWidth = 60 * character.scale;
      charHeight = 40 * character.scale;
      charX = panel.x + panel.width * character.x - charWidth / 2;
      charY = panel.y + panel.height * character.y - charHeight / 2;
    }

    // 🔧 ハンドルサイズを大きく
    const handleSize = 20; // 12 → 20に変更
    const tolerance = 12;  // 8 → 12に変更

    // 🔧 デバッグログ追加
    console.log("🔍 キャラクターリサイズ判定詳細:", {
      mouseX, mouseY,
      charX, charY, charWidth, charHeight,
      isGlobalPosition: character.isGlobalPosition,
      characterPos: { x: character.x, y: character.y },
      scale: character.scale
    });

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

    // 🔧 ハンドル位置もログ出力
    console.log("🔍 ハンドル位置:", positions);

    for (const pos of positions) {
      const inRangeX = mouseX >= pos.x - tolerance && mouseX <= pos.x + handleSize + tolerance;
      const inRangeY = mouseY >= pos.y - tolerance && mouseY <= pos.y + handleSize + tolerance;
      
      // 🔧 詳細な判定ログ
      console.log(`🔍 ハンドル ${pos.type} 判定:`, {
        mouseX, mouseY,
        handleX: pos.x, handleY: pos.y,
        inRangeX, inRangeY,
        rangeX: `${pos.x - tolerance} ~ ${pos.x + handleSize + tolerance}`,
        rangeY: `${pos.y - tolerance} ~ ${pos.y + handleSize + tolerance}`
      });
      
      if (inRangeX && inRangeY) {
        console.log(`🎯 キャラクターリサイズハンドル ${pos.type} クリック検出!`);
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

