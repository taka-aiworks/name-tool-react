// src/components/CanvasComponent/hooks/useCanvasState.ts
import { useState } from 'react';
import { Panel, Character, SpeechBubble } from '../../../types';

export interface CanvasState {
  // 基本選択状態
  selectedPanel: Panel | null;
  selectedCharacter: Character | null;
  selectedBubble: SpeechBubble | null;
  
  // ドラッグ&操作状態
  isDragging: boolean;
  isCharacterResizing: boolean;
  isBubbleResizing: boolean;
  isPanelResizing: boolean;
  isPanelMoving: boolean;
  resizeDirection: string;
  dragOffset: { x: number; y: number };
  
  // 🆕 回転状態追加
  isCharacterRotating: boolean;
  rotationStartAngle: number;
  originalRotation: number;
  
  // リサイズ開始時の初期値
  initialBubbleBounds: {
    x: number; y: number; width: number; height: number;
  } | null;
  initialCharacterBounds: {
    x: number; y: number; width: number; height: number;
  } | null;
  
  // UI状態
  snapLines: Array<{
    x1: number; y1: number; x2: number; y2: number; 
    type: 'vertical' | 'horizontal';
  }>;
  editingBubble: SpeechBubble | null;
  editText: string;
}

export interface CanvasStateActions {
  // 選択状態更新
  setSelectedPanel: (panel: Panel | null) => void;
  setSelectedCharacter: (character: Character | null) => void;
  setSelectedBubble: (bubble: SpeechBubble | null) => void;
  
  // ドラッグ状態更新
  setIsDragging: (isDragging: boolean) => void;
  setIsCharacterResizing: (isResizing: boolean) => void;
  setIsBubbleResizing: (isResizing: boolean) => void;
  setIsPanelResizing: (isResizing: boolean) => void;
  setIsPanelMoving: (isMoving: boolean) => void;
  setResizeDirection: (direction: string) => void;
  setDragOffset: (offset: { x: number; y: number }) => void;

  // 🆕 回転関連アクション追加
  setIsCharacterRotating: (isRotating: boolean) => void;
  setRotationStartAngle: (angle: number) => void;
  setOriginalRotation: (rotation: number) => void;
  
  // 初期値設定
  setInitialBubbleBounds: (bounds: {
    x: number; y: number; width: number; height: number;
  } | null) => void;
  setInitialCharacterBounds: (bounds: {
    x: number; y: number; width: number; height: number;
  } | null) => void;
  
  // UI状態更新
  setSnapLines: (lines: Array<{
    x1: number; y1: number; x2: number; y2: number; 
    type: 'vertical' | 'horizontal';
  }>) => void;
  setEditingBubble: (bubble: SpeechBubble | null) => void;
  setEditText: (text: string) => void;
  
  // 全状態リセット
  resetAllStates: () => void;
  resetDragStates: () => void;
}

/**
 * Canvas操作に関する状態管理カスタムhook
 * 複雑な状態管理を一元化し、CanvasComponentの可読性を向上
 */
export const useCanvasState = (): [CanvasState, CanvasStateActions] => {
  // 基本選択状態
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedBubble, setSelectedBubble] = useState<SpeechBubble | null>(null);
  
  // ドラッグ&操作状態
  const [isDragging, setIsDragging] = useState(false);
  const [isCharacterResizing, setIsCharacterResizing] = useState(false);
  const [isBubbleResizing, setIsBubbleResizing] = useState(false);
  const [isPanelResizing, setIsPanelResizing] = useState(false);
  const [isPanelMoving, setIsPanelMoving] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>("");
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  

  // ドラッグ&操作状態の下に追加
  const [isCharacterRotating, setIsCharacterRotating] = useState(false);
  const [rotationStartAngle, setRotationStartAngle] = useState(0);
  const [originalRotation, setOriginalRotation] = useState(0);
  

  // リサイズ開始時の初期値
  const [initialBubbleBounds, setInitialBubbleBounds] = useState<{
    x: number; y: number; width: number; height: number;
  } | null>(null);
  const [initialCharacterBounds, setInitialCharacterBounds] = useState<{
    x: number; y: number; width: number; height: number;
  } | null>(null);
  
  // UI状態
  const [snapLines, setSnapLines] = useState<Array<{
    x1: number; y1: number; x2: number; y2: number; 
    type: 'vertical' | 'horizontal';
  }>>([]);
  const [editingBubble, setEditingBubble] = useState<SpeechBubble | null>(null);
  const [editText, setEditText] = useState("");

  // 状態オブジェクト
  const state: CanvasState = {
    selectedPanel,
    selectedCharacter,
    selectedBubble,
    isDragging,
    isCharacterRotating,
    rotationStartAngle,
    originalRotation,
    isCharacterResizing,
    isBubbleResizing,
    isPanelResizing,
    isPanelMoving,
    resizeDirection,
    dragOffset,
    initialBubbleBounds,
    initialCharacterBounds,
    snapLines,
    editingBubble,
    editText,
  };

  // 全状態リセット関数
  const resetAllStates = () => {
    setSelectedPanel(null);
    setSelectedCharacter(null);
    setSelectedBubble(null);
    resetDragStates();
    setSnapLines([]);
    setEditingBubble(null);
    setEditText("");
  };

  // ドラッグ状態リセット関数
  const resetDragStates = () => {
    setIsDragging(false);
    setIsCharacterResizing(false);
    setIsCharacterRotating(false); // ← 追加
    setRotationStartAngle(0);      // ← 追加
    setOriginalRotation(0);        // ← 追加
    setIsBubbleResizing(false);
    setIsPanelResizing(false);
    setIsPanelMoving(false);
    setResizeDirection("");
    setInitialBubbleBounds(null);
    setInitialCharacterBounds(null);
  };

  // アクションオブジェクト
  const actions: CanvasStateActions = {
    setSelectedPanel,
    setSelectedCharacter,
    setSelectedBubble,
    setIsDragging,
    setIsCharacterRotating,  // ← 追加
    setRotationStartAngle,   // ← 追加
    setOriginalRotation,     // ← 追加
    setIsCharacterResizing,
    setIsBubbleResizing,
    setIsPanelResizing,
    setIsPanelMoving,
    setResizeDirection,
    setDragOffset,
    setInitialBubbleBounds,
    setInitialCharacterBounds,
    setSnapLines,
    setEditingBubble,
    setEditText,
    resetAllStates,
    resetDragStates,
  };

  return [state, actions];
};

