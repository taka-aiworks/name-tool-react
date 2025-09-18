// ElementLabelRenderer.tsx - 要素ラベル表示コンポーネント（types.ts対応版）
import React from 'react';
import { BackgroundElement, EffectElement, ToneElement, Panel } from '../../../types';

interface ElementLabelRendererProps {
  backgrounds: BackgroundElement[];
  effects: EffectElement[];
  tones: ToneElement[];
  panels: Panel[];
  canvasScale: number;
}

const ElementLabelRenderer: React.FC<ElementLabelRendererProps> = ({
  backgrounds,
  effects,
  tones,
  panels,
  canvasScale
}) => {
  // パネル情報取得ヘルパー
  const getPanel = (panelId: number) => panels.find(p => p.id === panelId);

  // 背景タイプの日本語名取得（types.tsに基づく）
  const getBackgroundLabel = (bg: BackgroundElement): string => {
    switch (bg.type) {
      case 'solid':
        return `単色背景 (${bg.solidColor || '#000'})`;
      case 'gradient':
        const gradientType = bg.gradientType === 'radial' ? '放射状' : '線形';
        const direction = bg.gradientDirection === 0 ? '水平' : 
                         bg.gradientDirection === 90 ? '垂直' : 
                         bg.gradientDirection === 45 ? '斜め' : `${bg.gradientDirection}°`;
        return `${gradientType}グラデーション (${direction})`;
      case 'pattern':
        const patternNames = {
          'dots': 'ドット',
          'lines': '線',
          'grid': 'グリッド',
          'diagonal': '斜線',
          'crosshatch': 'クロスハッチ'
        };
        const patternName = patternNames[bg.patternType as keyof typeof patternNames] || bg.patternType;
        return `${patternName}パターン`;
      case 'image':
        return `画像背景 (${bg.imageMode || 'fit'})`;
      default:
        return '背景';
    }
  };

  // 効果線タイプの日本語名取得（types.tsに基づく）
  const getEffectLabel = (effect: EffectElement): string => {
    const typeNames = {
      'speed': 'スピード線',
      'focus': '集中線',
      'explosion': '爆発線',
      'flash': 'フラッシュ線'
    };
    
    const directionNames = {
      'horizontal': '水平',
      'vertical': '垂直',
      'radial': '放射状',
      'custom': 'カスタム'
    };
    
    const typeName = typeNames[effect.type] || effect.type;
    const directionName = directionNames[effect.direction] || effect.direction;
    
    return `${typeName} (${directionName})`;
  };

  // トーンパターンの日本語名取得（types.tsに基づく）
  const getToneLabel = (tone: ToneElement): string => {
    const patternNames = {
      // 網点系
      'dots_60': 'ドット60%',
      'dots_85': 'ドット85%',
      'dots_100': 'ドット100%',
      'dots_120': 'ドット120%',
      'dots_150': 'ドット150%',
      // 線系
      'lines_horizontal': '水平線',
      'lines_vertical': '垂直線',
      'lines_diagonal': '斜線',
      'lines_cross': 'クロス線',
      // グラデーション系
      'gradient_linear': '線形グラデーション',
      'gradient_radial': '放射状グラデーション',
      'gradient_diamond': 'ダイヤモンドグラデーション',
      // ノイズ系
      'noise_fine': '細かいノイズ',
      'noise_coarse': '粗いノイズ',
      'noise_grain': 'グレインノイズ',
      // 特殊効果
      'speed_lines': 'スピードライン',
      'focus_lines': 'フォーカスライン',
      'explosion': '爆発'
    };
    
    const patternName = patternNames[tone.pattern] || tone.pattern;
    return `${patternName}トーン`;
  };

  // 座標変換ヘルパー（相対座標→絶対座標）
  const getAbsolutePosition = (element: BackgroundElement | EffectElement | ToneElement) => {
    const panel = getPanel(element.panelId);
    if (!panel) return { x: element.x, y: element.y, width: element.width, height: element.height };

    // 相対座標（0-1）の場合はパネル内絶対座標に変換
    if (element.x <= 1 && element.y <= 1) {
      return {
        x: panel.x + (element.x * panel.width),
        y: panel.y + (element.y * panel.height),
        width: element.width <= 1 ? element.width * panel.width : element.width,
        height: element.height <= 1 ? element.height * panel.height : element.height
      };
    }
    
    // 既に絶対座標の場合はそのまま
    return { x: element.x, y: element.y, width: element.width, height: element.height };
  };

  return (
    <g className="element-labels">
      {/* 背景ラベル */}
      {backgrounds.map((bg, index) => {
        const pos = getAbsolutePosition(bg);
        return (
          <g key={`bg-label-${bg.id || index}`}>
            <rect
              x={pos.x + 10}
              y={pos.y + 10}
              width={150}
              height={24}
              fill="rgba(0, 0, 0, 0.8)"
              stroke="#ffffff"
              strokeWidth={1}
              rx={4}
            />
            <text
              x={pos.x + 85}
              y={pos.y + 26}
              textAnchor="middle"
              fill="white"
              fontSize={12}
              fontFamily="Arial, sans-serif"
              fontWeight="bold"
            >
              🎨 {getBackgroundLabel(bg)}
            </text>
          </g>
        );
      })}

      {/* 効果線ラベル */}
      {effects.map((effect, index) => {
        const pos = getAbsolutePosition(effect);
        return (
          <g key={`effect-label-${effect.id || index}`}>
            <rect
              x={pos.x + 10}
              y={pos.y + pos.height - 34}
              width={120}
              height={24}
              fill="rgba(255, 0, 0, 0.8)"
              stroke="#ffffff"
              strokeWidth={1}
              rx={4}
            />
            <text
              x={pos.x + 70}
              y={pos.y + pos.height - 18}
              textAnchor="middle"
              fill="white"
              fontSize={11}
              fontFamily="Arial, sans-serif"
              fontWeight="bold"
            >
              ⚡ {getEffectLabel(effect)}
            </text>
          </g>
        );
      })}

      {/* トーンラベル */}
      {tones.filter(tone => tone.visible !== false).map((tone, index) => {
        const pos = getAbsolutePosition(tone);
        return (
          <g key={`tone-label-${tone.id || index}`}>
            <rect
              x={pos.x + pos.width - 140}
              y={pos.y + 10}
              width={130}
              height={24}
              fill="rgba(0, 128, 255, 0.8)"
              stroke="#ffffff"
              strokeWidth={1}
              rx={4}
            />
            <text
              x={pos.x + pos.width - 75}
              y={pos.y + 26}
              textAnchor="middle"
              fill="white"
              fontSize={11}
              fontFamily="Arial, sans-serif"
              fontWeight="bold"
            >
              🎯 {getToneLabel(tone)}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export default ElementLabelRenderer;