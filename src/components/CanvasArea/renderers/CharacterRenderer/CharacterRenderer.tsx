// src/components/CanvasArea/renderers/CharacterRenderer/CharacterRenderer.tsx 
// 🔧 分離クラス統合版（大幅削減・高品質化）
// types.ts対応修正版

// CharacterRenderer.tsx
import { Character, Panel } from "../../../../types"; // ← ../を1つ削除
import { CharacterRotation } from "./CharacterRotation";
import { CharacterUtils } from "./utils/CharacterUtils";
import { CharacterBounds } from "./utils/CharacterBounds";
import { CharacterHair } from "./drawing/CharacterHair";

export class CharacterRenderer {
  
  // 🎯 キャラクター群描画（メイン制御）
  // 1. drawCharactersメソッドに getCharacterDisplayName を追加
  static drawCharacters(
    ctx: CanvasRenderingContext2D,
    characters: Character[],
    panels: Panel[],
    selectedCharacter: Character | null,
    getCharacterDisplayName?: (character: Character) => string // 🆕 追加
  ) {
    characters.forEach((character) => {
      const panel = panels.find((p) => String(p.id) === String(character.panelId));
      
      if (!panel) {
        console.warn(`⚠️ パネル未発見 - ${character.name} (ID: ${character.panelId})`);
        const fallbackPanel = panels[0];
        if (fallbackPanel) {
          console.log(`🚑 緊急フォールバック: パネル${fallbackPanel.id}使用`);
          CharacterRenderer.drawCharacter(ctx, character, fallbackPanel, selectedCharacter, getCharacterDisplayName);
        }
        return;
      }
      
      CharacterRenderer.drawCharacter(ctx, character, panel, selectedCharacter, getCharacterDisplayName);
    });
  }

  // 🎯 個別キャラクター描画（回転対応・分離クラス活用）
  // 2. drawCharacterメソッドに getCharacterDisplayName を追加
  static drawCharacter(
    ctx: CanvasRenderingContext2D,
    character: Character,
    panel: Panel,
    selectedCharacter: Character | null,
    getCharacterDisplayName?: (character: Character) => string // 🆕 追加
  ) {
    // 🔧 描画座標計算（分離クラス使用）
    const { charX, charY, charWidth, charHeight } = 
      CharacterUtils.calculateDrawingCoordinates(character, panel);
    
    // 🔄 回転角度取得
    const rotation = character.rotation || 0;
    
    // 🔄 回転変換適用
    if (rotation !== 0) {
      ctx.save();
      const { centerX, centerY } = CharacterUtils.calculateCenterCoordinates(character, panel);
      
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
      
      console.log(`🔄 回転描画適用 [${character.name}]: ${rotation}°`);
    }

    // 🎯 選択状態の背景描画
    if (character === selectedCharacter) {
      CharacterRenderer.drawSelectionBackground(ctx, charX, charY, charWidth, charHeight);
    }

    // 🎯 キャラクター本体描画
    CharacterRenderer.drawCharacterBody(ctx, character, charX, charY, charWidth, charHeight);

    // 🎯 名前表示 - 🔧 修正
    CharacterRenderer.drawCharacterName(ctx, character, charX, charY, charWidth, charHeight, getCharacterDisplayName);

    // 🔄 回転変換解除
    if (rotation !== 0) {
      ctx.restore();
    }

    // 🎯 選択時ハンドル描画（回転変換外で実行）
    if (character === selectedCharacter) {
      CharacterRenderer.drawSelectionHandles(ctx, character, panel);
    }
  }

  // 🎯 選択状態背景描画
  static drawSelectionBackground(
    ctx: CanvasRenderingContext2D,
    charX: number,
    charY: number,
    charWidth: number,
    charHeight: number
  ) {
    const padding = 5;
    
    // 半透明背景
    ctx.fillStyle = "rgba(255, 102, 0, 0.2)";
    ctx.fillRect(charX - padding, charY - padding, charWidth + padding * 2, charHeight + padding * 2);
    
    // 境界線
    ctx.strokeStyle = "#ff6600";
    ctx.lineWidth = 2;
    ctx.strokeRect(charX - padding, charY - padding, charWidth + padding * 2, charHeight + padding * 2);
    
    // デバッグ用境界表示
    ctx.strokeStyle = "rgba(255, 102, 0, 0.5)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(charX, charY, charWidth, charHeight);
    ctx.setLineDash([]);
  }

  // 🎯 選択時ハンドル描画（リサイズ + 回転）
  static drawSelectionHandles(
    ctx: CanvasRenderingContext2D,
    character: Character,
    panel: Panel
  ) {
    const { charX, charY, charWidth, charHeight } = 
      CharacterUtils.calculateDrawingCoordinates(character, panel);
    
    // 🔧 リサイズハンドル描画（四隅の四角）
    CharacterRenderer.drawResizeHandles(ctx, charX, charY, charWidth, charHeight);
    
    // 🔄 回転ハンドル描画
    const bounds = CharacterBounds.getCharacterBounds(character, panel);
    CharacterRotation.drawRotationHandle(ctx, character, panel, bounds);
  }

  // 🔧 リサイズハンドル描画（修正版）
  static drawResizeHandles(
    ctx: CanvasRenderingContext2D,
    charX: number,
    charY: number,
    width: number,
    height: number
  ) {
    const handleSize = 12; // ハンドルサイズ
    const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";
    
    // 四隅の座標計算
    const corners = [
      { x: charX - handleSize/2, y: charY - handleSize/2 }, // 左上
      { x: charX + width - handleSize/2, y: charY - handleSize/2 }, // 右上
      { x: charX + width - handleSize/2, y: charY + height - handleSize/2 }, // 右下
      { x: charX - handleSize/2, y: charY + height - handleSize/2 }  // 左下
    ];

    // 四隅の四角ハンドル描画
    ctx.fillStyle = "#ff6600"; // オレンジ色
    ctx.strokeStyle = isDarkMode ? "#fff" : "#000"; // 枠線
    ctx.lineWidth = 2;

    corners.forEach(corner => {
      // 四角いハンドル
      ctx.fillRect(corner.x, corner.y, handleSize, handleSize);
      ctx.strokeRect(corner.x, corner.y, handleSize, handleSize);
    });
    
    console.log("🔧 キャラクター四隅ハンドル描画完了");
  }

  // CharacterRenderer.tsx の既存の drawCharacterName メソッドを以下に置き換え

  static drawCharacterName(
    ctx: CanvasRenderingContext2D,
    character: Character,
    charX: number,
    charY: number,
    charWidth: number,
    charHeight: number,
    getCharacterDisplayName?: (character: Character) => string
  ) {
    // 🔧 サイズを大幅に拡大
    const baseFontSize = 28; // 24 → 28 に拡大
    const fontSize = Math.max(20, baseFontSize * character.scale); // 最小サイズを16 → 20 に拡大
    const padding = 6;
    const textY = charY + charHeight + 25; // 12 → 25に下げる
    
    // 🌙 ダークモード検出
    const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";
    
    // 🔧 動的名前取得
    const displayName = getCharacterDisplayName ? getCharacterDisplayName(character) : character.name;
    
    
    // フォント設定（太字で視認性向上）
    ctx.font = `bold ${fontSize}px 'Hiragino Sans', 'Yu Gothic', 'Meiryo', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // テキストサイズ測定
    const textMetrics = ctx.measureText(displayName);
    const textWidth = textMetrics.width;
    const bgWidth = textWidth + padding * 2;
    const bgHeight = fontSize + padding * 2;
    const bgX = charX + charWidth / 2 - bgWidth / 2;
    const bgY = textY - bgHeight / 2;
    
    // 🌙 ダークモード対応色
    const colors = isDarkMode ? {
      shadow: 'rgba(0, 0, 0, 0.6)',
      background: 'rgba(45, 45, 45, 0.95)',
      border: 'rgba(255, 255, 255, 0.3)',
      textOutline: '#000000',
      textMain: '#ffffff'
    } : {
      shadow: 'rgba(0, 0, 0, 0.4)',
      background: 'rgba(255, 255, 255, 0.95)',
      border: 'rgba(0, 0, 0, 0.2)',
      textOutline: '#ffffff',
      textMain: '#2c3e50'
    };
    
    // 1. 影
    ctx.save();
    ctx.fillStyle = colors.shadow;
    ctx.fillRect(bgX + 3, bgY + 3, bgWidth, bgHeight);
    ctx.restore();
    
    // 2. 背景（角丸）
    ctx.save();
    ctx.fillStyle = colors.background;
    ctx.beginPath();
    ctx.roundRect(bgX, bgY, bgWidth, bgHeight, 4);
    ctx.fill();
    ctx.restore();
    
    // 3. 枠線
    ctx.save();
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(bgX, bgY, bgWidth, bgHeight, 4);
    ctx.stroke();
    ctx.restore();
    
    // 4. テキスト縁取り
    ctx.save();
    ctx.strokeStyle = colors.textOutline;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.strokeText(displayName, charX + charWidth / 2, textY);
    ctx.restore();
    
    // 5. メインテキスト
    ctx.save();
    ctx.fillStyle = colors.textMain;
    ctx.fillText(displayName, charX + charWidth / 2, textY);
    ctx.restore();
  }

  // 🎯 キャラクター本体描画（viewType分岐）
  static drawCharacterBody(
    ctx: CanvasRenderingContext2D,
    character: Character,
    charX: number,
    charY: number,
    charWidth: number,
    charHeight: number
  ) {
    // 🔧 viewType修正: types.tsの実際の値に合わせる
    switch (character.viewType) {
      case "face":
        CharacterRenderer.drawFaceOnly(ctx, character, charX, charY, charWidth, charHeight);
        break;
      case "upper_body":  // halfBody → upper_body
        CharacterRenderer.drawHalfBody(ctx, character, charX, charY, charWidth, charHeight);
        break;
      case "full_body":   // fullBody → full_body
        CharacterRenderer.drawFullBody(ctx, character, charX, charY, charWidth, charHeight);
        break;
      default:
        CharacterRenderer.drawHalfBody(ctx, character, charX, charY, charWidth, charHeight);
    }
  }

  // 🎯 顔のみ描画
  static drawFaceOnly(
    ctx: CanvasRenderingContext2D,
    character: Character,
    charX: number,
    charY: number,
    charWidth: number,
    charHeight: number
  ) {
    const { headX, headY, headSize } = CharacterUtils.calculateHeadDimensions(
      charWidth, charHeight, charX, charY, "face"
    );
    
    CharacterRenderer.drawHead(ctx, character, headX, headY, headSize);
  }

  // 🎯 上半身描画
  static drawHalfBody(
    ctx: CanvasRenderingContext2D,
    character: Character,
    charX: number,
    charY: number,
    charWidth: number,
    charHeight: number
  ) {
    const { headX, headY, headSize } = CharacterUtils.calculateHeadDimensions(
      charWidth, charHeight, charX, charY, "upper_body"  // halfBody → upper_body
    );
    
    const bodyStartY = CharacterUtils.calculateBodyStartY(charY, charHeight, headSize, "upper_body");  // halfBody → upper_body
    
    // 体を先に描画
    CharacterRenderer.drawBodyHalf(ctx, character, charX, charY, charWidth, charHeight, bodyStartY);
    
    // 頭部を最後に描画（髪が体に重なるように）
    CharacterRenderer.drawHead(ctx, character, headX, headY, headSize);
  }

  // 🎯 全身描画
  static drawFullBody(
    ctx: CanvasRenderingContext2D,
    character: Character,
    charX: number,
    charY: number,
    charWidth: number,
    charHeight: number
  ) {
    const { headX, headY, headSize } = CharacterUtils.calculateHeadDimensions(
      charWidth, charHeight, charX, charY, "full_body"  // fullBody → full_body
    );
    
    const bodyStartY = CharacterUtils.calculateBodyStartY(charY, charHeight, headSize, "full_body");  // fullBody → full_body
    
    // 体を先に描画
    CharacterRenderer.drawBodyFull(ctx, character, charX, charY, charWidth, charHeight, bodyStartY);
    
    // 頭部を最後に描画
    CharacterRenderer.drawHead(ctx, character, headX, headY, headSize);
  }

  // 🎯 頭部描画（分離クラス統合版）
  static drawHead(
    ctx: CanvasRenderingContext2D,
    character: Character,
    headX: number,
    headY: number,
    headSize: number
  ) {
    // 🔧 types.tsの実際のプロパティに修正
    const direction = character.facing || "front";  // bodyDirection/faceAngle → facing
    
    // 1. 頭の基本形状
    CharacterRenderer.drawHeadShape(ctx, headX, headY, headSize);
    
    // 2. 髪の毛（分離クラス使用）
    CharacterHair.drawHair(ctx, character, headX, headY, headSize, direction);

    // 後ろ向きの場合は顔の特徴を描画しない
    if (direction === "back" || direction === "leftBack" || direction === "rightBack") {
      return;
    }

    // 3. 顔の特徴
    CharacterRenderer.drawFaceFeatures(ctx, character, headX, headY, headSize, direction);
  }

  // 🎯 頭の基本形状描画
  static drawHeadShape(
    ctx: CanvasRenderingContext2D,
    headX: number,
    headY: number,
    headSize: number
  ) {
    // 肌色の頭（自然な楕円）
    ctx.fillStyle = "#FFCCAA";
    ctx.beginPath();
    
    const headWidth = headSize * 1.0; // 0.85 → 1.0 に拡大
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

  // ===== 以下、顔・体の描画メソッド（既存ロジック維持） =====
  // 注：実際の実装では既存のdrawFaceFeatures, drawBodyHalf, drawBodyFull等の
  // メソッドをそのまま移植します（長いので省略）

  static drawFaceFeatures(ctx: CanvasRenderingContext2D, character: Character, headX: number, headY: number, headSize: number, direction: string) {
    // 🎯 プロンプトに合わせた表情描画
    CharacterRenderer.drawExpressionBasedFace(ctx, character, headX, headY, headSize, direction);
  }

  // 🎯 プロンプトに合わせた表情描画（辞書ベース）
  static drawExpressionBasedFace(
    ctx: CanvasRenderingContext2D, 
    character: Character, 
    headX: number, 
    headY: number, 
    headSize: number, 
    direction: string
  ) {
    const expression = character.expression || "neutral";
    const eyeState = character.eyeState || "normal";
    const mouthState = character.mouthState || "neutral";
    
    // 🎯 表情に応じた目の描画
    CharacterRenderer.drawExpressionEyes(ctx, character, headX, headY, headSize, expression, eyeState);
    
    // 🎯 表情に応じた口の描画
    CharacterRenderer.drawExpressionMouth(ctx, character, headX, headY, headSize, expression, mouthState);
  }

  // 🎯 表情に応じた目の描画（元の座標システム + 表情変化）
  static drawExpressionEyes(
    ctx: CanvasRenderingContext2D, 
    character: Character, 
    headX: number, 
    headY: number, 
    headSize: number, 
    expression: string,
    eyeState: string
  ) {
    // 🔧 元の座標システムを使用
    const eyeSize = headSize * 0.06;
    const eyeY = headY + headSize * 0.35;
    const leftEyeX = headX + headSize * 0.3;
    const rightEyeX = headX + headSize * 0.7;
    
    // 表情に応じた目の描画（辞書プロンプト対応版）
    switch (expression) {
      case "smiling":
      case "soft_smile":
      case "bright_smile":
      case "big_smile":
      case "smiling_open_mouth":
      case "laughing":
      case "smug":
      case "maniacal_grin":
      case "cartoonish_grin":
        // 笑顔系の目（細め）
        CharacterRenderer.drawSmilingEyes(ctx, leftEyeX, rightEyeX, eyeY, eyeSize);
        break;
      case "sad":
      case "crying":
      case "teary_eyes":
      case "sleepy_eyes":
      case "comedic_crying":
      case "crying_a_river":
      case "despairing_expression":
      case "gloomy":
        // 悲しい目（下向き）
        CharacterRenderer.drawSadEyes(ctx, leftEyeX, rightEyeX, eyeY, eyeSize);
        break;
      case "angry_look":
      case "furious":
      case "vein_popping":
      case "gritted_teeth":
      case "chibi_angry":
        // 怒りの目（鋭い）
        CharacterRenderer.drawAngryEyes(ctx, leftEyeX, rightEyeX, eyeY, eyeSize);
        break;
      case "surprised":
      case "surprised_mild":
      case "shocked_expression":
      case "dismayed_expression":
      case "aghast_expression":
      case "stunned_expression":
        // 驚きの目（大きく）
        CharacterRenderer.drawSurprisedEyes(ctx, leftEyeX, rightEyeX, eyeY, eyeSize);
        break;
      case "blushing":
      case "slight_blush":
      case "embarrassed_face":
      case "shy":
        // 恥ずかしがりの目（小さめ）
        CharacterRenderer.drawSmilingEyes(ctx, leftEyeX, rightEyeX, eyeY, eyeSize);
        break;
      case "determined":
      case "serious":
      case "confident":
        // 決意の目（太い線）
        CharacterRenderer.drawAngryEyes(ctx, leftEyeX, rightEyeX, eyeY, eyeSize);
        break;
      case "thoughtful":
      case "worried_face":
      case "nervous_face":
        // 考え中の目
        CharacterRenderer.drawSadEyes(ctx, leftEyeX, rightEyeX, eyeY, eyeSize);
        break;
      case "excited":
      case "heart_eyes":
        // 興奮の目（大きく）
        CharacterRenderer.drawSurprisedEyes(ctx, leftEyeX, rightEyeX, eyeY, eyeSize);
        break;
      case "neutral_expression":
      case "deadpan":
      case "frown":
      case "pouting":
      case "relieved":
      case "disappointed":
      case "frustrated":
      case "scared":
      default:
        // 通常の目
        CharacterRenderer.drawSimpleEyes(ctx, headX, headY, headSize, character.facing || "front");
    }
  }

  // 🎯 表情に応じた口の描画（元の座標システム + 表情変化）
  static drawExpressionMouth(
    ctx: CanvasRenderingContext2D, 
    character: Character, 
    headX: number, 
    headY: number, 
    headSize: number, 
    expression: string,
    mouthState: string
  ) {
    // 🔧 元の座標システムを使用
    const mouthY = headY + headSize * 0.6;
    const mouthX = headX + headSize * 0.5;
    const mouthWidth = headSize * 0.15;
    
    // 表情に応じた口の描画（シーンテンプレート対応版）
    switch (expression) {
      case "smiling":
        // 笑顔の口（上向きの弧）
        CharacterRenderer.drawSmilingMouth(ctx, mouthX, mouthY, mouthWidth);
        break;
      case "sad":
        // 悲しい口（下向きの弧）
        CharacterRenderer.drawSadMouth(ctx, mouthX, mouthY, mouthWidth);
        break;
      case "angry_look":
        // 怒りの口（直線）
        CharacterRenderer.drawAngryMouth(ctx, mouthX, mouthY, mouthWidth);
        break;
      case "surprised":
        // 驚きの口（丸）
        CharacterRenderer.drawSurprisedMouth(ctx, mouthX, mouthY, mouthWidth);
        break;
      case "neutral_expression":
      default:
        // 通常の口
        CharacterRenderer.drawSimpleMouth(ctx, headX, headY, headSize, character.facing || "front");
    }
  }



  // 🎯 笑顔の目（線なし・自然な描画）
  static drawSmilingEyes(ctx: CanvasRenderingContext2D, leftEyeX: number, rightEyeX: number, eyeY: number, eyeSize: number) {
    // 白目
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    // 線を除去
    
    // 黒目（細め）
    ctx.fillStyle = "#2E2E2E";
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeSize * 0.5, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, eyeSize * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // ハイライト（自然な位置）
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(leftEyeX - eyeSize * 0.2, eyeY - eyeSize * 0.2, eyeSize * 0.2, 0, Math.PI * 2);
    ctx.arc(rightEyeX - eyeSize * 0.2, eyeY - eyeSize * 0.2, eyeSize * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 🎯 悲しい目
  static drawSadEyes(ctx: CanvasRenderingContext2D, leftEyeX: number, rightEyeX: number, eyeY: number, eyeSize: number) {
    // 白目
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY + 2, eyeSize, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY + 2, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    // 線を除去
    
    // 黒目（下向き）
    ctx.fillStyle = "#2E2E2E";
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY + 2, eyeSize * 0.6, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY + 2, eyeSize * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 🎯 怒りの目
  static drawAngryEyes(ctx: CanvasRenderingContext2D, leftEyeX: number, rightEyeX: number, eyeY: number, eyeSize: number) {
    // 白目
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    // 線を除去
    
    // 黒目（鋭い）
    ctx.fillStyle = "#2E2E2E";
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeSize * 0.8, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, eyeSize * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // 🎯 驚きの目
  static drawSurprisedEyes(ctx: CanvasRenderingContext2D, leftEyeX: number, rightEyeX: number, eyeY: number, eyeSize: number) {
    // 白目
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeSize * 1.2, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, eyeSize * 1.2, 0, Math.PI * 2);
    ctx.fill();
    // 線を除去
    
    // 黒目（大きく）
    ctx.fillStyle = "#2E2E2E";
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeSize * 0.8, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, eyeSize * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // 🎯 恥ずかしがりの目
  static drawEmbarrassedEyes(ctx: CanvasRenderingContext2D, leftEyeX: number, rightEyeX: number, eyeY: number, eyeSize: number) {
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    // 線を除去
    
    ctx.fillStyle = "#2E2E2E";
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeSize * 0.4, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, eyeSize * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 🎯 決意の目
  static drawDeterminedEyes(ctx: CanvasRenderingContext2D, leftEyeX: number, rightEyeX: number, eyeY: number, eyeSize: number) {
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    // 線を除去
    
    ctx.fillStyle = "#2E2E2E";
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeSize * 0.7, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, eyeSize * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // 🎯 考え中の目
  static drawThoughtfulEyes(ctx: CanvasRenderingContext2D, leftEyeX: number, rightEyeX: number, eyeY: number, eyeSize: number) {
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    // 線を除去
    
    ctx.fillStyle = "#2E2E2E";
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeSize * 0.6, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, eyeSize * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 🎯 興奮の目
  static drawExcitedEyes(ctx: CanvasRenderingContext2D, leftEyeX: number, rightEyeX: number, eyeY: number, eyeSize: number) {
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeSize * 1.1, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, eyeSize * 1.1, 0, Math.PI * 2);
    ctx.fill();
    // 線を除去
    
    ctx.fillStyle = "#2E2E2E";
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeSize * 0.7, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, eyeSize * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // 🎯 笑顔の口
  static drawSmilingMouth(ctx: CanvasRenderingContext2D, mouthX: number, mouthY: number, mouthWidth: number) {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(mouthX, mouthY, mouthWidth, 0, Math.PI);
    ctx.stroke();
  }

  // 🎯 悲しい口
  static drawSadMouth(ctx: CanvasRenderingContext2D, mouthX: number, mouthY: number, mouthWidth: number) {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(mouthX, mouthY + 5, mouthWidth, Math.PI, 0);
    ctx.stroke();
  }

  // 🎯 怒りの口
  static drawAngryMouth(ctx: CanvasRenderingContext2D, mouthX: number, mouthY: number, mouthWidth: number) {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mouthX - mouthWidth, mouthY);
    ctx.lineTo(mouthX + mouthWidth, mouthY);
    ctx.stroke();
  }

  // 🎯 驚きの口
  static drawSurprisedMouth(ctx: CanvasRenderingContext2D, mouthX: number, mouthY: number, mouthWidth: number) {
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(mouthX, mouthY, mouthWidth * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }



  static drawSimpleEyes(ctx: CanvasRenderingContext2D, headX: number, headY: number, headSize: number, direction: string) {
  const eyeSize = headSize * 0.06;
  const eyeY = headY + headSize * 0.35;
  
  if (direction !== "left" && direction !== "leftBack") {
    const leftEyeX = headX + headSize * 0.3;
    
    // 白目（線なし）
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    // 黒目（瞳）
    ctx.fillStyle = "#2E2E2E";
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeSize * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    // ハイライト
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(leftEyeX - eyeSize * 0.2, eyeY - eyeSize * 0.2, eyeSize * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  if (direction !== "right" && direction !== "rightBack") {
    const rightEyeX = headX + headSize * 0.7;
    
    // 白目（線なし）
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(rightEyeX, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    // 黒目（瞳）
    ctx.fillStyle = "#2E2E2E";
    ctx.beginPath();
    ctx.arc(rightEyeX, eyeY, eyeSize * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    // ハイライト
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(rightEyeX - eyeSize * 0.2, eyeY - eyeSize * 0.2, eyeSize * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

  static drawSimpleMouth(ctx: CanvasRenderingContext2D, headX: number, headY: number, headSize: number, expression: string) {
    const mouthX = headX + headSize * 0.5;
    const mouthY = headY + headSize * 0.6;
    
    ctx.strokeStyle = "#D84315";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    switch (expression) {
      case "smile":
        ctx.arc(mouthX, mouthY - headSize * 0.01, headSize * 0.05, 0, Math.PI);
        break;
      case "sad":
        ctx.arc(mouthX, mouthY + headSize * 0.02, headSize * 0.03, Math.PI, 0);
        break;
      default:
        ctx.arc(mouthX, mouthY, headSize * 0.02, 0, Math.PI);
    }
    ctx.stroke();
  }

  static drawBodyHalf(ctx: CanvasRenderingContext2D, character: Character, charX: number, charY: number, charWidth: number, charHeight: number, bodyStartY: number) {
    const bodyWidth = charWidth * 1.0; // 0.7 → 1.0 に拡大
    const bodyHeight = charHeight * 0.8; // 0.55 → 0.8 に拡大
    const bodyX = charX + charWidth / 2 - bodyWidth / 2;
    
    // 🎨 男女で服の色を分ける
    const { bodyColor, isFemale } = CharacterUtils.getCharacterDisplayConfig(character);
    const strokeColor = isFemale ? "#C2185B" : "#2E7D32";
    
    ctx.fillStyle = bodyColor;
    ctx.fillRect(bodyX, bodyStartY, bodyWidth, bodyHeight);
    ctx.strokeStyle = strokeColor;
    ctx.strokeRect(bodyX, bodyStartY, bodyWidth, bodyHeight);
  }

  static drawBodyFull(ctx: CanvasRenderingContext2D, character: Character, charX: number, charY: number, charWidth: number, charHeight: number, bodyStartY: number) {
    // 上半身
    CharacterRenderer.drawBodyHalf(ctx, character, charX, charY, charWidth, charHeight * 0.5, bodyStartY);
    
    // 下半身（簡略版）
    const legWidth = charWidth * 0.8; // 0.5 → 0.8 に拡大
    const legHeight = charHeight * 0.6; // 0.4 → 0.6 に拡大
    const legX = charX + charWidth / 2 - legWidth / 2;
    const legY = bodyStartY + charHeight * 0.3;
    
    ctx.fillStyle = "#1976D2";
    ctx.fillRect(legX, legY, legWidth, legHeight);
  }

  // ===== 統合されたハンドル判定メソッド =====
  
  // 🎯 統合ハンドルクリック判定（追加）
    static isCharacterHandleClicked(
    mouseX: number,
    mouseY: number,
    character: Character,
    panel: Panel
    ): { isClicked: boolean; type: "none" | "resize" | "rotate"; direction?: string } {
    return CharacterBounds.getHandleClickInfo(mouseX, mouseY, character, panel);
    }

  // 🎯 キャラクター検索（統合版）
  static findCharacterAt(
    mouseX: number,
    mouseY: number,
    characters: Character[],
    panels: Panel[]
  ): Character | null {
    return CharacterBounds.findCharacterAt(mouseX, mouseY, characters, panels);
  }

  // 🔧 リサイズ処理（分離クラス活用版）
  static resizeCharacter(
    character: Character,
    direction: string,
    deltaX: number,
    deltaY: number,
    originalBounds: { x: number; y: number; width: number; height: number }
  ): Character {
    let newWidth = originalBounds.width;
    let newHeight = originalBounds.height;
    const minWidth = 30;
    const minHeight = 40;

    console.log("🔧 キャラクターリサイズ実行:", { direction, deltaX, deltaY });

    switch (direction) {
      case "nw": 
        newWidth = Math.max(minWidth, originalBounds.width - deltaX);
        newHeight = Math.max(minHeight, originalBounds.height - deltaY);
        break;
      case "n": 
        newHeight = Math.max(minHeight, originalBounds.height - deltaY);
        break;
      case "ne": 
        newWidth = Math.max(minWidth, originalBounds.width + deltaX);
        newHeight = Math.max(minHeight, originalBounds.height - deltaY);
        break;
      case "e": 
        newWidth = Math.max(minWidth, originalBounds.width + deltaX);
        break;
      case "se": 
        newWidth = Math.max(minWidth, originalBounds.width + deltaX);
        newHeight = Math.max(minHeight, originalBounds.height + deltaY);
        break;
      case "s": 
        newHeight = Math.max(minHeight, originalBounds.height + deltaY);
        break;
      case "sw": 
        newWidth = Math.max(minWidth, originalBounds.width - deltaX);
        newHeight = Math.max(minHeight, originalBounds.height + deltaY);
        break;
      case "w": 
        newWidth = Math.max(minWidth, originalBounds.width - deltaX);
        break;
    }

    return { ...character, width: newWidth, height: newHeight };
  }

  // ===== ユーティリティメソッド（分離クラス活用） =====
  
  static getCharacterWidth = CharacterUtils.getCharacterWidth;
  static getCharacterHeight = CharacterUtils.getCharacterHeight;
  
  // 後方互換性メソッド
  static isResizeHandleClicked(mouseX: number, mouseY: number, character: Character, panel: Panel): boolean {
    const result = CharacterBounds.isResizeHandleClicked(mouseX, mouseY, character, panel);
    return result.isClicked;
  }

  static isCharacterResizeHandleClicked(mouseX: number, mouseY: number, character: Character, panel: Panel) {
    return CharacterBounds.isResizeHandleClicked(mouseX, mouseY, character, panel);
  }
}