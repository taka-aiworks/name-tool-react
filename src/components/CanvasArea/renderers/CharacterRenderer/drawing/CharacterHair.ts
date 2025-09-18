// src/components/CanvasArea/renderers/CharacterRenderer/drawing/CharacterHair.ts
// 💇 キャラクター髪の毛描画専用クラス（型修正版）

import { Character } from "../../../../../types";

export class CharacterHair {
  
  // 🎯 髪の毛描画メイン制御
  static drawHair(
    ctx: CanvasRenderingContext2D,
    character: Character,
    headX: number,
    headY: number,
    headSize: number,
    direction: string
  ) {
    const { hairColor, hairStyle } = CharacterHair.getHairStyle(character);
    
    ctx.fillStyle = hairColor;

    // 髪型別描画
    switch (hairStyle) {
      case "long":
        CharacterHair.drawLongHair(ctx, headX, headY, headSize, direction);
        break;
      case "spiky":
        CharacterHair.drawSpikyHair(ctx, headX, headY, headSize, direction);
        break;
      case "curly":
        CharacterHair.drawCurlyHair(ctx, headX, headY, headSize, direction);
        break;
      case "short":
        CharacterHair.drawShortHair(ctx, headX, headY, headSize, direction);
        break;
      case "ponytail":
        CharacterHair.drawPonytailHair(ctx, headX, headY, headSize, direction);
        break;
      default:
        CharacterHair.drawNormalHair(ctx, headX, headY, headSize, direction);
    }
  }

  // 🎯 キャラクタータイプ別髪色・髪型決定
  static getHairStyle(character: Character): { hairColor: string; hairStyle: string } {
    let hairColor = "#8B4513"; // デフォルト茶色
    let hairStyle = "normal";
    
    switch (character.type) {
      case "heroine": 
        hairColor = "#D2691E"; // 明るい茶色
        hairStyle = "long";
        break;
      case "rival": 
        hairColor = "#2F4F4F"; // ダークグレー
        hairStyle = "spiky";
        break;
      case "friend":
        hairColor = "#A0522D"; // 赤茶色
        hairStyle = "curly";
        break;
      case "mentor":
        hairColor = "#696969"; // グレー
        hairStyle = "short";
        break;
      case "sister":
        hairColor = "#CD853F"; // 薄茶色
        hairStyle = "ponytail";
        break;
      default: 
        hairColor = "#8B4513";
        hairStyle = "normal";
    }
    
    return { hairColor, hairStyle };
  }

  // 💇 普通の髪（主人公）
  static drawNormalHair(
    ctx: CanvasRenderingContext2D, 
    headX: number, 
    headY: number, 
    headSize: number, 
    direction: string
  ) {
    const hairHeight = headSize * 0.4;
    const hairWidth = headSize * 0.8;
    
    switch (direction) {
      case "back":
      case "leftBack":
      case "rightBack":
        // 後ろ向き：髪の毛全体をカバー
        ctx.beginPath();
        ctx.roundRect(headX + headSize * 0.1, headY, hairWidth, headSize * 0.8, 8);
        ctx.fill();
        break;
        
      case "left":
        // 左向き：左側の髪のみ
        ctx.beginPath();
        ctx.roundRect(headX, headY, hairWidth * 0.7, hairHeight, 6);
        ctx.fill();
        break;
        
      case "right":
        // 右向き：右側の髪のみ
        ctx.beginPath();
        ctx.roundRect(headX + headSize * 0.3, headY, hairWidth * 0.7, hairHeight, 6);
        ctx.fill();
        break;
        
      default: // front, leftFront, rightFront
        // 正面：前髪とサイド
        ctx.beginPath();
        ctx.roundRect(headX + headSize * 0.1, headY, hairWidth, hairHeight, 6);
        ctx.fill();
    }
  }

  // 💇 長い髪（ヒロイン）
  static drawLongHair(
    ctx: CanvasRenderingContext2D, 
    headX: number, 
    headY: number, 
    headSize: number, 
    direction: string
  ) {
    const hairHeight = headSize * 0.5;
    const hairWidth = headSize * 0.9;
    
    // 基本の髪（トップ）
    ctx.beginPath();
    ctx.roundRect(headX + headSize * 0.05, headY, hairWidth, hairHeight, 8);
    ctx.fill();
    
    // 後ろ向きでなければサイドの長い髪も描画
    if (direction !== "back" && direction !== "leftBack" && direction !== "rightBack") {
      const sideHairW = headSize * 0.15;
      const sideHairH = headSize * 0.8;
      
      // 左サイドの髪
      ctx.beginPath();
      ctx.roundRect(headX - sideHairW / 2, headY + headSize * 0.3, sideHairW, sideHairH, 4);
      ctx.fill();
      
      // 右サイドの髪
      ctx.beginPath();
      ctx.roundRect(headX + headSize - sideHairW / 2, headY + headSize * 0.3, sideHairW, sideHairH, 4);
      ctx.fill();
      
      // 髪の流れを表現する線
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.7;
      
      for (let i = 0; i < 3; i++) {
        const lineY = headY + headSize * (0.4 + i * 0.15);
        ctx.beginPath();
        ctx.moveTo(headX + headSize * 0.2, lineY);
        ctx.quadraticCurveTo(
          headX + headSize * 0.3, 
          lineY + headSize * 0.1, 
          headX + headSize * 0.15, 
          lineY + headSize * 0.2
        );
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(headX + headSize * 0.8, lineY);
        ctx.quadraticCurveTo(
          headX + headSize * 0.7, 
          lineY + headSize * 0.1, 
          headX + headSize * 0.85, 
          lineY + headSize * 0.2
        );
        ctx.stroke();
      }
      
      ctx.globalAlpha = 1.0;
    }
  }

  // 💇 尖った髪（ライバル）
  static drawSpikyHair(
    ctx: CanvasRenderingContext2D, 
    headX: number, 
    headY: number, 
    headSize: number, 
    direction: string
  ) {
    // 後ろ向きの場合は普通の髪で代用
    if (direction === "back" || direction === "leftBack" || direction === "rightBack") {
      CharacterHair.drawNormalHair(ctx, headX, headY, headSize, direction);
      return;
    }
    
    // 尖った髪の毛を複数描画
    const spikeCount = 6;
    for (let i = 0; i < spikeCount; i++) {
      const spikeX = headX + headSize * (0.1 + i * 0.15);
      const spikeY = headY;
      const spikeW = headSize * 0.08;
      const spikeH = headSize * (0.25 + Math.random() * 0.1); // 少しランダムな高さ
      
      ctx.beginPath();
      ctx.moveTo(spikeX, spikeY + spikeH);
      ctx.lineTo(spikeX + spikeW / 2, spikeY);
      ctx.lineTo(spikeX + spikeW, spikeY + spikeH);
      ctx.closePath();
      ctx.fill();
      
      // 影効果
      ctx.fillStyle = CharacterHair.darkenColor(ctx.fillStyle as string, 0.2);
      ctx.beginPath();
      ctx.moveTo(spikeX + spikeW * 0.6, spikeY + spikeH);
      ctx.lineTo(spikeX + spikeW / 2, spikeY);
      ctx.lineTo(spikeX + spikeW, spikeY + spikeH);
      ctx.closePath();
      ctx.fill();
      
      // 元の色に戻す
      const { hairColor } = CharacterHair.getHairStyle({ type: "rival" } as Character);
      ctx.fillStyle = hairColor;
    }
  }

  // 💇 ウェーブ髪（友人）
  static drawCurlyHair(
    ctx: CanvasRenderingContext2D, 
    headX: number, 
    headY: number, 
    headSize: number, 
    direction: string
  ) {
    const hairHeight = headSize * 0.45;
    const hairWidth = headSize * 0.85;
    
    // ベースの髪
    ctx.beginPath();
    ctx.roundRect(headX + headSize * 0.075, headY, hairWidth, hairHeight, 10);
    ctx.fill();
    
    // 後ろ向きでなければウェーブの装飾を追加
    if (direction !== "back" && direction !== "leftBack" && direction !== "rightBack") {
      const originalFillStyle = ctx.fillStyle;
      ctx.fillStyle = CharacterHair.lightenColor(originalFillStyle as string, 0.1);
      
      // ウェーブパターンを描画
      for (let row = 0; row < 4; row++) {
        const waveY = headY + headSize * (0.08 + row * 0.08);
        const waveCount = 4;
        
        for (let i = 0; i < waveCount; i++) {
          const waveX = headX + headSize * (0.15 + i * 0.18);
          const waveSize = headSize * 0.025;
          
          ctx.beginPath();
          ctx.arc(waveX, waveY, waveSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      ctx.fillStyle = originalFillStyle;
    }
  }

  // 💇 短髪（先輩・メンター）
  static drawShortHair(
    ctx: CanvasRenderingContext2D, 
    headX: number, 
    headY: number, 
    headSize: number, 
    direction: string
  ) {
    const hairHeight = headSize * 0.3;
    const hairWidth = headSize * 0.75;
    
    switch (direction) {
      case "back":
      case "leftBack":
      case "rightBack":
        // 後ろ向き：短くて自然な髪
        ctx.beginPath();
        ctx.roundRect(headX + headSize * 0.125, headY, hairWidth, headSize * 0.6, 6);
        ctx.fill();
        break;
        
      case "left":
        // 左向き：左側のみ
        ctx.beginPath();
        ctx.roundRect(headX + headSize * 0.05, headY, hairWidth * 0.6, hairHeight, 4);
        ctx.fill();
        break;
        
      case "right":
        // 右向き：右側のみ
        ctx.beginPath();
        ctx.roundRect(headX + headSize * 0.35, headY, hairWidth * 0.6, hairHeight, 4);
        ctx.fill();
        break;
        
      default:
        // 正面：きちんとした短髪
        ctx.beginPath();
        ctx.roundRect(headX + headSize * 0.125, headY, hairWidth, hairHeight, 4);
        ctx.fill();
        
        // 分け目を表現
        ctx.strokeStyle = CharacterHair.darkenColor(ctx.fillStyle as string, 0.3);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(headX + headSize * 0.5, headY + headSize * 0.02);
        ctx.lineTo(headX + headSize * 0.48, headY + hairHeight * 0.7);
        ctx.stroke();
    }
  }

  // 💇 ポニーテール（妹キャラ）
  static drawPonytailHair(
    ctx: CanvasRenderingContext2D, 
    headX: number, 
    headY: number, 
    headSize: number, 
    direction: string
  ) {
    const hairHeight = headSize * 0.35;
    const hairWidth = headSize * 0.8;
    
    // 基本の髪（前髪・サイド）
    ctx.beginPath();
    ctx.roundRect(headX + headSize * 0.1, headY, hairWidth, hairHeight, 6);
    ctx.fill();
    
    // ポニーテール部分
    switch (direction) {
      case "back":
      case "leftBack":
      case "rightBack":
        // 後ろ向き：ポニーテールが見える
        const ponytailX = headX + headSize * 0.5;
        const ponytailY = headY + headSize * 0.4;
        const ponytailW = headSize * 0.12;
        const ponytailH = headSize * 0.5;
        
        ctx.beginPath();
        ctx.roundRect(ponytailX - ponytailW/2, ponytailY, ponytailW, ponytailH, 3);
        ctx.fill();
        
        // ゴム部分
        ctx.fillStyle = "#8B4513";
        ctx.beginPath();
        ctx.roundRect(ponytailX - ponytailW/2 - 1, ponytailY, ponytailW + 2, headSize * 0.05, 2);
        ctx.fill();
        break;
        
      case "left":
        // 左向き：右側のポニーテール
        const leftPonytailX = headX + headSize * 0.85;
        const leftPonytailY = headY + headSize * 0.4;
        
        ctx.beginPath();
        ctx.roundRect(leftPonytailX, leftPonytailY, headSize * 0.08, headSize * 0.4, 3);
        ctx.fill();
        break;
        
      case "right":
        // 右向き：左側のポニーテール
        const rightPonytailX = headX + headSize * 0.05;
        const rightPonytailY = headY + headSize * 0.4;
        
        ctx.beginPath();
        ctx.roundRect(rightPonytailX, rightPonytailY, headSize * 0.08, headSize * 0.4, 3);
        ctx.fill();
        break;
        
      default:
        // 正面：ポニーテールは見えないが髪の束ねた跡を表現
        ctx.strokeStyle = CharacterHair.darkenColor(ctx.fillStyle as string, 0.2);
        ctx.lineWidth = 1;
        
        // 髪をまとめた跡の線
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(headX + headSize * (0.3 + i * 0.2), headY + headSize * 0.25);
          ctx.quadraticCurveTo(
            headX + headSize * 0.5, 
            headY + headSize * 0.35, 
            headX + headSize * (0.3 + i * 0.2), 
            headY + headSize * 0.4
          );
          ctx.stroke();
        }
    }
  }

  // 🎨 色調整ヘルパー関数
  static darkenColor(color: string, factor: number): string {
    // 簡易的な色の暗化処理
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      
      const newR = Math.max(0, Math.floor(r * (1 - factor)));
      const newG = Math.max(0, Math.floor(g * (1 - factor)));
      const newB = Math.max(0, Math.floor(b * (1 - factor)));
      
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    return color;
  }

  static lightenColor(color: string, factor: number): string {
    // 簡易的な色の明化処理
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      
      const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
      const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
      const newB = Math.min(255, Math.floor(b + (255 - b) * factor));
      
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    return color;
  }

  // 🎯 髪色バリエーション取得
  static getHairColorVariations(): Record<string, string> {
    return {
      black: "#2C1B18",
      darkBrown: "#8B4513", 
      brown: "#D2691E",
      lightBrown: "#CD853F",
      blonde: "#F0E68C",
      red: "#B22222",
      auburn: "#A0522D",
      gray: "#696969",
      silver: "#C0C0C0",
      blue: "#4169E1",
      green: "#228B22",
      purple: "#8A2BE2"
    };
  }

  // 🎯 キャラクタータイプ別推奨髪色
  static getRecommendedHairColor(characterType: string): string {
    const colors = CharacterHair.getHairColorVariations();
    
    switch (characterType) {
      case "protagonist": return colors.brown;
      case "heroine": return colors.lightBrown;
      case "rival": return colors.darkBrown;
      case "friend": return colors.auburn;
      case "mentor": return colors.gray;
      case "sister": return colors.blonde;
      case "mysterious": return colors.silver;
      case "villain": return colors.black;
      default: return colors.brown;
    }
  }

  // 🎯 髪型リスト取得
  static getAvailableHairStyles(): Array<{
    id: string;
    name: string;
    description: string;
    suitableFor: string[];
  }> {
    return [
      {
        id: "normal",
        name: "普通の髪",
        description: "オーソドックスなショートヘア",
        suitableFor: ["protagonist", "friend"]
      },
      {
        id: "long", 
        name: "ロングヘア",
        description: "長くて美しい髪",
        suitableFor: ["heroine", "mysterious"]
      },
      {
        id: "spiky",
        name: "尖った髪", 
        description: "元気でワイルドな印象",
        suitableFor: ["rival", "protagonist"]
      },
      {
        id: "curly",
        name: "ウェーブヘア",
        description: "優しく親しみやすい印象", 
        suitableFor: ["friend", "sister"]
      },
      {
        id: "short",
        name: "短髪",
        description: "きちんとした大人の印象",
        suitableFor: ["mentor", "teacher"]
      },
      {
        id: "ponytail", 
        name: "ポニーテール",
        description: "活発で若々しい印象",
        suitableFor: ["sister", "athlete"]
      }
    ];
  }

  // 🎯 デバッグ用髪型情報出力（修正版）
  static debugHairInfo(character: Character, headSize: number): void {
    const { hairColor, hairStyle } = CharacterHair.getHairStyle(character);
    
    console.log(`💇 髪型デバッグ [${character.name}]:`, {
      characterType: character.type,
      hairStyle,
      hairColor,
      headSize: Math.round(headSize),
      bodyDirection: character.facing || "front" // 🔧 修正: bodyDirection/faceAngle → facing
    });
  }

  // 🎯 髪の毛アニメーション用（将来拡張）
  static calculateHairAnimation(
    character: Character,
    animationFrame: number,
    windStrength: number = 0
  ): {
    offsetX: number;
    offsetY: number;
    waveIntensity: number;
  } {
    const { hairStyle } = CharacterHair.getHairStyle(character);
    
    // 髪型に応じたアニメーション強度
    let animationStrength = 1.0;
    switch (hairStyle) {
      case "long": animationStrength = 1.5; break;
      case "curly": animationStrength = 0.7; break;
      case "short": animationStrength = 0.3; break;
      case "spiky": animationStrength = 0.5; break;
      default: animationStrength = 1.0;
    }
    
    const time = animationFrame * 0.1;
    const baseWave = Math.sin(time) * animationStrength;
    
    return {
      offsetX: baseWave * windStrength * 2,
      offsetY: Math.abs(baseWave) * windStrength,
      waveIntensity: baseWave * 0.5 + 0.5 // 0-1の範囲
    };
  }
}