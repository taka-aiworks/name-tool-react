// src/components/CanvasArea/renderers/CharacterRotation.ts
// 🔄 2D回転機能専用クラス

// CharacterRotation.ts
import { Character, Panel, CharacterBounds, RotationHandle } from "../../../../types"; // ← ../を1つ削除

export class CharacterRotation {  // ← exportを追加
  
  // 🎯 回転ハンドル描画
  static drawRotationHandle(
    ctx: CanvasRenderingContext2D,
    character: Character,
    panel: Panel,
    bounds: CharacterBounds
  ) {
    const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";
    
    // 🔧 座標計算を統一（判定と同じ計算方法）
    const handleDistance = 35;
    const handleX = bounds.centerX;
    const handleY = bounds.y - handleDistance;
    const handleSize = 20;
    
    console.log("🎨 回転ハンドル描画位置（修正版）:", {
      handleX,
      handleY,
      boundsY: bounds.y,
      calculation: `${bounds.y} - ${handleDistance} = ${handleY}`
    });
    
    // 接続線
    ctx.strokeStyle = isDarkMode ? "rgba(255, 102, 0, 0.8)" : "rgba(255, 102, 0, 0.6)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(bounds.centerX, bounds.y);
    ctx.lineTo(handleX, handleY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 🔄 回転ハンドル（円形・回転アイコン付き）
    ctx.fillStyle = "#ff6600";
    ctx.strokeStyle = isDarkMode ? "#fff" : "#000";
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.arc(handleX, handleY, handleSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }


  // 🎯 回転ハンドルクリック判定
  static isRotationHandleClicked(
    mouseX: number,
    mouseY: number,
    character: Character,
    panel: Panel,
    bounds: CharacterBounds
  ): boolean {
    const handleDistance = 35;
    const handleX = bounds.centerX;
    const handleY = bounds.y - handleDistance;
    const handleRadius = 12; // クリック判定は少し大きめ
    
    const dx = mouseX - handleX;
    const dy = mouseY - handleY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const isClicked = distance <= handleRadius;
    
    console.log("🔄 回転ハンドルクリック判定:", {
      mousePos: { x: mouseX, y: mouseY },
      handlePos: { x: handleX, y: handleY },
      distance,
      handleRadius,
      isClicked
    });
    
    return isClicked;
  }
  
  // 🎯 回転角度計算
  static calculateRotationAngle(
    centerX: number,
    centerY: number,
    mouseX: number,
    mouseY: number
  ): number {
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    
    // atan2で角度を計算（ラジアン → 度）
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // 角度を0-360の範囲に正規化
    if (angle < 0) {
      angle += 360;
    }
    
    return angle;
  }
  
  // 🎯 キャラクター境界取得
  static getCharacterBounds(
    character: Character,
    panel: Panel
  ): CharacterBounds {
    let charX, charY, charWidth, charHeight;
    
    // 既存のCharacterRendererと同じロジック
    if (character.isGlobalPosition) {
      charWidth = CharacterRotation.getCharacterWidth(character);
      charHeight = CharacterRotation.getCharacterHeight(character);
      charX = character.x - charWidth / 2;
      charY = character.y - charHeight / 2;
    } else {
      charWidth = 60 * character.scale;
      charHeight = 40 * character.scale;
      charX = panel.x + panel.width * character.x - charWidth / 2;
      charY = panel.y + panel.height * character.y - charHeight / 2;
    }
    
    return {
      x: charX,
      y: charY,
      width: charWidth,
      height: charHeight,
      centerX: charX + charWidth / 2,
      centerY: charY + charHeight / 2
    };
  }
  
  // 🎯 キャラクター幅取得（CharacterRendererから移植）
  static getCharacterWidth(character: Character): number {
    if (character.width !== undefined && character.width > 0) {
      return character.width;
    }
    
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
  
  // 🎯 キャラクター高さ取得（CharacterRendererから移植）
  static getCharacterHeight(character: Character): number {
    if (character.height !== undefined && character.height > 0) {
      return character.height;
    }
    
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
  
  // 🎯 回転適用
  static rotateCharacter(
    character: Character,
    newRotation: number
  ): Character {
    // 角度を0-360の範囲に正規化
    let normalizedRotation = newRotation % 360;
    if (normalizedRotation < 0) {
      normalizedRotation += 360;
    }
    
    console.log("🔄 キャラクター回転適用:", {
      characterId: character.id,
      oldRotation: character.rotation || 0,
      newRotation: normalizedRotation
    });
    
    return {
      ...character,
      rotation: normalizedRotation
    };
  }
  
  // 🎯 角度差分計算（ドラッグ時の相対回転用）
  static calculateAngleDifference(startAngle: number, currentAngle: number): number {
    let diff = currentAngle - startAngle;
    
    // -180 ~ 180の範囲に正規化
    if (diff > 180) {
      diff -= 360;
    } else if (diff < -180) {
      diff += 360;
    }
    
    return diff;
  }
  
  // 🎯 スナップ角度（15度単位でスナップ）
  static snapToAngle(angle: number, snapInterval: number = 15): number {
    return Math.round(angle / snapInterval) * snapInterval;
  }
}