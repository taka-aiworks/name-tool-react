// src/components/CanvasArea/renderers/EffectRenderer.tsx
import React from 'react';
import { EffectElement } from '../../../types';

interface EffectRendererProps {
  effects: EffectElement[];
  canvasScale: number;
}

const EffectRenderer: React.FC<EffectRendererProps> = ({ effects, canvasScale }) => {
  // スピード線を描画
  const renderSpeedLines = (effect: EffectElement) => {
    const lines = [];
    const lineCount = Math.floor(effect.density * 50);
    const lineLength = effect.length * Math.min(effect.width, effect.height);
    
    for (let i = 0; i < lineCount; i++) {
      let x1, y1, x2, y2;
      
      if (effect.direction === 'horizontal') {
        // 水平線
        y1 = effect.y + (Math.random() * effect.height);
        x1 = effect.x + (Math.random() * (effect.width - lineLength));
        x2 = x1 + lineLength;
        y2 = y1;
      } else if (effect.direction === 'vertical') {
        // 垂直線
        x1 = effect.x + (Math.random() * effect.width);
        y1 = effect.y + (Math.random() * (effect.height - lineLength));
        x2 = x1;
        y2 = y1 + lineLength;
      } else {
        // カスタム角度
        const centerX = effect.x + effect.width / 2;
        const centerY = effect.y + effect.height / 2;
        const randomX = effect.x + (Math.random() * effect.width);
        const randomY = effect.y + (Math.random() * effect.height);
        
        const angleRad = (effect.angle * Math.PI) / 180;
        const halfLength = lineLength / 2;
        
        x1 = randomX - Math.cos(angleRad) * halfLength;
        y1 = randomY - Math.sin(angleRad) * halfLength;
        x2 = randomX + Math.cos(angleRad) * halfLength;
        y2 = randomY + Math.sin(angleRad) * halfLength;
      }
      
      const strokeWidth = Math.max(0.5, effect.intensity * 3 * canvasScale);
      
      lines.push(
        <line
          key={`speed-line-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={effect.color}
          strokeWidth={strokeWidth}
          opacity={effect.opacity}
          style={{
            filter: effect.blur > 0 ? `blur(${effect.blur * canvasScale}px)` : undefined
          }}
        />
      );
    }
    
    return lines;
  };

  // 集中線・爆発線・フラッシュ線を描画（放射状）
  const renderRadialLines = (effect: EffectElement) => {
    const lines = [];
    const lineCount = Math.floor(effect.density * 60);
    const centerX = effect.centerX || (effect.x + effect.width / 2);
    const centerY = effect.centerY || (effect.y + effect.height / 2);
    const maxRadius = Math.max(effect.width, effect.height) / 2;
    
    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * 2 * Math.PI;
      const length = effect.length * maxRadius * (0.7 + Math.random() * 0.3);
      
      const x1 = centerX + Math.cos(angle) * (maxRadius * 0.1);
      const y1 = centerY + Math.sin(angle) * (maxRadius * 0.1);
      const x2 = centerX + Math.cos(angle) * length;
      const y2 = centerY + Math.sin(angle) * length;
      
      let strokeWidth;
      if (effect.type === 'focus') {
        // 集中線：中心が太く外側が細い
        strokeWidth = Math.max(0.3, effect.intensity * 2 * canvasScale * (1 - length / (maxRadius * effect.length)));
      } else if (effect.type === 'explosion') {
        // 爆発線：均一で太い
        strokeWidth = Math.max(0.5, effect.intensity * 4 * canvasScale);
      } else {
        // フラッシュ線：細くて繊細
        strokeWidth = Math.max(0.2, effect.intensity * 1.5 * canvasScale);
      }
      
      lines.push(
        <line
          key={`radial-line-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={effect.color}
          strokeWidth={strokeWidth}
          opacity={effect.opacity * (0.7 + Math.random() * 0.3)}
          style={{
            filter: effect.blur > 0 ? `blur(${effect.blur * canvasScale}px)` : undefined
          }}
        />
      );
    }
    
    return lines;
  };

  // 選択ハンドルを描画
  const renderSelectionHandles = (effect: EffectElement) => {
    if (!effect.selected) return null;
    
    const handleSize = 8 / canvasScale;
    const handles = [
      { x: effect.x, y: effect.y }, // 左上
      { x: effect.x + effect.width, y: effect.y }, // 右上
      { x: effect.x + effect.width, y: effect.y + effect.height }, // 右下
      { x: effect.x, y: effect.y + effect.height }, // 左下
      { x: effect.x + effect.width / 2, y: effect.y }, // 上中央
      { x: effect.x + effect.width, y: effect.y + effect.height / 2 }, // 右中央
      { x: effect.x + effect.width / 2, y: effect.y + effect.height }, // 下中央
      { x: effect.x, y: effect.y + effect.height / 2 }, // 左中央
    ];
    
    return (
      <g>
        {/* 選択枠 */}
        <rect
          x={effect.x}
          y={effect.y}
          width={effect.width}
          height={effect.height}
          fill="none"
          stroke="#007AFF"
          strokeWidth={2 / canvasScale}
          strokeDasharray={`${4 / canvasScale} ${4 / canvasScale}`}
          opacity={0.8}
        />
        
        {/* 中心点（放射状効果用） */}
        {effect.direction === 'radial' && (
          <circle
            cx={effect.centerX || (effect.x + effect.width / 2)}
            cy={effect.centerY || (effect.y + effect.height / 2)}
            r={3 / canvasScale}
            fill="#FF6B6B"
            stroke="#FFFFFF"
            strokeWidth={1 / canvasScale}
          />
        )}
        
        {/* リサイズハンドル */}
        {handles.map((handle, index) => (
          <rect
            key={`handle-${index}`}
            x={handle.x - handleSize / 2}
            y={handle.y - handleSize / 2}
            width={handleSize}
            height={handleSize}
            fill="#007AFF"
            stroke="#FFFFFF"
            strokeWidth={1 / canvasScale}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </g>
    );
  };

  return (
    <g className="effect-layer">
      {effects.map((effect) => (
        <g key={effect.id} className="effect-element">
          {/* 効果線本体の描画 */}
          {effect.direction === 'radial' ? (
            <g className="radial-effect">
              {renderRadialLines(effect)}
            </g>
          ) : (
            <g className="linear-effect">
              {renderSpeedLines(effect)}
            </g>
          )}
          
          {/* 選択ハンドル */}
          {renderSelectionHandles(effect)}
        </g>
      ))}
    </g>
  );
};

export default EffectRenderer;