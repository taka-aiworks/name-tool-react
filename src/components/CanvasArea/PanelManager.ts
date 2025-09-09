// src/components/CanvasArea/PanelManager.ts
import { Panel, Character, SpeechBubble, SnapSettings } from "../../types";

export class PanelManager {
  /**
   * パネルハンドル判定
   */
  static getPanelHandleAt(
    mouseX: number, 
    mouseY: number, 
    panel: Panel
  ): { type: string; direction?: string } | null {
    const handleSize = 20;
    const tolerance = 5;
    
    // 削除ハンドル判定
    const deleteHandleSize = 24;
    const deleteX = panel.x - deleteHandleSize/2;
    const deleteY = panel.y - deleteHandleSize/2;
    
    if (
      mouseX >= deleteX - tolerance &&
      mouseX <= deleteX + deleteHandleSize + tolerance &&
      mouseY >= deleteY - tolerance &&
      mouseY <= deleteY + deleteHandleSize + tolerance
    ) {
      return { type: "delete" };
    }

    // リサイズハンドル判定
    const resizeHandles = [
      { x: panel.x - handleSize/2, y: panel.y - handleSize/2, type: "resize", direction: "nw" },
      { x: panel.x + panel.width/2 - handleSize/2, y: panel.y - handleSize/2, type: "resize", direction: "n" },
      { x: panel.x + panel.width - handleSize/2, y: panel.y - handleSize/2, type: "resize", direction: "ne" },
      { x: panel.x + panel.width - handleSize/2, y: panel.y + panel.height/2 - handleSize/2, type: "resize", direction: "e" },
      { x: panel.x + panel.width - handleSize/2, y: panel.y + panel.height - handleSize/2, type: "resize", direction: "se" },
      { x: panel.x + panel.width/2 - handleSize/2, y: panel.y + panel.height - handleSize/2, type: "resize", direction: "s" },
      { x: panel.x - handleSize/2, y: panel.y + panel.height - handleSize/2, type: "resize", direction: "sw" },
      { x: panel.x - handleSize/2, y: panel.y + panel.height/2 - handleSize/2, type: "resize", direction: "w" },
    ];

    for (const handle of resizeHandles) {
      if (
        mouseX >= handle.x - tolerance &&
        mouseX <= handle.x + handleSize + tolerance &&
        mouseY >= handle.y - tolerance &&
        mouseY <= handle.y + handleSize + tolerance
      ) {
        return { type: handle.type, direction: handle.direction };
      }
    }

    // 移動ハンドル判定
    const moveHandleSize = 30;
    const moveX = panel.x + panel.width/2 - moveHandleSize/2;
    const moveY = panel.y + panel.height/2 - moveHandleSize/2;
    
    if (
      mouseX >= moveX - tolerance &&
      mouseX <= moveX + moveHandleSize + tolerance &&
      mouseY >= moveY - tolerance &&
      mouseY <= moveY + moveHandleSize + tolerance
    ) {
      return { type: "move" };
    }

    // 分割ハンドル判定
    const splitHandleSize = 24;
    const splitX = panel.x + panel.width - splitHandleSize - 5;
    const splitY = panel.y + panel.height - splitHandleSize - 5;
    
    if (
      mouseX >= splitX - tolerance &&
      mouseX <= splitX + splitHandleSize + tolerance &&
      mouseY >= splitY - tolerance &&
      mouseY <= splitY + splitHandleSize + tolerance
    ) {
      return { type: "split" };
    }

    return null;
  }

  /**
   * パネルリサイズ
   */
  static resizePanel(
    panel: Panel, 
    direction: string, 
    deltaX: number, 
    deltaY: number, 
    minSize: number = 50
  ): Panel {
    const newPanel = { ...panel };
    const sensitivityFactor = 0.5;
    const adjustedDeltaX = deltaX * sensitivityFactor;
    const adjustedDeltaY = deltaY * sensitivityFactor;
    
    switch (direction) {
      case "nw":
        const newNwWidth = Math.max(minSize, newPanel.width - adjustedDeltaX);
        const newNwHeight = Math.max(minSize, newPanel.height - adjustedDeltaY);
        newPanel.x = newPanel.x + newPanel.width - newNwWidth;
        newPanel.y = newPanel.y + newPanel.height - newNwHeight;
        newPanel.width = newNwWidth;
        newPanel.height = newNwHeight;
        break;
      case "n":
        const newNHeight = Math.max(minSize, newPanel.height - adjustedDeltaY);
        newPanel.y = newPanel.y + newPanel.height - newNHeight;
        newPanel.height = newNHeight;
        break;
      case "ne":
        const newNeWidth = Math.max(minSize, newPanel.width + adjustedDeltaX);
        const newNeHeight = Math.max(minSize, newPanel.height - adjustedDeltaY);
        newPanel.y = newPanel.y + newPanel.height - newNeHeight;
        newPanel.width = newNeWidth;
        newPanel.height = newNeHeight;
        break;
      case "e":
        newPanel.width = Math.max(minSize, newPanel.width + adjustedDeltaX);
        break;
      case "se":
        newPanel.width = Math.max(minSize, newPanel.width + adjustedDeltaX);
        newPanel.height = Math.max(minSize, newPanel.height + adjustedDeltaY);
        break;
      case "s":
        newPanel.height = Math.max(minSize, newPanel.height + adjustedDeltaY);
        break;
      case "sw":
        const newSwWidth = Math.max(minSize, newPanel.width - adjustedDeltaX);
        newPanel.x = newPanel.x + newPanel.width - newSwWidth;
        newPanel.width = newSwWidth;
        newPanel.height = Math.max(minSize, newPanel.height + adjustedDeltaY);
        break;
      case "w":
        const newWWidth = Math.max(minSize, newPanel.width - adjustedDeltaX);
        newPanel.x = newPanel.x + newPanel.width - newWWidth;
        newPanel.width = newWWidth;
        break;
    }
    
    return newPanel;
  }

  /**
   * パネル移動（スナップ機能付き）
   */
  static movePanel(
    panel: Panel,
    deltaX: number,
    deltaY: number,
    canvasWidth: number = 1200,
    canvasHeight: number = 800,
    snapSettings: SnapSettings,
    allPanels: Panel[] = []
  ): { panel: Panel; snapLines: Array<{x1: number, y1: number, x2: number, y2: number, type: 'vertical' | 'horizontal'}> } {
    let newX = panel.x + deltaX;
    let newY = panel.y + deltaY;
    
    newX = Math.max(0, Math.min(canvasWidth - panel.width, newX));
    newY = Math.max(0, Math.min(canvasHeight - panel.height, newY));
    
    const snapLines: Array<{x1: number, y1: number, x2: number, y2: number, type: 'vertical' | 'horizontal'}> = [];
    
    // スナップが無効な場合は早期リターン
    if (!snapSettings.enabled) {
      return {
        panel: { ...panel, x: newX, y: newY },
        snapLines: []
      };
    }
    
    // 感度設定をピクセル値に変換
    const getSnapSensitivity = () => {
      switch (snapSettings.sensitivity) {
        case 'weak': return 6;
        case 'medium': return 12;
        case 'strong': return 20;
        default: return 12;
      }
    };
    const snapThreshold = getSnapSensitivity();
    
    const otherPanels = allPanels.filter(p => p.id !== panel.id);
    
    // パネル本体の境界線でスナップ判定
    for (const otherPanel of otherPanels) {
      // 水平方向のスナップ
      if (Math.abs(newX - otherPanel.x) < snapThreshold) {
        newX = otherPanel.x;
        snapLines.push({
          x1: otherPanel.x + 0.5, y1: Math.min(newY, otherPanel.y) - 20,
          x2: otherPanel.x + 0.5, y2: Math.max(newY + panel.height, otherPanel.y + otherPanel.height) + 20,
          type: 'vertical'
        });
        break;
      }
      
      if (Math.abs((newX + panel.width) - (otherPanel.x + otherPanel.width)) < snapThreshold) {
        newX = otherPanel.x + otherPanel.width - panel.width;
        snapLines.push({
          x1: otherPanel.x + otherPanel.width + 0.5, y1: Math.min(newY, otherPanel.y) - 20,
          x2: otherPanel.x + otherPanel.width + 0.5, y2: Math.max(newY + panel.height, otherPanel.y + otherPanel.height) + 20,
          type: 'vertical'
        });
        break;
      }
    }
    
    // 垂直方向のスナップ
    for (const otherPanel of otherPanels) {
      if (Math.abs(newY - otherPanel.y) < snapThreshold) {
        newY = otherPanel.y;
        snapLines.push({
          x1: Math.min(newX, otherPanel.x) - 20, y1: otherPanel.y + 0.5,
          x2: Math.max(newX + panel.width, otherPanel.x + otherPanel.width) + 20, y2: otherPanel.y + 0.5,
          type: 'horizontal'
        });
        break;
      }
      
      if (Math.abs((newY + panel.height) - (otherPanel.y + otherPanel.height)) < snapThreshold) {
        newY = otherPanel.y + otherPanel.height - panel.height;
        snapLines.push({
          x1: Math.min(newX, otherPanel.x) - 20, y1: otherPanel.y + otherPanel.height + 0.5,
          x2: Math.max(newX + panel.width, otherPanel.x + otherPanel.width) + 20, y2: otherPanel.y + otherPanel.height + 0.5,
          type: 'horizontal'
        });
        break;
      }
    }
    
    return {
      panel: { ...panel, x: newX, y: newY },
      snapLines
    };
  }

  /**
   * パネル複製（完全版）
   */
  static duplicatePanel(
    originalPanel: Panel,
    panels: Panel[],
    characters: Character[],
    speechBubbles: SpeechBubble[],
    canvasWidth: number = 600,
    canvasHeight: number = 800
  ): {
    newPanel: Panel;
    newCharacters: Character[];
    newBubbles: SpeechBubble[];
  } {
    console.log("🔍 複製開始 - 元パネル:", originalPanel);
    
    // 新しいパネルID生成
    const maxId = Math.max(...panels.map(p => p.id), 0);
    const newPanelId = maxId + 1;
    console.log("🔍 新しいパネルID:", newPanelId);
    
    // パネルを右側に複製（重複しないよう調整）
    const newPanel: Panel = {
      ...originalPanel,
      id: newPanelId,
      x: originalPanel.x + originalPanel.width + 10, // 10px間隔
      y: originalPanel.y
    };
    
    // キャンバス範囲チェック
    if (newPanel.x + newPanel.width > canvasWidth) {
      console.log("🔍 右に配置できないため下に配置");
      newPanel.x = originalPanel.x;
      newPanel.y = originalPanel.y + originalPanel.height + 10;
      
      if (newPanel.y + newPanel.height > canvasHeight) {
        console.log("🔍 下にも配置できないため左に配置");
        newPanel.x = Math.max(0, originalPanel.x - originalPanel.width - 10);
        newPanel.y = originalPanel.y;
      }
    }
    
    // パネル内のキャラクターを複製
    const panelCharacters = characters.filter(char => {
      const isInPanel = char.x >= originalPanel.x && 
        char.x <= originalPanel.x + originalPanel.width &&
        char.y >= originalPanel.y && 
        char.y <= originalPanel.y + originalPanel.height;
      return isInPanel;
    });
    
    const duplicatedCharacters = panelCharacters.map(char => {
      const offsetX = newPanel.x - originalPanel.x;
      const offsetY = newPanel.y - originalPanel.y;
      
      return {
        ...char,
        id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        panelId: newPanelId,
        x: char.x + offsetX,
        y: char.y + offsetY
      };
    });
    
    // パネル内の吹き出しを複製
    const panelBubbles = speechBubbles.filter(bubble => {
      const isInPanel = bubble.x >= originalPanel.x && 
        bubble.x <= originalPanel.x + originalPanel.width &&
        bubble.y >= originalPanel.y && 
        bubble.y <= originalPanel.y + originalPanel.height;
      return isInPanel;
    });
    
    const duplicatedBubbles = panelBubbles.map(bubble => {
      const offsetX = newPanel.x - originalPanel.x;
      const offsetY = newPanel.y - originalPanel.y;
      
      return {
        ...bubble,
        id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        panelId: newPanelId,
        x: bubble.x + offsetX,
        y: bubble.y + offsetY
      };
    });
    
    console.log(`✅ コマ ${originalPanel.id} を複製 → コマ ${newPanelId}`);
    
    return {
      newPanel,
      newCharacters: duplicatedCharacters,
      newBubbles: duplicatedBubbles
    };
  }

  /**
   * パネル検索
   */
  static findPanelAt(mouseX: number, mouseY: number, panels: Panel[]): Panel | null {
    return panels.find(
      (panel) =>
        mouseX >= panel.x &&
        mouseX <= panel.x + panel.width &&
        mouseY >= panel.y &&
        mouseY <= panel.y + panel.height
    ) || null;
  }

  /**
   * パネル削除の確認処理
   */
  static confirmPanelDeletion(
    panel: Panel,
    characters: Character[],
    speechBubbles: SpeechBubble[]
  ): boolean {
    const characterIdsToDelete = characters
      .filter(char => 
        char.x >= panel.x && 
        char.x <= panel.x + panel.width &&
        char.y >= panel.y && 
        char.y <= panel.y + panel.height
      );

    const bubbleIdsToDelete = speechBubbles
      .filter(bubble => 
        bubble.x >= panel.x && 
        bubble.x <= panel.x + panel.width &&
        bubble.y >= panel.y && 
        bubble.y <= panel.y + panel.height
      );

    let message = `コマ ${panel.id} を削除しますか？\n`;
    
    if (characterIdsToDelete.length > 0) {
      message += `キャラクター ${characterIdsToDelete.length}個も一緒に削除されます。\n`;
    }
    
    if (bubbleIdsToDelete.length > 0) {
      message += `吹き出し ${bubbleIdsToDelete.length}個も一緒に削除されます。\n`;
    }
    
    message += `\nこの操作は取り消せません。`;

    return window.confirm(message);
  }

  /**
   * パネル削除処理
   */
  static deletePanel(
    panel: Panel,
    panels: Panel[],
    characters: Character[],
    speechBubbles: SpeechBubble[]
  ): {
    newPanels: Panel[];
    newCharacters: Character[];
    newBubbles: SpeechBubble[];
  } {
    const characterIdsToDelete = characters
      .filter(char => 
        char.x >= panel.x && 
        char.x <= panel.x + panel.width &&
        char.y >= panel.y && 
        char.y <= panel.y + panel.height
      )
      .map(char => char.id);

    const bubbleIdsToDelete = speechBubbles
      .filter(bubble => 
        bubble.x >= panel.x && 
        bubble.x <= panel.x + panel.width &&
        bubble.y >= panel.y && 
        bubble.y <= panel.y + panel.height
      )
      .map(bubble => bubble.id);

    const newPanels = panels.filter(p => p.id !== panel.id);
    const newCharacters = characters.filter(char => !characterIdsToDelete.includes(char.id));
    const newBubbles = speechBubbles.filter(bubble => !bubbleIdsToDelete.includes(bubble.id));

    console.log(`🗑️ パネル ${panel.id} 削除完了`);

    return {
      newPanels,
      newCharacters,
      newBubbles
    };
  }
}