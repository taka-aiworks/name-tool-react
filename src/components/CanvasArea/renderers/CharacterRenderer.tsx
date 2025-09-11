// src/components/CanvasArea/renderers/CharacterRenderer.tsx (リサイズ機能完全対応版)
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
      const panel = panels.find((p) => {
        return String(p.id) === String(character.panelId);
      });
      
      if (!panel) {
        console.warn(`⚠️ パネルが見つかりません - キャラクター: ${character.name}, パネルID: ${character.panelId}`);
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
      
      // 🆕 8方向リサイズハンドル描画
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

  // 🆕 幅・高さ計算（width/height対応改良版）
  static getCharacterWidth(character: Character): number {
    // width指定がある場合は優先
    if (character.width !== undefined && character.width > 0) {
      return character.width;
    }
    
    // 従来のscale計算をフォールバック
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
    // height指定がある場合は優先
    if (character.height !== undefined && character.height > 0) {
      return character.height;
    }
    
    // 従来のscale計算をフォールバック
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

  // 🆕 8方向リサイズハンドル描画（吹き出しと同様のスタイル）
  static drawCharacterResizeHandles(
    ctx: CanvasRenderingContext2D,
    charX: number,
    charY: number,
    width: number,
    height: number
  ) {
    const handleSize = 16; // 大きめのハンドル
    const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";
    
    ctx.fillStyle = "#ff6600"; // オレンジ色
    ctx.strokeStyle = isDarkMode ? "#fff" : "#000";
    ctx.lineWidth = 2;

    // 🔧 8方向のハンドル位置（吹き出しと同じ計算方式）
    const handles = [
      { x: charX - handleSize/2, y: charY - handleSize/2, dir: "nw" }, // 左上
      { x: charX + width/2 - handleSize/2, y: charY - handleSize/2, dir: "n" }, // 上
      { x: charX + width - handleSize/2, y: charY - handleSize/2, dir: "ne" }, // 右上
      { x: charX + width - handleSize/2, y: charY + height/2 - handleSize/2, dir: "e" }, // 右
      { x: charX + width - handleSize/2, y: charY + height - handleSize/2, dir: "se" }, // 右下
      { x: charX + width/2 - handleSize/2, y: charY + height - handleSize/2, dir: "s" }, // 下
      { x: charX - handleSize/2, y: charY + height - handleSize/2, dir: "sw" }, // 左下
      { x: charX - handleSize/2, y: charY + height/2 - handleSize/2, dir: "w" } // 左
    ];

    handles.forEach(handle => {
      // 角のハンドルは四角、辺のハンドルは丸で区別（吹き出しと同様）
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

  // 🆕 8方向リサイズハンドル判定（吹き出しと同様のロジック）
  static isCharacterResizeHandleClicked(
    mouseX: number,
    mouseY: number,
    character: Character,
    panel: Panel
  ): { isClicked: boolean; direction: string } {
    let charX, charY, charWidth, charHeight;
    
    // 🔧 座標計算
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

    const handleSize = 16; // 描画と同じサイズ
    const tolerance = 10; // クリック判定を広く

    console.log("🔍 キャラクターリサイズハンドル判定開始:", {
      mouseX, mouseY,
      charPos: { x: charX, y: charY },
      charSize: { width: charWidth, height: charHeight },
      handleSize, tolerance
    });

    // 🔧 8方向のハンドル位置（描画と完全一致）
    const handles = [
      { x: charX - handleSize/2, y: charY - handleSize/2, dir: "nw" },
      { x: charX + charWidth/2 - handleSize/2, y: charY - handleSize/2, dir: "n" },
      { x: charX + charWidth - handleSize/2, y: charY - handleSize/2, dir: "ne" },
      { x: charX + charWidth - handleSize/2, y: charY + charHeight/2 - handleSize/2, dir: "e" },
      { x: charX + charWidth - handleSize/2, y: charY + charHeight - handleSize/2, dir: "se" },
      { x: charX + charWidth/2 - handleSize/2, y: charY + charHeight - handleSize/2, dir: "s" },
      { x: charX - handleSize/2, y: charY + charHeight - handleSize/2, dir: "sw" },
      { x: charX - handleSize/2, y: charY + charHeight/2 - handleSize/2, dir: "w" }
    ];

    for (const handle of handles) {
      const inRangeX = mouseX >= handle.x - tolerance && mouseX <= handle.x + handleSize + tolerance;
      const inRangeY = mouseY >= handle.y - tolerance && mouseY <= handle.y + handleSize + tolerance;
      
      console.log(`🔍 ハンドル ${handle.dir} 判定:`, {
        handlePos: { x: handle.x, y: handle.y },
        checkRange: {
          x: `${handle.x - tolerance} ~ ${handle.x + handleSize + tolerance}`,
          y: `${handle.y - tolerance} ~ ${handle.y + handleSize + tolerance}`
        },
        inRangeX, inRangeY
      });
      
      if (inRangeX && inRangeY) {
        console.log(`🎯 キャラクターリサイズハンドル ${handle.dir} クリック検出!`);
        return { isClicked: true, direction: handle.dir };
      }
    }

    console.log("❌ リサイズハンドルクリック判定: 該当なし");
    return { isClicked: false, direction: "" };
  }

  // CharacterRenderer.tsx の resizeCharacter メソッド修正版
  // 🔧 座標系を吹き出しと統一（中心座標を維持）

  static resizeCharacter(
    character: Character,
    direction: string,
    deltaX: number,
    deltaY: number,
    originalBounds: { x: number; y: number; width: number; height: number }
  ): Character {
    let newWidth = originalBounds.width;
    let newHeight = originalBounds.height;

    const minWidth = 30;  // キャラクターの最小幅
    const minHeight = 40; // キャラクターの最小高さ

    console.log("🔧 キャラクターリサイズ実行:", {
      direction,
      deltaX, deltaY,
      currentSize: { width: originalBounds.width, height: originalBounds.height },
      currentPos: { x: character.x, y: character.y },
      originalBounds
    });

    // 🔧 各方向の処理（座標は変更せず、サイズのみ変更）
    switch (direction) {
      case "nw": // 左上
        newWidth = Math.max(minWidth, originalBounds.width - deltaX);
        newHeight = Math.max(minHeight, originalBounds.height - deltaY);
        break;
        
      case "n": // 上
        newHeight = Math.max(minHeight, originalBounds.height - deltaY);
        break;
        
      case "ne": // 右上
        newWidth = Math.max(minWidth, originalBounds.width + deltaX);
        newHeight = Math.max(minHeight, originalBounds.height - deltaY);
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
        break;
        
      case "w": // 左
        newWidth = Math.max(minWidth, originalBounds.width - deltaX);
        break;
        
      default:
        console.warn("⚠️ 不明なリサイズ方向:", direction);
        return character;
    }

    // 🆕 座標は変更せず、サイズのみ変更
    const result = {
      ...character,
      // x, y はそのまま（中心座標を維持）
      width: newWidth,   // 🆕 width プロパティを設定
      height: newHeight, // 🆕 height プロパティを設定
    };

    console.log("✅ キャラクターリサイズ結果:", {
      pos: { x: character.x, y: character.y }, // 座標は変更なし
      newSize: { width: newWidth, height: newHeight }
    });

    return result;
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

    // 体の基本描画
    ctx.fillStyle = "#4CAF50";
    ctx.beginPath();
    ctx.roundRect(bodyX, bodyY, bodyWidth, bodyHeight, 8);
    ctx.fill();
    
    ctx.strokeStyle = "#2E7D32";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 服の装飾（ボタン）
    ctx.fillStyle = "#2E7D32";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(bodyX + bodyWidth / 2, bodyY + bodyHeight * 0.2 + i * bodyHeight * 0.2, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 腕の描画
    const armW = bodyWidth * 0.25;
    const armH = bodyHeight * 0.75;
    
    ctx.fillStyle = "#FFCCAA";
    ctx.strokeStyle = "#E8B887";
    ctx.lineWidth = 0.5;

    // 左腕
    ctx.beginPath();
    ctx.roundRect(bodyX - armW / 2, bodyY + bodyHeight * 0.1, armW, armH, 4);
    ctx.fill();
    ctx.stroke();
    
    // 右腕
    ctx.beginPath();
    ctx.roundRect(bodyX + bodyWidth - armW / 2, bodyY + bodyHeight * 0.1, armW, armH, 4);
    ctx.fill();
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
    const feetHeight = legHeight * 0.1;
    const feetX = legX - (feetWidth - legWidth) / 2;
    const feetY = legStartY + legHeight;
    
    ctx.fillStyle = "#5D4037";
    ctx.beginPath();
    ctx.roundRect(feetX, feetY, feetWidth, feetHeight, 3);
    ctx.fill();
    
    ctx.strokeStyle = "#3E2723";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // findCharacterAt メソッド
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

  // 既存のメソッド（後方互換性）
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