// src/components/CanvasComponent/hooks/useElementActions.ts
// types.ts対応修正版
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
    };

    // 🔧 viewType修正: types.tsの実際の型に合わせる
    let viewType: "face" | "upper_body" | "full_body";  // halfBody/fullBody → upper_body/full_body
    let initialWidth: number;
    let initialHeight: number;

    // キャラクタータイプに応じた設定
    switch (type) {
      case "hero":
        viewType = "upper_body";  // halfBody → upper_body
        initialWidth = 100;
        initialHeight = 120;
        break;
      case "heroine":
        viewType = "upper_body";  // halfBody → upper_body
        initialWidth = 95;
        initialHeight = 115;
        break;
      case "rival":
        viewType = "upper_body";  // halfBody → upper_body
        initialWidth = 105;
        initialHeight = 125;
        break;
      case "friend":
        viewType = "face";
        initialWidth = 80;
        initialHeight = 80;
        break;
      default:
        viewType = "upper_body";  // halfBody → upper_body
        initialWidth = 100;
        initialHeight = 120;
    }

    // 🔧 Character型修正: types.tsの実際のプロパティに合わせる
    const newCharacter: Character = {
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      panelId: targetPanel.id,
      characterId: `char_${type}_${Date.now()}`, // 新プロパティ
      type: type,
      name: characterNames[type] || "キャラクター",
      x: targetPanel.x + targetPanel.width * 0.5,
      y: targetPanel.y + targetPanel.height * 0.7,
      scale: 2.0,
      
      // width/height を明示的に設定
      width: initialWidth,
      height: initialHeight,
      
      // 🔧 types.tsの実際のプロパティに修正
      facing: "front",        // bodyDirection統合
      action: "standing",     // bodyPose → action
      expression: "normal",   // faceExpression → expression
      viewType: viewType,
      eyeState: "front",      // eyeDirection → eyeState
      mouthState: "normal",   // 新プロパティ
      handGesture: "normal",  // 新プロパティ
      isGlobalPosition: true,
      
      // 🔧 削除: 存在しないプロパティを削除
      // gaze: "center",          // 削除
      // pose: "standing",        // 削除
      // faceAngle: "front",      // 削除
      // bodyDirection: "front",  // 削除
      // faceExpression: "normal", // 削除
      // bodyPose: "standing",    // 削除
      // eyeDirection: "front",   // 削除
    };

    setCharacters([...characters, newCharacter]);
    actions.setSelectedCharacter(newCharacter);
    if (onCharacterSelect) onCharacterSelect(newCharacter);
    console.log("✅ キャラクター追加:", newCharacter.name, `(${initialWidth}x${initialHeight}px)`);
  };

  /**
   * 吹き出し追加機能
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

    const newBubble: SpeechBubble = {
      id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      panelId: targetPanel.id,
      type: type,
      text: text || "ダブルクリックで編集",
      x: targetPanel.x + targetPanel.width * 0.5,
      y: targetPanel.y + targetPanel.height * 0.3,
      scale: 1.0,
      width: baseWidth,
      height: baseHeight,
      vertical: true,
      isGlobalPosition: true,
    };

    setSpeechBubbles([...speechBubbles, newBubble]);
    console.log("✅ 吹き出し追加:", type);
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

  /**
   * onCharacterAdd, onBubbleAdd コールバック登録
   */
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
  };
};