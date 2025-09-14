// src/utils/PanelFittingUtils.ts - コマ貼り付け機能ユーティリティ
import { Panel, ToneElement, EffectElement, BackgroundElement } from '../types';

/**
 * 要素の位置・サイズ情報
 */
export interface ElementPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * フィット設定オプション
 */
export interface FitOptions {
  padding?: number;           // パネル内余白（デフォルト: 0.05 = 5%）
  maintainAspectRatio?: boolean; // アスペクト比維持（デフォルト: false）
  centerPosition?: boolean;   // 中央配置（デフォルト: true）
  maxScale?: number;         // 最大スケール（デフォルト: 0.9 = 90%）
  minScale?: number;         // 最小スケール（デフォルト: 0.1 = 10%）
}

/**
 * デフォルトフィット設定
 */
const DEFAULT_FIT_OPTIONS: Required<FitOptions> = {
  padding: 0.05,              // 5%の余白
  maintainAspectRatio: false,
  centerPosition: true,
  maxScale: 0.9,              // 最大90%
  minScale: 0.1,              // 最小10%
};

/**
 * パネル内の相対座標システム（0.0 - 1.0）でのフィット計算
 */
export class PanelFittingUtils {
  
  /**
   * 🎨 トーンをパネルにフィットさせる
   */
  static fitToneToPanel(
    panel: Panel,
    options: FitOptions = {}
  ): ElementPosition {
    const opts = { ...DEFAULT_FIT_OPTIONS, ...options };
    
    // トーン用デフォルトサイズ（パネルの60%をカバー）
    const defaultSize = {
      width: 0.6,
      height: 0.6
    };
    
    return this.calculateFitPosition(defaultSize, opts);
  }

  /**
   * ⚡ 効果線をパネルにフィットさせる（効果線タイプ別最適化）
   */
  static fitEffectToPanel(
    panel: Panel,
    effectType: string,
    options: FitOptions = {}
  ): ElementPosition {
    const opts = { ...DEFAULT_FIT_OPTIONS, ...options };
    
    // 効果線タイプ別のデフォルトサイズ
    const getEffectSize = (type: string) => {
      switch (type) {
        case 'speed':
          return { width: 0.8, height: 0.3 }; // 横長（スピード線）
        case 'focus':
          return { width: 0.9, height: 0.9 }; // 大きめ（集中線）
        case 'explosion':
          return { width: 0.7, height: 0.7 }; // 正方形に近い（爆発）
        case 'flash':
          return { width: 0.6, height: 0.6 }; // 中サイズ（フラッシュ）
        default:
          return { width: 0.6, height: 0.6 }; // デフォルト
      }
    };
    
    const effectSize = getEffectSize(effectType);
    return this.calculateFitPosition(effectSize, opts);
  }

  /**
   * 🖼️ 背景をパネルにフィットさせる
   */
  static fitBackgroundToPanel(
    panel: Panel,
    options: FitOptions = {}
  ): ElementPosition {
    // 背景は少し余裕を持たせてパネル全体をカバー
    const opts = { 
      ...DEFAULT_FIT_OPTIONS, 
      padding: -0.02,    // 2%はみ出させる
      maxScale: 1.02,    // 102%まで許可
      ...options 
    };
    
    const backgroundSize = {
      width: 1.0,        // パネル全体
      height: 1.0
    };
    
    return this.calculateFitPosition(backgroundSize, opts);
  }

  /**
   * 📐 基本的なフィット位置計算
   */
  private static calculateFitPosition(
    elementSize: { width: number; height: number },
    options: Required<FitOptions>
  ): ElementPosition {
    const { padding, centerPosition, maxScale, minScale } = options;
    
    // 利用可能エリア計算
    const availableWidth = 1.0 - (padding * 2);
    const availableHeight = 1.0 - (padding * 2);
    
    // サイズ調整
    let finalWidth = Math.max(minScale, Math.min(elementSize.width, maxScale));
    let finalHeight = Math.max(minScale, Math.min(elementSize.height, maxScale));
    
    // 利用可能エリアに収まるように調整
    if (finalWidth > availableWidth) {
      const scale = availableWidth / finalWidth;
      finalWidth = availableWidth;
      finalHeight = finalHeight * scale;
    }
    
    if (finalHeight > availableHeight) {
      const scale = availableHeight / finalHeight;
      finalHeight = availableHeight;
      finalWidth = finalWidth * scale;
    }
    
    // 位置計算
    let x: number, y: number;
    
    if (centerPosition) {
      // 中央配置
      x = padding + (availableWidth - finalWidth) / 2;
      y = padding + (availableHeight - finalHeight) / 2;
    } else {
      // 左上配置
      x = padding;
      y = padding;
    }
    
    return {
      x: Math.max(0, Math.min(x, 1 - finalWidth)),
      y: Math.max(0, Math.min(y, 1 - finalHeight)),
      width: finalWidth,
      height: finalHeight
    };
  }

  /**
   * 🔄 既存要素との重なり回避配置
   */
  static findOptimalPosition(
    panel: Panel,
    newElementSize: { width: number; height: number },
    existingElements: ElementPosition[] = [],
    options: FitOptions = {}
  ): ElementPosition {
    const basePosition = this.calculateFitPosition(newElementSize, {
      ...DEFAULT_FIT_OPTIONS,
      ...options
    });
    
    // 重なりチェック
    const hasOverlap = (pos: ElementPosition) => {
      return existingElements.some(existing => 
        !(pos.x + pos.width <= existing.x ||
          existing.x + existing.width <= pos.x ||
          pos.y + pos.height <= existing.y ||
          existing.y + existing.height <= pos.y)
      );
    };
    
    // 重なりがない場合はそのまま返す
    if (!hasOverlap(basePosition)) {
      return basePosition;
    }
    
    // 重なりがある場合は少しずらした位置を試す
    const offsets = [
      { x: 0.1, y: 0 },     // 右
      { x: -0.1, y: 0 },    // 左
      { x: 0, y: 0.1 },     // 下
      { x: 0, y: -0.1 },    // 上
      { x: 0.1, y: 0.1 },   // 右下
      { x: -0.1, y: -0.1 }, // 左上
      { x: 0.1, y: -0.1 },  // 右上
      { x: -0.1, y: 0.1 },  // 左下
    ];
    
    for (const offset of offsets) {
      const testPosition = {
        x: Math.max(0, Math.min(basePosition.x + offset.x, 1 - basePosition.width)),
        y: Math.max(0, Math.min(basePosition.y + offset.y, 1 - basePosition.height)),
        width: basePosition.width,
        height: basePosition.height
      };
      
      if (!hasOverlap(testPosition)) {
        return testPosition;
      }
    }
    
    // 適切な位置が見つからない場合は基本位置を返す
    return basePosition;
  }

  /**
   * 📊 パネル内の要素密度チェック
   */
  static checkElementDensity(
    panel: Panel,
    elements: ElementPosition[]
  ): {
    coverage: number;      // カバー率 (0.0 - 1.0)
    density: 'low' | 'medium' | 'high' | 'crowded';
    canFitMore: boolean;   // 新しい要素を追加可能か
  } {
    if (elements.length === 0) {
      return { coverage: 0, density: 'low', canFitMore: true };
    }
    
    // 重複を考慮した実際のカバー面積を計算
    const totalArea = this.calculateTotalCoverage(elements);
    
    let density: 'low' | 'medium' | 'high' | 'crowded';
    let canFitMore: boolean;
    
    if (totalArea < 0.3) {
      density = 'low';
      canFitMore = true;
    } else if (totalArea < 0.6) {
      density = 'medium';
      canFitMore = true;
    } else if (totalArea < 0.8) {
      density = 'high';
      canFitMore = true;
    } else {
      density = 'crowded';
      canFitMore = false;
    }
    
    return { coverage: totalArea, density, canFitMore };
  }

  /**
   * 🧮 重複を考慮した総カバー面積計算
   */
  private static calculateTotalCoverage(elements: ElementPosition[]): number {
    if (elements.length === 0) return 0;
    if (elements.length === 1) return elements[0].width * elements[0].height;
    
    // 簡易的な実装：最大の要素面積を返す
    // 完全な実装には Union-Find や座標スウィープが必要
    return Math.max(...elements.map(el => el.width * el.height));
  }

  /**
   * 🎯 スマート配置：タイプ別最適化
   */
  static smartPlacement(
    panel: Panel,
    elementType: 'tone' | 'effect' | 'background',
    elementSubtype: string = '',
    existingElements: {
      tones: ToneElement[];
      effects: EffectElement[];
      backgrounds: BackgroundElement[];
    } = { tones: [], effects: [], backgrounds: [] },
    options: FitOptions = {}
  ): ElementPosition {
    
    // 既存要素の位置を取得
    const existingPositions: ElementPosition[] = [
      ...existingElements.tones.map(t => ({ x: t.x, y: t.y, width: t.width, height: t.height })),
      ...existingElements.effects.map(e => ({ x: e.x, y: e.y, width: e.width, height: e.height })),
      ...existingElements.backgrounds.map(b => ({ x: b.x, y: b.y, width: b.width, height: b.height }))
    ];
    
    // 要素密度チェック
    const densityInfo = this.checkElementDensity(panel, existingPositions);
    
    if (!densityInfo.canFitMore) {
      console.warn(`⚠️ パネル${panel.id}は要素が密集しています (カバー率: ${Math.round(densityInfo.coverage * 100)}%)`);
    }
    
    // タイプ別配置
    let basePosition: ElementPosition;
    
    switch (elementType) {
      case 'tone':
        basePosition = this.fitToneToPanel(panel, options);
        break;
      case 'effect':
        basePosition = this.fitEffectToPanel(panel, elementSubtype, options);
        break;
      case 'background':
        basePosition = this.fitBackgroundToPanel(panel, options);
        break;
      default:
        basePosition = this.calculateFitPosition({ width: 0.5, height: 0.5 }, {
          ...DEFAULT_FIT_OPTIONS,
          ...options
        });
    }
    
    // 重なり回避
    const optimalPosition = this.findOptimalPosition(
      panel, 
      { width: basePosition.width, height: basePosition.height },
      existingPositions,
      options
    );
    
    console.log(`✨ ${elementType}を配置: パネル${panel.id} (${Math.round(optimalPosition.x * 100)}, ${Math.round(optimalPosition.y * 100)}) サイズ(${Math.round(optimalPosition.width * 100)}%, ${Math.round(optimalPosition.height * 100)}%)`);
    
    return optimalPosition;
  }

  /**
   * 📏 要素がパネル内に収まっているかチェック
   */
  static isElementInsidePanel(
    element: ElementPosition,
    tolerance: number = 0.01
  ): boolean {
    return (
      element.x >= -tolerance &&
      element.y >= -tolerance &&
      element.x + element.width <= 1 + tolerance &&
      element.y + element.height <= 1 + tolerance
    );
  }

  /**
   * 🔧 要素をパネル境界内に強制調整
   */
  static constrainToPanel(element: ElementPosition): ElementPosition {
    return {
      x: Math.max(0, Math.min(element.x, 1 - element.width)),
      y: Math.max(0, Math.min(element.y, 1 - element.height)),
      width: Math.max(0.05, Math.min(element.width, 1)), // 最小5%
      height: Math.max(0.05, Math.min(element.height, 1))
    };
  }

  /**
   * 📐 絶対座標 ↔ 相対座標変換
   */
  static absoluteToRelative(
    absolutePos: { x: number; y: number; width: number; height: number },
    panel: Panel
  ): ElementPosition {
    return {
      x: (absolutePos.x - panel.x) / panel.width,
      y: (absolutePos.y - panel.y) / panel.height,
      width: absolutePos.width / panel.width,
      height: absolutePos.height / panel.height
    };
  }

  static relativeToAbsolute(
    relativePos: ElementPosition,
    panel: Panel
  ): { x: number; y: number; width: number; height: number } {
    return {
      x: panel.x + relativePos.x * panel.width,
      y: panel.y + relativePos.y * panel.height,
      width: relativePos.width * panel.width,
      height: relativePos.height * panel.height
    };
  }
}

export default PanelFittingUtils;