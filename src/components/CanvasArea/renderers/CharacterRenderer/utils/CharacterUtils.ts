// src/components/CanvasArea/renderers/CharacterRenderer/utils/CharacterUtils.ts
// 🔧 統合・型修正版（2つのファイルを統合）

import { Character, Panel } from "../../../../../types";

export class CharacterUtils {
  
  // 🎯 キャラクター幅計算
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
      case "upper_body": typeMultiplier = 1.0; break; // 🔧 修正: halfBody → upper_body
      case "full_body": typeMultiplier = 1.1; break; // 🔧 修正: fullBody → full_body
      default: typeMultiplier = 1.0;
    }
    
    return baseWidth * character.scale * typeMultiplier;
  }

  // 🎯 キャラクター高さ計算
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
      case "upper_body": typeMultiplier = 1.2; break; // 🔧 修正: halfBody → upper_body
      case "full_body": typeMultiplier = 1.8; break; // 🔧 修正: fullBody → full_body
      default: typeMultiplier = 1.0;
    }
    
    return baseHeight * character.scale * typeMultiplier;
  }

  // 🎯 キャラクター境界ボックス計算（統合版）
  static getCharacterBounds(character: Character, panel?: Panel): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    let charX, charY, charWidth, charHeight;
    
    if (character.isGlobalPosition) {
      charWidth = CharacterUtils.getCharacterWidth(character);
      charHeight = CharacterUtils.getCharacterHeight(character);
      charX = character.x - charWidth / 2;
      charY = character.y - charHeight / 2;
    } else if (panel) {
      charWidth = 60 * character.scale;
      charHeight = 40 * character.scale;
      charX = panel.x + panel.width * character.x - charWidth / 2;
      charY = panel.y + panel.height * character.y - charHeight / 2;
    } else {
      // フォールバック
      charWidth = 60 * character.scale;
      charHeight = 40 * character.scale;
      charX = character.x - charWidth / 2;
      charY = character.y - charHeight / 2;
    }

    return { x: charX, y: charY, width: charWidth, height: charHeight };
  }

  // 🎯 キャラクター描画座標計算
  static calculateDrawingCoordinates(
    character: Character,
    panel: Panel
  ): {
    charX: number;
    charY: number;
    charWidth: number;
    charHeight: number;
  } {
    let charX, charY, charWidth, charHeight;
    
    if (character.isGlobalPosition) {
      charWidth = CharacterUtils.getCharacterWidth(character);
      charHeight = CharacterUtils.getCharacterHeight(character);
      charX = character.x - charWidth / 2;
      charY = character.y - charHeight / 2;
    } else {
      charWidth = 60 * character.scale;
      charHeight = 40 * character.scale;
      charX = panel.x + panel.width * character.x - charWidth / 2;
      charY = panel.y + panel.height * character.y - charHeight / 2;
    }

    return { charX, charY, charWidth, charHeight };
  }

  // 🎯 キャラクター中心座標計算
  static calculateCenterCoordinates(
    character: Character,
    panel: Panel
  ): { centerX: number; centerY: number } {
    const { charX, charY, charWidth, charHeight } = 
      CharacterUtils.calculateDrawingCoordinates(character, panel);
    
    return {
      centerX: charX + charWidth / 2,
      centerY: charY + charHeight / 2
    };
  }

  // 🎯 頭部サイズ・位置計算（viewType別・修正版）
  static calculateHeadDimensions(
    charWidth: number,
    charHeight: number,
    charX: number,
    charY: number,
    viewType: string
  ): { headX: number; headY: number; headSize: number } {
    let headSize, headX, headY;
    
    switch (viewType) {
      case "face":
        headSize = Math.min(charWidth, charHeight) * 0.9;
        headX = charX + charWidth / 2 - headSize / 2;
        headY = charY + charHeight / 2 - headSize / 2;
        break;
        
      case "upper_body": // 🔧 修正: halfBody → upper_body
        headSize = charWidth * 0.45;
        headX = charX + charWidth / 2 - headSize / 2;
        headY = charY + charHeight * 0.05;
        break;
        
      case "full_body": // 🔧 修正: fullBody → full_body
        headSize = charWidth * 0.35;
        headX = charX + charWidth / 2 - headSize / 2;
        headY = charY + charHeight * 0.02;
        break;
        
      default:
        headSize = charWidth * 0.45;
        headX = charX + charWidth / 2 - headSize / 2;
        headY = charY + charHeight * 0.05;
    }
    
    return { headX, headY, headSize };
  }

  // 🎯 体描画開始Y座標計算（修正版）
  static calculateBodyStartY(
    charY: number,
    charHeight: number,
    headSize: number,
    viewType: string
  ): number {
    switch (viewType) {
      case "face":
        return charY + charHeight; // 顔のみなので体なし
        
      case "upper_body": // 🔧 修正: halfBody → upper_body
        return charY + charHeight * 0.05 + headSize;
        
      case "full_body": // 🔧 修正: fullBody → full_body
        return charY + charHeight * 0.02 + headSize;
        
      default:
        return charY + charHeight * 0.05 + headSize;
    }
  }

  // 🎯 キャラクタータイプによる表示設定
  static getCharacterDisplayConfig(character: Character): {
    hairColor: string;
    hairStyle: string;
    bodyColor: string;
    defaultExpression: string;
  } {
    switch (character.type) {
      case "heroine": 
        return {
          hairColor: "#D2691E", 
          hairStyle: "long",
          bodyColor: "#4CAF50",
          defaultExpression: "smiling" // 🔧 修正: smile → smiling
        };
      case "rival": 
        return {
          hairColor: "#2F4F4F", 
          hairStyle: "spiky",
          bodyColor: "#FF5722",
          defaultExpression: "angry"
        };
      case "friend":
        return {
          hairColor: "#A0522D",
          hairStyle: "curly",
          bodyColor: "#2196F3",
          defaultExpression: "smiling" // 🔧 修正: smile → smiling
        };
      case "hero":
      default: 
        return {
          hairColor: "#8B4513",
          hairStyle: "normal",
          bodyColor: "#4CAF50",
          defaultExpression: "neutral_expression" // 🔧 修正: normal → neutral_expression
        };
    }
  }

  // 🎯 角度計算（回転用）
  static calculateAngle(
    centerX: number,
    centerY: number,
    mouseX: number,
    mouseY: number
  ): number {
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // 0-360度に正規化
    if (angle < 0) {
      angle += 360;
    }
    
    return angle;
  }

  // 🎯 角度正規化（0-360度範囲）
  static normalizeAngle(angle: number): number {
    let normalized = angle % 360;
    if (normalized < 0) {
      normalized += 360;
    }
    return normalized;
  }

  // 🎯 角度差分計算
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

  // 🎯 スナップ角度計算
  static snapToAngle(angle: number, snapInterval: number = 15): number {
    return Math.round(angle / snapInterval) * snapInterval;
  }

  // 🎯 距離計算
  static calculateDistance(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // 🎯 回転後の点計算
  static rotatePoint(
    x: number,
    y: number,
    centerX: number,
    centerY: number,
    angleDegrees: number
  ): { x: number; y: number } {
    const angleRadians = (angleDegrees * Math.PI) / 180;
    const cos = Math.cos(angleRadians);
    const sin = Math.sin(angleRadians);
    
    const translatedX = x - centerX;
    const translatedY = y - centerY;
    
    return {
      x: centerX + (translatedX * cos - translatedY * sin),
      y: centerY + (translatedX * sin + translatedY * cos)
    };
  }

  // 🎯 回転後の境界ボックス計算
  static calculateRotatedBounds(
    x: number,
    y: number,
    width: number,
    height: number,
    angleDegrees: number
  ): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    // 4つの角の座標を回転
    const corners = [
      CharacterUtils.rotatePoint(x, y, centerX, centerY, angleDegrees),
      CharacterUtils.rotatePoint(x + width, y, centerX, centerY, angleDegrees),
      CharacterUtils.rotatePoint(x + width, y + height, centerX, centerY, angleDegrees),
      CharacterUtils.rotatePoint(x, y + height, centerX, centerY, angleDegrees)
    ];
    
    const xValues = corners.map(corner => corner.x);
    const yValues = corners.map(corner => corner.y);
    
    const minX = Math.min(...xValues);
    const minY = Math.min(...yValues);
    const maxX = Math.max(...xValues);
    const maxY = Math.max(...yValues);
    
    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  // 🎯 スケール制限チェック
  static validateScale(scale: number): number {
    return Math.max(0.5, Math.min(5.0, scale));
  }

  // 🎯 座標制限チェック（キャンバス内に収める）
  static validatePosition(
    x: number, 
    y: number, 
    character: Character, 
    canvasWidth: number, 
    canvasHeight: number
  ): { x: number; y: number } {
    const width = CharacterUtils.getCharacterWidth(character);
    const height = CharacterUtils.getCharacterHeight(character);
    
    const minX = width / 2;
    const maxX = canvasWidth - width / 2;
    const minY = height / 2;
    const maxY = canvasHeight - height / 2;
    
    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y))
    };
  }

  // 🎯 キャラクターリサイズ処理（統合版）
  static resizeCharacter(
    character: Character,
    direction: string,
    deltaX: number,
    deltaY: number,
    initialScale: number
  ): Character {
    let scaleDelta = 0;
    
    switch (direction) {
      case "nw":
      case "sw":
        scaleDelta = -deltaX / 100; // 左側のハンドルは逆方向
        break;
      case "ne":
      case "se":
      case "e":
        scaleDelta = deltaX / 100; // 右側のハンドルは正方向
        break;
      case "n":
        scaleDelta = -deltaY / 100; // 上のハンドルは逆方向
        break;
      case "s":
        scaleDelta = deltaY / 100; // 下のハンドルは正方向
        break;
      case "w":
        scaleDelta = -deltaX / 100; // 左のハンドルは逆方向
        break;
      default:
        scaleDelta = (deltaX + deltaY) / 200; // デフォルト
    }
    
    const newScale = CharacterUtils.validateScale(initialScale + scaleDelta);
    
    return {
      ...character,
      scale: newScale,
    };
  }

  // 🎯 デバッグ情報生成（修正版）
  static getDebugInfo(character: Character): string {
    const bounds = CharacterUtils.getCharacterBounds(character);
    return `Character Debug:
      ID: ${character.id}
      Name: ${character.name}
      Type: ${character.type}
      Position: (${character.x.toFixed(1)}, ${character.y.toFixed(1)})
      Scale: ${character.scale.toFixed(2)}
      ViewType: ${character.viewType}
      Global: ${character.isGlobalPosition}
      Bounds: ${bounds.width.toFixed(1)}x${bounds.height.toFixed(1)}
      Expression: ${character.expression || 'neutral_expression'} 
      Action: ${character.action || 'standing'}`; // 🔧 修正: faceExpression → expression, bodyPose → action
  }

  // 🎯 デバッグ情報出力（詳細版）
  static debugCharacterInfo(
    character: Character,
    panel: Panel,
    operation: string
  ): void {
    console.log(`🔍 キャラクターデバッグ [${operation}]:`, {
      id: character.id,
      name: character.name,
      position: { x: character.x, y: character.y },
      size: { 
        width: character.width || "計算値", 
        height: character.height || "計算値",
        scale: character.scale
      },
      rotation: character.rotation || 0,
      viewType: character.viewType,
      isGlobalPosition: character.isGlobalPosition,
      panelId: character.panelId
    });
  }
}