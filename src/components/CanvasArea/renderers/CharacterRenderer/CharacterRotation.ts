// src/components/CanvasArea/renderers/CharacterRenderer/CharacterRotation.ts
import { Character, Panel } from "../../../../types";
import { CharacterUtils } from "./utils/CharacterUtils";
import { CharacterBounds } from "./utils/CharacterBounds";

/**
 * キャラクター回転機能専用クラス
 * 2D回転操作・描画・計算を統合管理
 */
export class CharacterRotation {

  // 🔄 キャラクターの回転更新
  static rotateCharacter(character: Character, newRotation: number): Character {
    const normalizedRotation = CharacterUtils.normalizeAngle(newRotation);
    
    console.log(`🔄 キャラクター回転: ${character.name} → ${Math.round(normalizedRotation)}°`);
    
    return {
      ...character,
      rotation: normalizedRotation
    };
  }

  // 🎨 回転ハンドル描画（座標統一修正版）
  static drawRotationHandle(
    ctx: CanvasRenderingContext2D, 
    character: Character, 
    panel: Panel,
    bounds: any
  ) {
    // 🔧 CharacterBoundsと同じ座標計算を使用
    const characterBounds = CharacterBounds.getCharacterBounds(character, panel);
    const handleDistance = 35;
    const handleRadius = 20;
    const handleX = characterBounds.centerX;
    const handleY = characterBounds.y - handleDistance;
    
    console.log("🎨 回転ハンドル描画（座標統一版）:", {
      handleX,
      handleY,
      characterBounds,
      calculation: `${characterBounds.y} - ${handleDistance} = ${handleY}`
    });

    ctx.save();
    
    // 接続線（キャラクター上部から回転ハンドルまで）
    ctx.strokeStyle = "rgba(255, 102, 0, 0.6)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(characterBounds.centerX, characterBounds.y);
    ctx.lineTo(handleX, handleY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 回転ハンドル背景（白い円）
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#4a90e2";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(handleX, handleY, handleRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // 回転アイコン（回転矢印）
    const innerRadius = handleRadius * 0.6;
    const arrowSize = handleRadius * 0.3;
    
    // 円弧描画
    ctx.strokeStyle = "#4a90e2";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(handleX, handleY, innerRadius, -Math.PI/2, Math.PI);
    ctx.stroke();
    
    // 矢印の先端
    const arrowX = handleX + innerRadius * Math.cos(Math.PI);
    const arrowY = handleY + innerRadius * Math.sin(Math.PI);
    
    ctx.fillStyle = "#4a90e2";
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX - arrowSize, arrowY - arrowSize/2);
    ctx.lineTo(arrowX - arrowSize, arrowY + arrowSize/2);
    ctx.closePath();
    ctx.fill();
    
    // 中心点（小さな円）
    ctx.fillStyle = "#4a90e2";
    ctx.beginPath();
    ctx.arc(handleX, handleY, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  // 🎯 回転操作の開始処理
  static startRotation(
    character: Character,
    panel: Panel,
    mouseX: number,
    mouseY: number
  ): {
    startAngle: number;
    originalRotation: number;
  } {
    const { centerX, centerY } = CharacterUtils.calculateCenterCoordinates(character, panel);
    const startAngle = CharacterUtils.calculateAngle(centerX, centerY, mouseX, mouseY);
    const originalRotation = character.rotation || 0;

    console.log("🔄 回転開始:", {
      character: character.name,
      startAngle: Math.round(startAngle),
      originalRotation: Math.round(originalRotation),
      center: { x: Math.round(centerX), y: Math.round(centerY) }
    });

    return {
      startAngle,
      originalRotation
    };
  }

  // 🎯 回転操作の更新処理
  static updateRotation(
    character: Character,
    panel: Panel,
    mouseX: number,
    mouseY: number,
    startAngle: number,
    originalRotation: number
  ): Character {
    const { centerX, centerY } = CharacterUtils.calculateCenterCoordinates(character, panel);
    const currentAngle = CharacterUtils.calculateAngle(centerX, centerY, mouseX, mouseY);
    
    // 角度差分計算
    const angleDiff = CharacterUtils.calculateAngleDifference(startAngle, currentAngle);
    const newRotation = CharacterUtils.normalizeAngle(originalRotation + angleDiff);
    
    // キャラクター更新
    return CharacterRotation.rotateCharacter(character, newRotation);
  }

  // 🎯 スナップ回転（15度単位）
  static snapRotation(character: Character, snapEnabled: boolean = false): Character {
    if (!snapEnabled) return character;
    
    const currentRotation = character.rotation || 0;
    const snapAngle = 15; // 15度単位
    const snappedRotation = Math.round(currentRotation / snapAngle) * snapAngle;
    
    if (Math.abs(currentRotation - snappedRotation) < 5) {
      console.log(`📐 スナップ回転: ${Math.round(currentRotation)}° → ${snappedRotation}°`);
      return CharacterRotation.rotateCharacter(character, snappedRotation);
    }
    
    return character;
  }

  // 🔄 回転リセット
  static resetRotation(character: Character): Character {
    console.log(`🔄 回転リセット: ${character.name}`);
    return CharacterRotation.rotateCharacter(character, 0);
  }

  // 🎯 回転角度の検証・補正
  static validateRotation(rotation: number): number {
    // NaNや無限値の防止
    if (!isFinite(rotation) || isNaN(rotation)) {
      console.warn("⚠️ 無効な回転角度を検出、0度にリセット");
      return 0;
    }
    
    return CharacterUtils.normalizeAngle(rotation);
  }

  // 🎨 回転軌跡の描画（デバッグ用）
  static drawRotationPath(
    ctx: CanvasRenderingContext2D,
    character: Character,
    panel: Panel,
    startAngle: number,
    currentAngle: number
  ) {
    const { centerX, centerY } = CharacterUtils.calculateCenterCoordinates(character, panel);
    const radius = 60;

    ctx.save();
    ctx.strokeStyle = "rgba(74, 144, 226, 0.5)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    // 回転軌跡の円弧
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, currentAngle);
    ctx.stroke();
    
    // 開始点
    ctx.fillStyle = "#4a90e2";
    ctx.beginPath();
    ctx.arc(
      centerX + radius * Math.cos(startAngle),
      centerY + radius * Math.sin(startAngle),
      4, 0, Math.PI * 2
    );
    ctx.fill();
    
    // 現在点
    ctx.fillStyle = "#ff6600";
    ctx.beginPath();
    ctx.arc(
      centerX + radius * Math.cos(currentAngle),
      centerY + radius * Math.sin(currentAngle),
      4, 0, Math.PI * 2
    );
    ctx.fill();
    
    ctx.restore();
  }

  // 🔄 プリセット回転（よく使う角度）
  static applyPresetRotation(character: Character, preset: string): Character {
    const presetAngles: { [key: string]: number } = {
      'reset': 0,
      'right': 90,
      'down': 180,
      'left': 270,
      'slight-right': 15,
      'slight-left': -15,
      'back-right': 45,
      'back-left': -45
    };
    
    const angle = presetAngles[preset];
    if (angle !== undefined) {
      console.log(`🔄 プリセット回転適用: ${preset} (${angle}°)`);
      return CharacterRotation.rotateCharacter(character, angle);
    }
    
    console.warn(`⚠️ 不明なプリセット: ${preset}`);
    return character;
  }

  // 🎯 回転状態の情報取得
  static getRotationInfo(character: Character): {
    rotation: number;
    rotationDegrees: string;
    rotationRadians: number;
    quadrant: number;
    isRotated: boolean;
  } {
    const rotation = character.rotation || 0;
    const radians = (rotation * Math.PI) / 180;
    const quadrant = Math.floor((rotation % 360) / 90) + 1;
    
    return {
      rotation,
      rotationDegrees: `${Math.round(rotation)}°`,
      rotationRadians: radians,
      quadrant,
      isRotated: Math.abs(rotation % 360) > 0.1
    };
  }
}