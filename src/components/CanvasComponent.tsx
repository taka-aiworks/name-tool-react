import React, { useRef, useEffect, useState } from 'react';

// 型定義
interface Panel {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Character {
  id: string;
  panelId: number;
  type: string;
  name: string;
  x: number; // パネル内の相対位置 (0-1)
  y: number; // パネル内の相対位置 (0-1)
  scale: number;
  facing: string;
  gaze: string;
  pose: string;
  expression: string;
}

interface CanvasComponentProps {
  selectedTemplate: string;
  panels: Panel[];
  setPanels: (panels: Panel[]) => void;
  characters: Character[];
  setCharacters: (characters: Character[]) => void;
  onCharacterAdd: (addCharacterFunc: (type: string) => void) => void;
}

// テンプレート定義
const templates: Record<string, { panels: Panel[] }> = {
  '4koma': {
    panels: [
      { id: 1, x: 50, y: 50, width: 500, height: 170 },
      { id: 2, x: 50, y: 240, width: 500, height: 170 },
      { id: 3, x: 50, y: 430, width: 500, height: 170 },
      { id: 4, x: 50, y: 620, width: 500, height: 170 }
    ]
  },
  'dialogue': {
    panels: [
      { id: 1, x: 50, y: 50, width: 500, height: 200 },
      { id: 2, x: 50, y: 270, width: 240, height: 200 },
      { id: 3, x: 310, y: 270, width: 240, height: 200 },
      { id: 4, x: 50, y: 490, width: 500, height: 260 }
    ]
  },
  'action': {
    panels: [
      { id: 1, x: 50, y: 50, width: 200, height: 300 },
      { id: 2, x: 270, y: 50, width: 280, height: 180 },
      { id: 3, x: 270, y: 250, width: 280, height: 120 },
      { id: 4, x: 50, y: 370, width: 500, height: 380 }
    ]
  },
  'emotional': {
    panels: [
      { id: 1, x: 50, y: 50, width: 320, height: 300 },
      { id: 2, x: 390, y: 50, width: 160, height: 140 },
      { id: 3, x: 390, y: 210, width: 160, height: 140 },
      { id: 4, x: 50, y: 370, width: 500, height: 380 }
    ]
  }
};

const CanvasComponent: React.FC<CanvasComponentProps> = ({ 
  selectedTemplate, 
  panels, 
  setPanels,
  characters,
  setCharacters,
  onCharacterAdd
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // キャラクター追加機能
  const addCharacter = (type: string) => {
    if (!selectedPanel) {
      alert('まずパネルを選択してください');
      return;
    }

    const characterNames: Record<string, string> = {
      'hero': '主人公',
      'heroine': 'ヒロイン',
      'rival': 'ライバル',
      'friend': '友人'
    };

    const newCharacter: Character = {
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      panelId: selectedPanel.id,
      type: type,
      name: characterNames[type] || 'キャラクター',
      x: 0.5, // パネル中央
      y: 0.6, // パネル下寄り
      scale: 0.8,
      facing: 'front',
      gaze: 'center',
      pose: 'standing',
      expression: 'neutral'
    };

    setCharacters([...characters, newCharacter]);
    setSelectedCharacter(newCharacter);
    
    console.log('✅ キャラクター追加:', newCharacter.name, 'パネル', selectedPanel.id);
    alert(`${newCharacter.name}を追加しました！\nパネル${selectedPanel.id}に配置されました。`);
  };

  // キャラクター追加機能を親に提供
  useEffect(() => {
    onCharacterAdd(addCharacter);
  }, [selectedPanel, characters]);

  // Canvas描画関数
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 背景色
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // パネル描画
    panels.forEach(panel => {
      drawPanel(ctx, panel, panel === selectedPanel);
    });

    // キャラクター描画
    drawCharacters(ctx);
  };

  // パネル描画関数
  const drawPanel = (ctx: CanvasRenderingContext2D, panel: Panel, isSelected: boolean) => {
    // パネル背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(panel.x, panel.y, panel.width, panel.height);

    // パネル枠線
    ctx.strokeStyle = isSelected ? '#ff8833' : '#000000';
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.strokeRect(panel.x, panel.y, panel.width, panel.height);

    // パネル番号
    ctx.fillStyle = isSelected ? '#ff8833' : '#666666';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`${panel.id}`, panel.x + 10, panel.y + 10);

    // 選択時の追加表示
    if (isSelected) {
      ctx.fillStyle = '#ff8833';
      ctx.font = '12px Arial';
      ctx.fillText('選択中', panel.x + panel.width - 50, panel.y + 10);
    }
  };

  // キャラクター描画機能
  const drawCharacters = (ctx: CanvasRenderingContext2D) => {
    characters.forEach(character => {
      const panel = panels.find(p => p.id === character.panelId);
      if (!panel) return;

      drawCharacter(ctx, character, panel);
    });
  };

  // 個別キャラクター描画
  const drawCharacter = (ctx: CanvasRenderingContext2D, character: Character, panel: Panel) => {
    const charX = panel.x + (panel.width * character.x) - 30;
    const charY = panel.y + (panel.height * character.y) - 20;
    const charWidth = 60 * character.scale;
    const charHeight = 40 * character.scale;

    // 選択状態の背景
    if (character === selectedCharacter) {
      ctx.fillStyle = 'rgba(255, 102, 0, 0.2)';
      ctx.fillRect(charX - 5, charY - 5, charWidth + 10, charHeight + 10);
      
      // 選択枠
      ctx.strokeStyle = '#ff6600';
      ctx.lineWidth = 2;
      ctx.strokeRect(charX - 5, charY - 5, charWidth + 10, charHeight + 10);
      
      // リサイズハンドル
      drawResizeHandles(ctx, charX - 5, charY - 5, charWidth + 10, charHeight + 10);
    }

    // キャラクター本体
    ctx.fillStyle = 'rgba(0, 102, 255, 0.1)';
    ctx.fillRect(charX, charY, charWidth, charHeight);
    
    ctx.strokeStyle = '#0066ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(charX, charY, charWidth, charHeight);

    // 頭部
    const headSize = 20 * character.scale;
    const headX = charX + charWidth / 2 - headSize / 2;
    const headY = charY + 5;
    
    ctx.fillStyle = '#ffcc99';
    ctx.beginPath();
    ctx.arc(headX + headSize / 2, headY + headSize / 2, headSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 目
    const eyeSize = 3 * character.scale;
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(headX + headSize / 3, headY + headSize / 3, eyeSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headX + (headSize * 2) / 3, headY + headSize / 3, eyeSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // 体
    const bodyWidth = 15 * character.scale;
    const bodyHeight = 15 * character.scale;
    const bodyX = charX + charWidth / 2 - bodyWidth / 2;
    const bodyY = headY + headSize;
    
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(bodyX, bodyY, bodyWidth, bodyHeight);
    ctx.strokeRect(bodyX, bodyY, bodyWidth, bodyHeight);

    // 名前表示
    ctx.fillStyle = '#333';
    ctx.font = `${8 * character.scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(character.name, charX + charWidth / 2, charY + charHeight + 15);
  };

  // リサイズハンドル描画
  const drawResizeHandles = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
    const handleSize = 8;
    const positions = [
      [x, y], // 左上
      [x + width - handleSize, y], // 右上
      [x, y + height - handleSize], // 左下
      [x + width - handleSize, y + height - handleSize] // 右下
    ];

    ctx.fillStyle = '#ff6600';
    positions.forEach(([hx, hy]) => {
      ctx.fillRect(hx, hy, handleSize, handleSize);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(hx, hy, handleSize, handleSize);
    });
  };

  // マウスクリック処理
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // キャラクター選択チェック
    const clickedCharacter = findCharacterAt(x, y);
    
    if (clickedCharacter) {
      setSelectedCharacter(clickedCharacter);
      setSelectedPanel(null);
      console.log('👤 キャラクター選択:', clickedCharacter.name);
      return;
    }

    // パネル選択チェック
    const clickedPanel = panels.find(panel => 
      x >= panel.x && x <= panel.x + panel.width &&
      y >= panel.y && y <= panel.y + panel.height
    );

    setSelectedPanel(clickedPanel || null);
    setSelectedCharacter(null);
    console.log('📐 パネル選択:', clickedPanel?.id || 'なし');
  };

  // マウスダウン処理（ドラッグ開始）
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // キャラクター操作チェック
    const clickedCharacter = findCharacterAt(mouseX, mouseY);
    
    if (clickedCharacter) {
      setSelectedCharacter(clickedCharacter);
      
      // リサイズハンドルチェック
      const panel = panels.find(p => p.id === clickedCharacter.panelId);
      if (panel && isResizeHandleClicked(mouseX, mouseY, clickedCharacter, panel)) {
        setIsResizing(true);
        console.log('🔧 リサイズ開始:', clickedCharacter.name);
      } else {
        setIsDragging(true);
        const charX = panel!.x + (panel!.width * clickedCharacter.x);
        const charY = panel!.y + (panel!.height * clickedCharacter.y);
        setDragOffset({
          x: mouseX - charX,
          y: mouseY - charY
        });
        console.log('🚀 ドラッグ開始:', clickedCharacter.name);
      }
      e.preventDefault();
    }
  };

  // マウス移動処理
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging && !isResizing) return;
    
    const canvas = canvasRef.current;
    if (!canvas || !selectedCharacter) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const panel = panels.find(p => p.id === selectedCharacter.panelId);
    if (!panel) return;

    if (isDragging) {
      // ドラッグ処理
      const newX = (mouseX - dragOffset.x - panel.x) / panel.width;
      const newY = (mouseY - dragOffset.y - panel.y) / panel.height;

      const updatedCharacter = {
        ...selectedCharacter,
        x: Math.max(0, Math.min(1, newX)),
        y: Math.max(0, Math.min(1, newY))
      };

      setCharacters(characters.map(char => 
        char.id === selectedCharacter.id ? updatedCharacter : char
      ));
      setSelectedCharacter(updatedCharacter);
    }

    if (isResizing) {
      // リサイズ処理
      const charCenterX = panel.x + (panel.width * selectedCharacter.x);
      const charCenterY = panel.y + (panel.height * selectedCharacter.y);
      const distance = Math.sqrt(
        Math.pow(mouseX - charCenterX, 2) + Math.pow(mouseY - charCenterY, 2)
      );
      
      const newScale = Math.max(0.3, Math.min(2.0, distance / 50));
      
      const updatedCharacter = {
        ...selectedCharacter,
        scale: newScale
      };

      setCharacters(characters.map(char => 
        char.id === selectedCharacter.id ? updatedCharacter : char
      ));
      setSelectedCharacter(updatedCharacter);
    }
  };

  // マウスアップ処理
  const handleCanvasMouseUp = () => {
    if (isDragging) {
      console.log('✋ ドラッグ終了');
    }
    if (isResizing) {
      console.log('✋ リサイズ終了');
    }
    setIsDragging(false);
    setIsResizing(false);
  };

  // キャラクター検索
  const findCharacterAt = (mouseX: number, mouseY: number): Character | null => {
    for (let i = characters.length - 1; i >= 0; i--) {
      const character = characters[i];
      const panel = panels.find(p => p.id === character.panelId);
      if (!panel) continue;

      const charX = panel.x + (panel.width * character.x) - 30;
      const charY = panel.y + (panel.height * character.y) - 20;
      const charWidth = 60 * character.scale;
      const charHeight = 40 * character.scale;

      if (mouseX >= charX && mouseX <= charX + charWidth &&
          mouseY >= charY && mouseY <= charY + charHeight) {
        return character;
      }
    }
    return null;
  };

  // リサイズハンドルクリック判定
  const isResizeHandleClicked = (mouseX: number, mouseY: number, character: Character, panel: Panel): boolean => {
    const charX = panel.x + (panel.width * character.x) - 30 - 5;
    const charY = panel.y + (panel.height * character.y) - 20 - 5;
    const charWidth = 60 * character.scale + 10;
    const charHeight = 40 * character.scale + 10;

    const handleSize = 8;
    const positions = [
      [charX, charY],
      [charX + charWidth - handleSize, charY],
      [charX, charY + charHeight - handleSize],
      [charX + charWidth - handleSize, charY + charHeight - handleSize]
    ];

    return positions.some(([hx, hy]) => 
      mouseX >= hx && mouseX <= hx + handleSize &&
      mouseY >= hy && mouseY <= hy + handleSize
    );
  };

  // テンプレート変更時にパネルを更新
  useEffect(() => {
    if (templates[selectedTemplate]) {
      setPanels([...templates[selectedTemplate].panels]);
      setSelectedPanel(null);
      setSelectedCharacter(null);
    }
  }, [selectedTemplate, setPanels]);

  // パネル変更時に再描画
  useEffect(() => {
    drawCanvas();
  }, [panels, selectedPanel, characters, selectedCharacter]);

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={600}
        height={800}
        onClick={handleCanvasClick}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        style={{
          border: '2px solid #ddd',
          background: 'white',
          cursor: isDragging ? 'grabbing' : (isResizing ? 'nw-resize' : 'pointer'),
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}
      />
      
      {/* 選択状態表示 */}
      {selectedPanel && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(255, 136, 51, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          パネル{selectedPanel.id}選択中
        </div>
      )}
      
      {selectedCharacter && (
        <div style={{
          position: 'absolute',
          top: '40px',
          right: '10px',
          background: 'rgba(0, 102, 255, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {selectedCharacter.name}選択中
        </div>
      )}
    </div>
  );
};

export default CanvasComponent;