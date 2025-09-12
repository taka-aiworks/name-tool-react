// src/components/CanvasArea/renderers/CharacterRenderer/utils/CharacterBounds.ts
// 🎯 キャラクター境界・当たり判定専用クラス

import { Character, Panel, CharacterBounds as CharacterBoundsType } from "../../../../../types"; // ← こちらも確認
import { CharacterUtils } from "./CharacterUtils";

export class CharacterBounds {
  
  // 🎯 キャラクター境界情報取得
  static getCharacterBounds(
    character: Character,
    panel: Panel
  ): CharacterBoundsType {
    const { charX, charY, charWidth, charHeight } = 
      CharacterUtils.calculateDrawingCoordinates(character, panel);
    
    return {
      x: charX,
      y: charY,
      width: charWidth,
      height: charHeight,
      centerX: charX + charWidth / 2,
      centerY: charY + charHeight / 2
    };
  }

  // 🎯 回転を考慮したキャラクター境界
  static getRotatedCharacterBounds(
    character: Character,
    panel: Panel
  ): {
    original: CharacterBoundsType;
    rotated: {
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
      width: number;
      height: number;
    };
  } {
    const original = CharacterBounds.getCharacterBounds(character, panel);
    const rotation = character.rotation || 0;
    
    if (rotation === 0) {
      return {
        original,
        rotated: {
          minX: original.x,
          minY: original.y,
          maxX: original.x + original.width,
          maxY: original.y + original.height,
          width: original.width,
          height: original.height
        }
      };
    }
    
    const rotated = CharacterUtils.calculateRotatedBounds(
      original.x,
      original.y,
      original.width,
      original.height,
      rotation
    );
    
    return { original, rotated };
  }

  // 🎯 キャラクタークリック判定（回転対応）
  static isCharacterClicked(
    mouseX: number,
    mouseY: number,
    character: Character,
    panel: Panel
  ): boolean {
    const rotation = character.rotation || 0;
    
    if (rotation === 0) {
      // 通常の矩形判定
      const bounds = CharacterBounds.getCharacterBounds(character, panel);
      return (
        mouseX >= bounds.x &&
        mouseX <= bounds.x + bounds.width &&
        mouseY >= bounds.y &&
        mouseY <= bounds.y + bounds.height
      );
    } else {
      // 回転している場合の判定
      return CharacterBounds.isRotatedCharacterClicked(mouseX, mouseY, character, panel);
    }
  }

  // 🎯 回転キャラクターのクリック判定
  static isRotatedCharacterClicked(
    mouseX: number,
    mouseY: number,
    character: Character,
    panel: Panel
  ): boolean {
    const bounds = CharacterBounds.getCharacterBounds(character, panel);
    const rotation = character.rotation || 0;
    
    // マウス座標を逆回転させてキャラクターローカル座標で判定
    const reversedPoint = CharacterUtils.rotatePoint(
      mouseX,
      mouseY,
      bounds.centerX,
      bounds.centerY,
      -rotation // 逆回転
    );
    
    // 逆回転した座標で通常の矩形判定
    return (
      reversedPoint.x >= bounds.x &&
      reversedPoint.x <= bounds.x + bounds.width &&
      reversedPoint.y >= bounds.y &&
      reversedPoint.y <= bounds.y + bounds.height
    );
  }

  // 🎯 複数キャラクターからクリック対象を検索
  static findCharacterAt(
    mouseX: number,
    mouseY: number,
    characters: Character[],
    panels: Panel[]
  ): Character | null {
    // 後ろから検索（上に描画されたものを優先）
    for (let i = characters.length - 1; i >= 0; i--) {
      const character = characters[i];
      const panel = panels.find((p) => p.id === character.panelId);
      
      if (!panel) {
        console.warn(`⚠️ パネル未発見 - キャラクター: ${character.name}, パネルID: ${character.panelId}`);
        continue;
      }

      if (CharacterBounds.isCharacterClicked(mouseX, mouseY, character, panel)) {
        console.log(`🎯 キャラクタークリック検出: ${character.name} (rotation: ${character.rotation || 0}°)`);
        return character;
      }
    }
    
    return null;
  }

  // 🎯 リサイズハンドル境界計算
  static getResizeHandleBounds(
    character: Character,
    panel: Panel
  ): Array<{
    direction: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }> {
    const bounds = CharacterBounds.getCharacterBounds(character, panel);
    const handleSize = 16;
    
    return [
      // 角ハンドル（四角）
      { direction: "nw", x: bounds.x - handleSize/2, y: bounds.y - handleSize/2, width: handleSize, height: handleSize },
      { direction: "ne", x: bounds.x + bounds.width - handleSize/2, y: bounds.y - handleSize/2, width: handleSize, height: handleSize },
      { direction: "se", x: bounds.x + bounds.width - handleSize/2, y: bounds.y + bounds.height - handleSize/2, width: handleSize, height: handleSize },
      { direction: "sw", x: bounds.x - handleSize/2, y: bounds.y + bounds.height - handleSize/2, width: handleSize, height: handleSize },
      
      // 辺ハンドル（丸 - 円として扱う）
      { direction: "n", x: bounds.x + bounds.width/2 - handleSize/2, y: bounds.y - handleSize/2, width: handleSize, height: handleSize },
      { direction: "e", x: bounds.x + bounds.width - handleSize/2, y: bounds.y + bounds.height/2 - handleSize/2, width: handleSize, height: handleSize },
      { direction: "s", x: bounds.x + bounds.width/2 - handleSize/2, y: bounds.y + bounds.height - handleSize/2, width: handleSize, height: handleSize },
      { direction: "w", x: bounds.x - handleSize/2, y: bounds.y + bounds.height/2 - handleSize/2, width: handleSize, height: handleSize }
    ];
  }

  // 🎯 リサイズハンドルクリック判定
  static isResizeHandleClicked(
    mouseX: number,
    mouseY: number,
    character: Character,
    panel: Panel
  ): { isClicked: boolean; direction: string } {
    const handles = CharacterBounds.getResizeHandleBounds(character, panel);
    const tolerance = 10; // クリック判定を広く
    
    for (const handle of handles) {
      const inRangeX = mouseX >= handle.x - tolerance && 
                      mouseX <= handle.x + handle.width + tolerance;
      const inRangeY = mouseY >= handle.y - tolerance && 
                      mouseY <= handle.y + handle.height + tolerance;
      
      if (inRangeX && inRangeY) {
        console.log(`🔧 リサイズハンドル ${handle.direction} クリック検出!`);
        return { isClicked: true, direction: handle.direction };
      }
    }

    return { isClicked: false, direction: "" };
  }

  // 🎯 回転ハンドル境界計算（修正版）
  static getRotationHandleBounds(
    character: Character,
    panel: Panel
  ): { x: number; y: number; radius: number } {
    const bounds = CharacterBounds.getCharacterBounds(character, panel);
    const handleDistance = 35;
    const handleRadius = 20; // ← 12から20に拡大（操作しやすく）
    
    console.log("🔍 回転ハンドル座標計算:", {
      bounds,
      handleX: bounds.centerX,
      handleY: bounds.y - handleDistance,
      calculation: `${bounds.y} - ${handleDistance} = ${bounds.y - handleDistance}`
    });
    
    return {
      x: bounds.centerX,
      y: bounds.y - handleDistance,
      radius: handleRadius
    };
  }

  // 🎯 回転ハンドルクリック判定（修正版）
  static isRotationHandleClicked(
    mouseX: number,
    mouseY: number,
    character: Character,
    panel: Panel
  ): boolean {
    const handle = CharacterBounds.getRotationHandleBounds(character, panel);
    const distance = Math.sqrt(
      Math.pow(mouseX - handle.x, 2) + 
      Math.pow(mouseY - handle.y, 2)
    );
    
    console.log("🔍 回転ハンドル判定詳細:", {
      mousePos: { x: mouseX, y: mouseY },
      handlePos: { x: handle.x, y: handle.y },
      distance: distance,
      radius: handle.radius,
      isClicked: distance <= handle.radius
    });
    
    const isClicked = distance <= handle.radius;
    
    if (isClicked) {
      console.log("🔄 回転ハンドルクリック検出!", {
        distance,
        radius: handle.radius
      });
    }
    
    return isClicked;
  }


  // 🎯 統合ハンドルクリック判定（完全修正版）
  static getHandleClickInfo(
    mouseX: number,
    mouseY: number,
    character: Character,
    panel: Panel
  ): { 
    isClicked: boolean; 
    type: "none" | "resize" | "rotate";
    direction?: string 
  } {
    console.log("🎯 統合ハンドル判定開始:", {
      mousePos: { x: mouseX, y: mouseY },
      character: character.name
    });

    // 🔄 回転ハンドル判定（最優先）
    if (CharacterBounds.isRotationHandleClicked(mouseX, mouseY, character, panel)) {
      console.log("✅ 回転ハンドル検出！");
      return { isClicked: true, type: "rotate" };
    }
    
    // 🔧 リサイズハンドル判定
    const resizeResult = CharacterBounds.isResizeHandleClicked(mouseX, mouseY, character, panel);
    if (resizeResult.isClicked) {
      console.log("✅ リサイズハンドル検出！", resizeResult.direction);
      return { 
        isClicked: true, 
        type: "resize", 
        direction: resizeResult.direction 
      };
    }
    
    console.log("❌ ハンドル検出されず");
    return { isClicked: false, type: "none" };
  }

  // 🎯 キャラクター境界とパネル境界の重複判定
  static isCharacterInPanel(
    character: Character,
    panel: Panel
  ): boolean {
    const charBounds = CharacterBounds.getCharacterBounds(character, panel);
    
    // パネル境界内かチェック
    return (
      charBounds.x >= panel.x &&
      charBounds.y >= panel.y &&
      charBounds.x + charBounds.width <= panel.x + panel.width &&
      charBounds.y + charBounds.height <= panel.y + panel.height
    );
  }

  // 🎯 キャラクター同士の重複判定
  static areCharactersOverlapping(
    character1: Character,
    character2: Character,
    panels: Panel[]
  ): boolean {
    const panel1 = panels.find(p => p.id === character1.panelId);
    const panel2 = panels.find(p => p.id === character2.panelId);
    
    if (!panel1 || !panel2) return false;
    
    const bounds1 = CharacterBounds.getCharacterBounds(character1, panel1);
    const bounds2 = CharacterBounds.getCharacterBounds(character2, panel2);
    
    // 矩形重複判定
    return !(
      bounds1.x + bounds1.width < bounds2.x ||
      bounds2.x + bounds2.width < bounds1.x ||
      bounds1.y + bounds1.height < bounds2.y ||
      bounds2.y + bounds2.height < bounds1.y
    );
  }

  // 🎯 スナップ位置計算
  static calculateSnapPosition(
    character: Character,
    panel: Panel,
    snapSettings: { enabled: boolean; gridSize: number; sensitivity: number }
  ): { x: number; y: number } {
    if (!snapSettings.enabled) {
      return { x: character.x, y: character.y };
    }
    
    const bounds = CharacterBounds.getCharacterBounds(character, panel);
    const { gridSize } = snapSettings;
    
    // グリッドに最も近い位置を計算
    const snappedX = Math.round(bounds.centerX / gridSize) * gridSize;
    const snappedY = Math.round(bounds.centerY / gridSize) * gridSize;
    
    // キャラクター座標系に戻す
    if (character.isGlobalPosition) {
      return { x: snappedX, y: snappedY };
    } else {
      return {
        x: (snappedX - panel.x) / panel.width,
        y: (snappedY - panel.y) / panel.height
      };
    }
  }

  // 🎯 デバッグ用境界情報出力
  static debugBoundsInfo(
    character: Character,
    panel: Panel,
    operation: string
  ): void {
    const bounds = CharacterBounds.getCharacterBounds(character, panel);
    const rotation = character.rotation || 0;
    
    console.log(`🔍 境界デバッグ [${operation}]:`, {
      character: character.name,
      bounds: {
        x: Math.round(bounds.x),
        y: Math.round(bounds.y),
        width: Math.round(bounds.width),
        height: Math.round(bounds.height),
        centerX: Math.round(bounds.centerX),
        centerY: Math.round(bounds.centerY)
      },
      rotation: Math.round(rotation),
      panel: {
        id: panel.id,
        x: panel.x,
        y: panel.y,
        width: panel.width,
        height: panel.height
      }
    });
  }
}