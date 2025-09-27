// src/utils/ScaleTransformUtils.ts
import { 
  Character, 
  SpeechBubble, 
  Panel,
  BackgroundElement,
  EffectElement,
  ToneElement,
  CanvasSettings 
} from '../types';

/**
 * スケール変換の計算
 */
export interface ScaleTransform {
  scaleX: number;
  scaleY: number;
}

export const calculateScaleTransform = (
  oldSettings: CanvasSettings, 
  newSettings: CanvasSettings
): ScaleTransform => ({
  scaleX: newSettings.paperSize.pixelWidth / oldSettings.paperSize.pixelWidth,
  scaleY: newSettings.paperSize.pixelHeight / oldSettings.paperSize.pixelHeight
});

/**
 * パネル専用のスケール変換
 */
export const scalePanel = (panel: Panel, { scaleX, scaleY }: ScaleTransform): Panel => {
  const scaledPanel = {
    ...panel,
    x: Math.round(panel.x * scaleX),
    y: Math.round(panel.y * scaleY),
    width: Math.round(panel.width * scaleX),
    height: Math.round(panel.height * scaleY)
  };
  
  console.log('📐 Panel scale transformation:', {
    panelId: panel.id,
    original: { 
      x: panel.x, 
      y: panel.y, 
      width: panel.width, 
      height: panel.height 
    },
    scaled: { 
      x: scaledPanel.x, 
      y: scaledPanel.y, 
      width: scaledPanel.width, 
      height: scaledPanel.height 
    },
    scaleFactors: { 
      scaleX: scaleX.toFixed(3), 
      scaleY: scaleY.toFixed(3) 
    },
    sizeChange: {
      widthChange: `${((scaledPanel.width / panel.width - 1) * 100).toFixed(1)}%`,
      heightChange: `${((scaledPanel.height / panel.height - 1) * 100).toFixed(1)}%`
    }
  });
  
  return scaledPanel;
};

/**
 * キャラクター専用のスケール変換
 */
export const scaleCharacter = (character: Character, { scaleX, scaleY }: ScaleTransform): Character => {
  // サイズは縦横の小さい方の倍率を使用（アスペクト比維持）
  const sizeScale = Math.min(scaleX, scaleY);
  
  return {
    ...character,
    x: Math.round(character.x * scaleX),
    y: Math.round(character.y * scaleY),
    scale: character.scale * sizeScale
  };
};

/**
 * 吹き出し専用のスケール変換
 */
export const scaleBubble = (bubble: SpeechBubble, { scaleX, scaleY }: ScaleTransform): SpeechBubble => {
  return {
    ...bubble,
    x: Math.round(bubble.x * scaleX),
    y: Math.round(bubble.y * scaleY),
    width: Math.round(bubble.width * scaleX),
    height: Math.round(bubble.height * scaleY),
    scale: bubble.scale * Math.min(scaleX, scaleY)
  };
};

/**
 * 背景要素専用のスケール変換
 */
export const scaleBackground = (background: BackgroundElement, { scaleX, scaleY }: ScaleTransform): BackgroundElement => ({
  ...background,
  x: Math.round(background.x * scaleX),
  y: Math.round(background.y * scaleY),
  width: Math.round(background.width * scaleX),
  height: Math.round(background.height * scaleY)
});

/**
 * 効果線専用のスケール変換
 */
export const scaleEffect = (effect: EffectElement, { scaleX, scaleY }: ScaleTransform): EffectElement => ({
  ...effect,
  x: Math.round(effect.x * scaleX),
  y: Math.round(effect.y * scaleY),
  width: Math.round(effect.width * scaleX),
  height: Math.round(effect.height * scaleY)
});

/**
 * トーン専用のスケール変換
 */
export const scaleTone = (tone: ToneElement, { scaleX, scaleY }: ScaleTransform): ToneElement => ({
  ...tone,
  x: Math.round(tone.x * scaleX),
  y: Math.round(tone.y * scaleY),
  width: Math.round(tone.width * scaleX),
  height: Math.round(tone.height * scaleY)
});

/**
 * スケール変換の検証
 */
export const validateScaleTransform = (transform: ScaleTransform): boolean => {
  const { scaleX, scaleY } = transform;
  
  // 0以下や無限大、NaNをチェック
  if (scaleX <= 0 || scaleY <= 0 || !isFinite(scaleX) || !isFinite(scaleY)) {
    console.error('Invalid scale transform:', transform);
    return false;
  }
  
  // 極端なスケール値をチェック（0.1倍～10倍の範囲）
  if (scaleX < 0.1 || scaleX > 10 || scaleY < 0.1 || scaleY > 10) {
    console.warn('Extreme scale transform detected:', transform);
  }
  
  return true;
};

/**
 * スケール変換のログ出力
 */
export const logScaleTransform = (
  oldSettings: CanvasSettings,
  newSettings: CanvasSettings,
  transform: ScaleTransform
) => {
  console.group('📐 Scale Transform Applied');
  console.log('Old canvas:', { 
    size: oldSettings.paperSize.displayName,
    pixels: `${oldSettings.paperSize.pixelWidth}×${oldSettings.paperSize.pixelHeight}`
  });
  console.log('New canvas:', { 
    size: newSettings.paperSize.displayName,
    pixels: `${newSettings.paperSize.pixelWidth}×${newSettings.paperSize.pixelHeight}`
  });
  console.log('Scale factors:', { 
    scaleX: `${(transform.scaleX * 100).toFixed(1)}%`, 
    scaleY: `${(transform.scaleY * 100).toFixed(1)}%` 
  });
  console.groupEnd();
};