// src/components/CanvasArea/renderers/CharacterUtils.tsx (ユーティリティ専用)
import { Character } from "../../../types";

export class CharacterUtils {
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

  // キャラクター位置計算ユーティリティ
  static getCharacterBounds(character: Character, panel?: any): {
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

  // キャラクタータイプによる表示設定
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
          defaultExpression: "smile"
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
          defaultExpression: "smile"
        };
      case "hero":
      default: 
        return {
          hairColor: "#8B4513",
          hairStyle: "normal",
          bodyColor: "#4CAF50",
          defaultExpression: "normal"
        };
    }
  }

  // スケール制限チェック
  static validateScale(scale: number): number {
    return Math.max(0.5, Math.min(5.0, scale));
  }

  // 座標制限チェック（キャンバス内に収める）
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

  // キャラクターリサイズ処理
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

  // デバッグ情報生成
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
      Expression: ${character.faceExpression || 'normal'}
      Pose: ${character.bodyPose || 'standing'}`;
  }
}