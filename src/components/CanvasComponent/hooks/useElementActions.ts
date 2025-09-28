// src/components/CanvasComponent/hooks/useElementActions.ts - キャラクター移動時データ保持修正版
import { useEffect } from 'react';
import { Panel, Character, SpeechBubble } from '../../../types';
import { CanvasState, CanvasStateActions } from './useCanvasState';
import { templates } from '../../CanvasArea/templates';

export interface ElementActionsHookProps {
  state: CanvasState;
  actions: CanvasStateActions;
  selectedTemplate: string;
  panels: Panel[];
  characters: Character[];
  setCharacters: (characters: Character[]) => void;
  speechBubbles: SpeechBubble[];
  setSpeechBubbles: (bubbles: SpeechBubble[]) => void;
  onCharacterAdd: (addFunction: (type: string) => void) => void;
  onBubbleAdd: (addFunction: (type: string, text: string) => void) => void;
  onCharacterSelect?: (character: Character | null) => void;
}

export interface ElementActionsReturn {
  addCharacter: (type: string) => void;
  addBubble: (type: string, text: string) => void;
  handleEditComplete: () => void;
  handleEditCancel: () => void;
  // 🆕 キャラクター移動時データ保持機能を追加
  updateCharacterPosition: (characterId: string, newX: number, newY: number, additionalUpdates?: Partial<Character>) => void;
}

/**
 * Canvas要素の追加・編集機能を管理するカスタムhook
 * キャラクター・吹き出しの追加、編集処理を一元化
 */
export const useElementActions = ({
  state,
  actions,
  selectedTemplate,
  panels,
  characters,
  setCharacters,
  speechBubbles,
  setSpeechBubbles,
  onCharacterAdd,
  onBubbleAdd,
  onCharacterSelect,
}: ElementActionsHookProps): ElementActionsReturn => {

  /**
   * 🆕 キャラクター位置更新時の詳細設定保持機能
   */
  const updateCharacterPosition = (
    characterId: string, 
    newX: number, 
    newY: number, 
    additionalUpdates?: Partial<Character>
  ) => {
    console.log('🔧 キャラクター位置更新開始:', {
      characterId,
      newPosition: { x: newX, y: newY },
      additionalUpdates
    });

    const updatedCharacters = characters.map(char => {
      if (char.id === characterId) {
        // 🔧 詳細設定をログで確認
        console.log('🔍 移動前のキャラクター詳細設定:', {
          id: char.id,
          name: char.name,
          expression: char.expression,
          action: char.action,
          facing: char.facing,
          eyeState: (char as any).eyeState,
          mouthState: (char as any).mouthState,
          handGesture: (char as any).handGesture,
          emotion_primary: (char as any).emotion_primary,
          physical_state: (char as any).physical_state
        });

        const updatedChar = {
          ...char,  // 🔧 既存の全プロパティを保持
          x: newX,
          y: newY,
          ...additionalUpdates   // 必要に応じて追加の更新を適用
        };

        // 🔧 移動後の詳細設定確認
        console.log('✅ 移動後のキャラクター詳細設定保持確認:', {
          id: updatedChar.id,
          name: updatedChar.name,
          preserved_expression: updatedChar.expression,
          preserved_action: updatedChar.action,
          preserved_facing: updatedChar.facing,
          preserved_eyeState: (updatedChar as any).eyeState,
          preserved_mouthState: (updatedChar as any).mouthState,
          preserved_handGesture: (updatedChar as any).handGesture,
          preserved_emotion_primary: (updatedChar as any).emotion_primary,
          preserved_physical_state: (updatedChar as any).physical_state,
          new_position: `(${newX}, ${newY})`
        });

        return updatedChar;
      }
      return char;  // 他のキャラクターは変更しない
    });

    setCharacters(updatedCharacters);

    // 🔧 選択状態も更新
    if (state.selectedCharacter && state.selectedCharacter.id === characterId) {
      const updatedSelectedChar = updatedCharacters.find(c => c.id === characterId);
      if (updatedSelectedChar) {
        actions.setSelectedCharacter(updatedSelectedChar);
        if (onCharacterSelect) onCharacterSelect(updatedSelectedChar);
      }
    }
  };

  /**
   * 🆕 新しい吹き出しの配置位置を計算（重複回避）
   */
  const calculateBubblePosition = (
    targetPanel: Panel,
    bubbleWidth: number,
    bubbleHeight: number,
    existingBubbles: SpeechBubble[]
  ): { x: number; y: number } => {
    
    // パネル内の配置エリア定義（上から下、左から右の順）
    const placementAreas = [
      { x: 0.2, y: 0.1 }, // 左上
      { x: 0.7, y: 0.1 }, // 右上
      { x: 0.5, y: 0.2 }, // 上中央
      { x: 0.1, y: 0.4 }, // 左中央
      { x: 0.8, y: 0.4 }, // 右中央
      { x: 0.3, y: 0.6 }, // 左下
      { x: 0.6, y: 0.6 }, // 右下
      { x: 0.5, y: 0.8 }, // 下中央
    ];

    // パネル内の既存吹き出し数を数える
    const panelBubbles = existingBubbles.filter(b => b.panelId === targetPanel.id);
    console.log(`💬 パネル${targetPanel.id}内の既存吹き出し数: ${panelBubbles.length}`);

    // 配置エリアを順番に試す
    for (let i = 0; i < placementAreas.length; i++) {
      const areaIndex = (panelBubbles.length + i) % placementAreas.length;
      const area = placementAreas[areaIndex];
      
      const candidateX = targetPanel.x + targetPanel.width * area.x - bubbleWidth / 2;
      const candidateY = targetPanel.y + targetPanel.height * area.y - bubbleHeight / 2;
      
      // 既存の吹き出しと重複しないかチェック
      const hasOverlap = existingBubbles.some(bubble => {
        if (bubble.panelId !== targetPanel.id) return false;
        
        const distance = Math.sqrt(
          Math.pow(bubble.x - candidateX, 2) + Math.pow(bubble.y - candidateY, 2)
        );
        return distance < 80; // 最小距離80px
      });

      if (!hasOverlap) {
        console.log(`✅ 吹き出し配置: エリア${areaIndex + 1} (${candidateX.toFixed(1)}, ${candidateY.toFixed(1)})`);
        return { x: candidateX, y: candidateY };
      }
    }

    // 全エリアが埋まっている場合はランダム配置
    const randomX = targetPanel.x + Math.random() * (targetPanel.width - bubbleWidth);
    const randomY = targetPanel.y + Math.random() * (targetPanel.height - bubbleHeight);
    console.log(`🎲 ランダム配置: (${randomX.toFixed(1)}, ${randomY.toFixed(1)})`);
    
    return { x: randomX, y: randomY };
  };

  /**
   * キャラクター追加機能
   */
  const addCharacter = (type: string) => {
    let availablePanels = panels;
    if (availablePanels.length === 0 && selectedTemplate && templates[selectedTemplate]) {
      availablePanels = templates[selectedTemplate].panels;
    }
    
    const targetPanel = state.selectedPanel || availablePanels[0];
    if (!targetPanel) {
      console.log("⚠️ 利用可能なパネルがありません");
      return;
    }

    const characterNames: Record<string, string> = {
      hero: "主人公",
      heroine: "ヒロイン", 
      rival: "ライバル",
      friend: "友人",
      character_1: "主人公", // 🔧 character_1タイプに対応
      character_2: "ヒロイン", // 🔧 character_2タイプに対応
      character_3: "ライバル", // 🔧 character_3タイプに対応
      character_4: "友人", // 🔧 character_4タイプに対応
    };

    let viewType: "face" | "upper_body" | "full_body";

    switch (type) {
      case "hero":
      case "character_1":
        viewType = "upper_body";
        break;
      case "heroine":
      case "character_2":
        viewType = "upper_body";
        break;
      case "rival":
      case "character_3":
        viewType = "upper_body";
        break;
      case "friend":
      case "character_4":
        viewType = "face";
        break;
      default:
        viewType = "upper_body";
    }

    const newCharacter: Character = {
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      panelId: targetPanel.id,
      characterId: `char_${type}_${Date.now()}`,
      type: type,
      name: characterNames[type] || "キャラクター",
      x: targetPanel.x + targetPanel.width * 0.5,
      y: targetPanel.y + targetPanel.height * 0.7,
      scale: 2.0,
      // width: initialWidth,    // 🔧 削除：基本サイズを使用
      // height: initialHeight,  // 🔧 削除：基本サイズを使用
      facing: "",           // 🔧 未選択に変更
      action: "",           // 🔧 未選択に変更
      expression: "",       // 🔧 未選択に変更
      viewType: viewType,
      eyeState: "",         // 🔧 未選択に変更
      mouthState: "",       // 🔧 未選択に変更
      handGesture: "",      // 🔧 未選択に変更
      isGlobalPosition: true,
    };

    setCharacters([...characters, newCharacter]);
    actions.setSelectedCharacter(newCharacter);
    if (onCharacterSelect) onCharacterSelect(newCharacter);
    console.log("✅ キャラクター追加:", newCharacter.name, `(基本サイズ使用)`);
  };

  /**
   * 🔧 吹き出し追加機能（重複回避版）
   */
  const addBubble = (type: string, text: string) => {
    let availablePanels = panels;
    if (availablePanels.length === 0 && selectedTemplate && templates[selectedTemplate]) {
      availablePanels = templates[selectedTemplate].panels;
    }
    
    const targetPanel = state.selectedPanel || availablePanels[0];
    if (!targetPanel) {
      console.log("⚠️ 利用可能なパネルがありません");
      return;
    }

    const textLength = text.length;
    const baseWidth = Math.max(60, textLength * 8 + 20);
    const baseHeight = Math.max(80, Math.ceil(textLength / 4) * 20 + 40);

    // 🔧 重複しない位置を計算
    const position = calculateBubblePosition(targetPanel, baseWidth, baseHeight, speechBubbles);

    const newBubble: SpeechBubble = {
      id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      panelId: targetPanel.id,
      type: type,
      text: text || "ダブルクリックで編集",
      x: position.x,  // 🔧 計算された位置を使用
      y: position.y,  // 🔧 計算された位置を使用
      scale: 1.0,
      width: baseWidth,
      height: baseHeight,
      vertical: true,
      isGlobalPosition: true,
    };

    // 🔧 既存の吹き出しの座標を保持したまま新しい吹き出しを追加
    setSpeechBubbles([...speechBubbles, newBubble]);
    actions.setSelectedBubble(newBubble);
    
    console.log("✅ 吹き出し追加:", type, `位置:(${position.x.toFixed(1)}, ${position.y.toFixed(1)})`);
  };

  /**
   * 吹き出し編集完了処理
   */
  const handleEditComplete = () => {
    if (state.editingBubble && state.editText.trim()) {
      const textLength = state.editText.length;
      const newWidth = Math.max(60, textLength * 8 + 20);
      const newHeight = Math.max(80, Math.ceil(textLength / 4) * 20 + 40);
      
      const updatedBubble = {
        ...state.editingBubble,
        text: state.editText,
        width: newWidth,
        height: newHeight,
      };
      
      // 🔧 既存の吹き出しの位置を保持したまま更新
      setSpeechBubbles(
        speechBubbles.map((bubble) =>
          bubble.id === state.editingBubble!.id ? updatedBubble : bubble
        )
      );
      
      console.log("✅ 吹き出し編集完了:", state.editText);
    }
    
    actions.setEditingBubble(null);
    actions.setEditText("");
  };

  /**
   * 吹き出し編集キャンセル処理
   */
  const handleEditCancel = () => {
    actions.setEditingBubble(null);
    actions.setEditText("");
    console.log("❌ 吹き出し編集キャンセル");
  };

  useEffect(() => {
    onCharacterAdd(addCharacter);
  }, [state.selectedPanel, characters.length]);

  useEffect(() => {
    onBubbleAdd(addBubble);
  }, [state.selectedPanel, speechBubbles.length]);

  return {
    addCharacter,
    addBubble,
    handleEditComplete,
    handleEditCancel,
    updateCharacterPosition  // 🆕 新機能を公開
  };
};