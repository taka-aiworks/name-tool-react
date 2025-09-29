// src/components/UI/CharacterDetailPanel.tsx - 8カテゴリ完全対応版（人気順表示付き）
import React, { useEffect, useState } from "react";
import { Character } from "../../types";

// 辞書型定義
declare global {
  interface Window {
    DEFAULT_SFW_DICT: {
      SFW: {
        expressions: Array<{ tag: string; label: string }>;
        pose_manga: Array<{ tag: string; label: string }>;
        gaze: Array<{ tag: string; label: string }>;
        eye_state: Array<{ tag: string; label: string }>;
        mouth_state: Array<{ tag: string; label: string }>;
        hand_gesture: Array<{ tag: string; label: string }>;
        emotion_primary: Array<{ tag: string; label: string }>;
        physical_state: Array<{ tag: string; label: string }>;
      };
    };
  }
}

interface CharacterDetailPanelProps {
  selectedCharacter: Character | null;
  onCharacterUpdate: (character: Character) => void;
  onCharacterDelete?: (character: Character) => void;
  onClose?: () => void;
  characterNames?: Record<string, string>;
}

interface SearchableSelectProps {
  label: string;
  value: string;
  options: Array<{ tag: string; label: string }>;
  onChange: (value: string) => void;
  placeholder: string;
  isDarkMode: boolean;
  icon?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder,
  isDarkMode,
  icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);

  // 🆕 カテゴリ別人気タグ定義
  const getPopularTagsByCategory = (cat: string): string[] => {
    const popularTagsMap: Record<string, string[]> = {
      expressions: ['smiling', 'happy', 'neutral_expression', 'surprised', 'sad', 'angry'],
      poses: ['standing', 'sitting', 'pointing', 'waving', 'arms_crossed', 'hands_on_hips'],
      gazes: ['at_viewer', 'to_side', 'looking_back', 'away', 'down', 'up'],
      eyeStates: ['eyes_open', 'eyes_closed', 'wink_left', 'wink_right', 'wide_eyes'],
      mouthStates: ['mouth_closed', 'slight_smile', 'open_mouth', 'grin', 'frown'],
      handGestures: ['peace_sign', 'pointing', 'waving', 'thumbs_up', 'open_palm'],
      emotionsPrimary: ['joy', 'surprise', 'love', 'anger', 'sadness', 'fear'],
      physicalStates: ['healthy', 'energetic', 'tired', 'sleepy', 'sweating'],
      general: ['smiling', 'at_viewer', 'peace_sign', 'pointing', 'waving', 'standing']
    };
    return popularTagsMap[cat] || popularTagsMap.general;
  };

  // 🆕 人気順・おすすめ順でソート（カテゴリ対応版）
  useEffect(() => {
    console.log(`🔍 ソート処理開始 - ラベル: ${label}, 検索語: "${searchTerm}"`);
    
    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.tag.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // ラベルからカテゴリを推測
    let category = 'general';
    if (label.includes('表情')) category = 'expressions';
    else if (label.includes('ポーズ') || label.includes('動作')) category = 'poses';
    else if (label.includes('視線') || label.includes('向き')) category = 'gazes';
    else if (label.includes('目')) category = 'eyeStates';
    else if (label.includes('口')) category = 'mouthStates';
    else if (label.includes('手')) category = 'handGestures';
    else if (label.includes('感情')) category = 'emotionsPrimary';
    else if (label.includes('体調') || label.includes('状態')) category = 'physicalStates';
    
    const popularTags = getPopularTagsByCategory(category);
    console.log(`⭐ ${category}の人気タグ:`, popularTags);
    
    // 人気順・おすすめ順でソート
    const sortedFiltered = filtered.sort((a, b) => {
      const aIndex = popularTags.indexOf(a.tag);
      const bIndex = popularTags.indexOf(b.tag);
      
      // 人気タグ同士の場合は人気順
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      // 片方が人気タグの場合は人気タグを上に
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // 両方とも人気タグでない場合は日本語ラベルでソート
      return a.label.localeCompare(b.label, 'ja');
    });
    
    console.log(`✅ ソート完了: 最初の3件`, sortedFiltered.slice(0, 3).map(o => `${o.tag}(${o.label})`));
    
    setFilteredOptions(sortedFiltered);
  }, [searchTerm, options, label]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getCurrentLabel = () => {
    const isUnselected = !value || value.trim() === '' || 
      ['未選択', '選択してください', '未設定', 'none', 'null', 'undefined', 
       'default', 'normal', 'front', 'basic'].includes(value.toLowerCase());
    
    if (isUnselected) {
      return placeholder;
    }
    
    const current = options.find(opt => opt.tag === value);
    return current ? `${current.tag} (${current.label})` : value;
  };

  const containerStyle = {
    position: 'relative' as const,
    marginBottom: '8px',
  };

  const selectButtonStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: `1px solid ${isDarkMode ? "#555" : "#ccc"}`,
    background: isDarkMode ? "#3d3d3d" : "white",
    color: isDarkMode ? "#fff" : "#333",
    fontSize: '12px',
    textAlign: 'left' as const,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const dropdownStyle = {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    background: isDarkMode ? "#2d2d2d" : "white",
    border: `1px solid ${isDarkMode ? "#555" : "#ccc"}`,
    borderRadius: '6px',
    maxHeight: '200px',
    overflowY: 'auto' as const,
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  };

  const searchInputStyle = {
    width: '100%',
    padding: '8px',
    border: 'none',
    borderBottom: `1px solid ${isDarkMode ? "#555" : "#ccc"}`,
    background: 'transparent',
    color: isDarkMode ? "#fff" : "#333",
    fontSize: '12px',
    outline: 'none',
  };

  const optionStyle = (isHovered: boolean) => ({
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '12px',
    background: isHovered ? (isDarkMode ? "#4d4d4d" : "#f0f0f0") : 'transparent',
    color: isDarkMode ? "#fff" : "#333",
  });

  const unselectedOptionStyle = (isHovered: boolean) => ({
    ...optionStyle(isHovered),
    borderBottom: `1px solid ${isDarkMode ? "#444" : "#ddd"}`,
    fontStyle: 'italic' as const,
    color: isDarkMode ? "#888" : "#666",
  });

  // 🔧 検索ボックスのキーイベント処理を追加
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // イベントの伝播を停止（親コンポーネントのキーハンドラーを防ぐ）
    e.stopPropagation();
    
    // Escapeキーで検索をクリア
    if (e.key === 'Escape') {
      setSearchTerm('');
      e.preventDefault();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div style={containerStyle}>
      <button
        style={selectButtonStyle}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span style={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {icon && <span>{icon}</span>}
          {getCurrentLabel()}
        </span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div style={dropdownStyle}>
          <input
            type="text"
            placeholder={`${label}を検索...`}
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}  // 🔧 キーイベント処理を追加
            style={searchInputStyle}
            autoFocus
          />
          <div>
            {/* 未選択オプションを最上位に固定表示 */}
            <div
              style={unselectedOptionStyle(false)}
              onClick={() => handleSelect('')}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = isDarkMode ? "#444" : "#f0f0f0";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = 'transparent';
              }}
            >
              <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {icon && <span>{icon}</span>}
                未選択
              </div>
              <div style={{ fontSize: '10px', opacity: 0.7 }}>プロンプトに出力しない</div>
            </div>
            
            {/* 🆕 人気タグ表示（最大20項目） */}
            {filteredOptions.slice(0, 20).map((option) => {
              // 人気タグかどうかチェック
              let popularTags: string[] = [];
              if (label.includes('表情')) {
                popularTags = ['smiling', 'happy', 'surprised', 'angry_look', 'blushing', 'sad'];
              } else if (label.includes('ポーズ') || label.includes('動作')) {  // 🔧 この行を追加
                popularTags = ['standing', 'sitting', 'walking', 'running', 'arms_crossed', 'hands_on_hips'];
              } else if (label.includes('視線') || label.includes('向き')) {  // 🔧 この行を追加
                popularTags = ['at_viewer', 'to_side', 'away', 'down', 'up', 'looking_back'];
              } else if (label.includes('目')) {  // 🔧 この行を追加
                popularTags = ['eyes_open', 'eyes_closed', 'eyes_half_closed', 'wink_left', 'wink_right'];
              } else if (label.includes('口')) {
                popularTags = ['open_mouth', 'mouth_closed', 'slight_smile', 'grin', 'tongue_out_small', 'pouting_mouth'];
              } else if (label.includes('手')) {
                popularTags = ['peace_sign', 'pointing', 'waving', 'thumbs_up', 'arms_crossed', 'hands_on_hips'];
              } else if (label.includes('感情')) {
                popularTags = ['joy', 'surprise', 'anger', 'sadness', 'embarrassment', 'calm'];
              } else if (label.includes('体調') || label.includes('状態')) {
                popularTags = ['healthy', 'energetic', 'tired', 'sleepy', 'sweating', 'sick'];
              } else {
                popularTags = ['smiling', 'peace_sign', 'open_mouth', 'joy', 'healthy'];
              }
              const isPopular = popularTags.includes(option.tag);
              
              return (
                <div
                  key={option.tag}
                  style={optionStyle(false)}
                  onClick={() => handleSelect(option.tag)}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.background = isDarkMode ? "#4d4d4d" : "#f0f0f0";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {icon && <span>{icon}</span>}
                    {isPopular && <span style={{ color: '#ff9800' }}>⭐</span>}
                    {option.label}
                  </div>
                  <div style={{ fontSize: '10px', opacity: 0.7 }}>{option.tag}</div>
                </div>
              );
            })}
            {filteredOptions.length === 0 && (
              <div style={{ padding: '12px', textAlign: 'center', opacity: 0.5 }}>
                該当する項目が見つかりません
              </div>
            )}
            {filteredOptions.length > 20 && (
              <div style={{ padding: '8px', textAlign: 'center', fontSize: '11px', opacity: 0.7 }}>
                さらに絞り込んでください...（⭐は人気項目）
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CharacterDetailPanel: React.FC<CharacterDetailPanelProps> = ({
  selectedCharacter,
  onCharacterUpdate,
  onCharacterDelete,
  onClose,
  characterNames = {}
}) => {
  const [dictData, setDictData] = useState<{
    expressions: Array<{ tag: string; label: string }>;
    poses: Array<{ tag: string; label: string }>;
    gazes: Array<{ tag: string; label: string }>;
    eyeStates: Array<{ tag: string; label: string }>;
    mouthStates: Array<{ tag: string; label: string }>;
    handGestures: Array<{ tag: string; label: string }>;
    emotionsPrimary: Array<{ tag: string; label: string }>;
    physicalStates: Array<{ tag: string; label: string }>;
  }>({
    expressions: [],
    poses: [],
    gazes: [],
    eyeStates: [],
    mouthStates: [],
    handGestures: [],
    emotionsPrimary: [],
    physicalStates: []
  });

  // 🔧 8カテゴリ対応の辞書データ読み込み
  useEffect(() => {
    if (typeof window !== 'undefined' && window.DEFAULT_SFW_DICT) {
      const dict = window.DEFAULT_SFW_DICT.SFW;
      const loadedData = {
        expressions: dict.expressions || [],
        poses: dict.pose_manga || [],
        gazes: dict.gaze || [],
        eyeStates: dict.eye_state || [],
        mouthStates: dict.mouth_state || [],
        handGestures: dict.hand_gesture || [],
        emotionsPrimary: dict.emotion_primary || [],
        physicalStates: dict.physical_state || []
      };
      
      // 🔍 デバッグ: 辞書読み込み確認
      console.log('🎭 辞書データ読み込み確認:', {
        expressions: loadedData.expressions.length,
        poses: loadedData.poses.length,
        gazes: loadedData.gazes.length,
        eyeStates: loadedData.eyeStates.length,
        mouthStates: loadedData.mouthStates.length,
        handGestures: loadedData.handGestures.length,
        emotionsPrimary: loadedData.emotionsPrimary.length,
        physicalStates: loadedData.physicalStates.length
      });
      
      setDictData(loadedData);
    } else {
      // 🆕 8カテゴリ対応のフォールバック辞書
      setDictData({
        expressions: [
          { tag: "neutral_expression", label: "普通の表情" },
          { tag: "smiling", label: "笑顔" },
          { tag: "happy", label: "嬉しい" },
          { tag: "sad", label: "悲しい" },
          { tag: "angry", label: "怒り" },
          { tag: "surprised", label: "驚き" },
          { tag: "embarrassed", label: "恥ずかしい" },
          { tag: "serious", label: "真剣" },
          { tag: "worried", label: "心配" },
          { tag: "confused", label: "困惑" }
        ],
        poses: [
          { tag: "standing", label: "立ち" },
          { tag: "sitting", label: "座り" },
          { tag: "walking", label: "歩く" },
          { tag: "running", label: "走る" },
          { tag: "arms_crossed", label: "腕組み" },
          { tag: "hands_on_hips", label: "腰に手" },
          { tag: "pointing", label: "指差し" },
          { tag: "waving", label: "手を振る" },
          { tag: "leaning", label: "もたれかかる" },
          { tag: "kneeling", label: "ひざまずく" }
        ],
        gazes: [
          { tag: "at_viewer", label: "こちらを見る" },
          { tag: "to_side", label: "横を見る" },
          { tag: "away", label: "そっぽを向く" },
          { tag: "down", label: "下を見る" },
          { tag: "up", label: "上を見る" },
          { tag: "looking_back", label: "振り返る" },
          { tag: "sideways_glance", label: "横目" },
          { tag: "distant_gaze", label: "遠くを見る" }
        ],
        eyeStates: [
          { tag: "eyes_open", label: "目を開ける" },
          { tag: "eyes_closed", label: "目を閉じる" },
          { tag: "wink_left", label: "左ウインク" },
          { tag: "wink_right", label: "右ウインク" },
          { tag: "half_closed_eyes", label: "半目" },
          { tag: "wide_eyes", label: "目を見開く" },
          { tag: "sleepy_eyes", label: "眠そうな目" },
          { tag: "sparkling_eyes", label: "キラキラした目" }
        ],
        mouthStates: [
          { tag: "mouth_closed", label: "口を閉じる" },
          { tag: "open_mouth", label: "口を開ける" },
          { tag: "slight_smile", label: "微笑み" },
          { tag: "grin", label: "歯を見せて笑う" },
          { tag: "frown", label: "しかめ面" },
          { tag: "pouting", label: "ふくれっ面" },
          { tag: "lips_pursed", label: "唇をすぼめる" },
          { tag: "tongue_out", label: "舌を出す" }
        ],
        handGestures: [
          { tag: "peace_sign", label: "ピースサイン" },
          { tag: "pointing", label: "指差し" },
          { tag: "waving", label: "手を振る" },
          { tag: "thumbs_up", label: "サムズアップ" },
          { tag: "clenched_fist", label: "握りこぶし" },
          { tag: "open_palm", label: "手のひらを向ける" },
          { tag: "covering_mouth", label: "口を覆う" },
          { tag: "hands_clasped", label: "手を合わせる" }
        ],
        emotionsPrimary: [
          { tag: "joy", label: "喜び" },
          { tag: "anger", label: "怒り" },
          { tag: "sadness", label: "悲しみ" },
          { tag: "fear", label: "恐れ" },
          { tag: "surprise", label: "驚き" },
          { tag: "disgust", label: "嫌悪" },
          { tag: "contempt", label: "軽蔑" },
          { tag: "love", label: "愛情" },
          { tag: "anticipation", label: "期待" },
          { tag: "trust", label: "信頼" }
        ],
        physicalStates: [
          { tag: "healthy", label: "健康" },
          { tag: "tired", label: "疲れた" },
          { tag: "sick", label: "体調不良" },
          { tag: "energetic", label: "元気" },
          { tag: "exhausted", label: "疲労困憊" },
          { tag: "sleepy", label: "眠い" },
          { tag: "dizzy", label: "めまい" },
          { tag: "injured", label: "怪我" },
          { tag: "sweating", label: "汗をかく" },
          { tag: "trembling", label: "震えている" }
        ]
      });
    }
  }, []);

  if (!selectedCharacter) return null;

  const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";

  const getCharacterDisplayName = (character: Character) => {
    return characterNames[character.type] || character.name || 'キャラクター';
  };

  const displayName = getCharacterDisplayName(selectedCharacter);

  const handleUpdate = (updates: Partial<Character>) => {
    const cleanedUpdates = Object.fromEntries(
      Object.entries(updates).map(([key, value]) => [
        key,
        typeof value === 'string' && value.trim() === '' ? undefined : value
      ])
    );
    
    onCharacterUpdate({ ...selectedCharacter, ...cleanedUpdates });
  };

  const handleDelete = () => {
    if (window.confirm(`「${displayName}」を削除しますか？`)) {
      if (onCharacterDelete) {
        onCharacterDelete(selectedCharacter);
      }
    }
  };

  const getDisplayValue = (value: any): string => {
    if (!value || value.toString().trim() === '') return '未選択';
    
    const unselectedValues = ['未選択', '選択してください', '未設定', 'none', 'null', 'undefined', 'default', 'normal', 'front', 'basic'];
    if (unselectedValues.includes(value.toString().toLowerCase())) {
      return '未選択';
    }
    
    return value.toString();
  };

  // 🆕 8項目設定完成度の計算
  const calculateCompletionRate = (): { count: number; total: number; percentage: number } => {
    const settings = [
      selectedCharacter.expression,
      selectedCharacter.action,
      selectedCharacter.facing,
      (selectedCharacter as any).eyeState,
      (selectedCharacter as any).mouthState,
      (selectedCharacter as any).handGesture,
      (selectedCharacter as any).emotion_primary,
      (selectedCharacter as any).physical_state
    ];
    
    const validSettings = settings.filter(s => 
      s && s.toString().trim() !== '' && 
      !['未選択', 'none', 'null', 'undefined', 'default', 'normal', 'front'].includes(s.toString().toLowerCase())
    ).length;
    
    return {
      count: validSettings,
      total: 8,
      percentage: Math.round((validSettings / 8) * 100)
    };
  };

  // スタイル定義
  const panelStyle = {
    position: "absolute" as const,
    top: "80px",
    right: "10px",
    background: isDarkMode ? "#2d2d2d" : "white",
    border: `2px solid ${isDarkMode ? "#555555" : "#0066ff"}`,
    borderRadius: "12px",
    padding: "18px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
    minWidth: "360px",
    maxWidth: "420px",
    zIndex: 1000,
    color: isDarkMode ? "#ffffff" : "#333333",
    maxHeight: "90vh",
    overflowY: "auto" as const,
  };

  // 🔧 パネル全体のキーイベント防止
  const handlePanelKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // 危険なキーイベントの伝播を防ぐ
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Escape') {
      e.stopPropagation();
    }
  };

  const buttonStyle = (isActive: boolean) => ({
    padding: "8px 12px",
    fontSize: "12px",
    border: "2px solid",
    borderRadius: "6px",
    cursor: "pointer",
    textAlign: "center" as const,
    transition: "all 0.2s ease",
    fontWeight: isActive ? "bold" : "normal",
    minHeight: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    background: isActive 
      ? (isDarkMode ? "#ff8833" : "#0066ff")
      : (isDarkMode ? "#3d3d3d" : "white"),
    borderColor: isActive 
      ? (isDarkMode ? "#ff8833" : "#0066ff")
      : (isDarkMode ? "#666666" : "#cccccc"),
    color: isActive 
      ? "white" 
      : (isDarkMode ? "#ffffff" : "#333333"),
    transform: isActive ? "scale(1.02)" : "scale(1)",
  });

  const sectionStyle = {
    marginBottom: "16px",
    padding: "12px",
    background: isDarkMode ? "#1a1a1a" : "#f8f9fa",
    borderRadius: "8px",
    border: `1px solid ${isDarkMode ? "#444444" : "#e9ecef"}`,
  };

  const labelStyle = {
    fontSize: "13px",
    fontWeight: "bold" as const,
    color: isDarkMode ? "#ffffff" : "#333333",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const completion = calculateCompletionRate();

  return (
    <div style={panelStyle} onKeyDown={handlePanelKeyDown}>
      {/* ヘッダー */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "16px",
        borderBottom: `2px solid ${isDarkMode ? "#ff8833" : "#0066ff"}`,
        paddingBottom: "8px",
      }}>
        <h4 style={{ 
          margin: "0", 
          color: isDarkMode ? "#ff8833" : "#0066ff",
          fontSize: "16px",
          fontWeight: "bold",
        }}>
          🎭 {displayName}
        </h4>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              color: isDarkMode ? "#cccccc" : "#666",
              padding: "4px",
              borderRadius: "4px",
            }}
          >
            ✕
          </button>
        )}
      </div>


      {/* 📷 表示タイプ（ラジオボタン）*/}
      <div style={sectionStyle}>
        <label style={labelStyle}>📷 表示タイプ</label>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(2, 1fr)", 
          gap: "6px",
          width: "100%"
        }}>
          {[
            { value: "face", label: "顔のみ", emoji: "👤" },
            { value: "close_up_face", label: "クローズアップ", emoji: "🔍" },
            { value: "upper_body", label: "上半身", emoji: "👔" },
            { value: "chest_up", label: "胸から上", emoji: "👕" },
            { value: "three_quarters", label: "膝上程度", emoji: "🦵" },
            { value: "full_body", label: "全身", emoji: "🧍" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleUpdate({ viewType: option.value as any })}
              style={{
                ...buttonStyle(selectedCharacter.viewType === option.value),
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                padding: "6px 8px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              <span>{option.emoji}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 🎭 基本4項目詳細設定 */}
      <div style={sectionStyle}>
        <label style={labelStyle}>🎭 基本詳細設定</label>
        
        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', marginBottom: '4px', display: 'block' }}>😊 表情</label>
          <SearchableSelect
            label="表情"
            value={selectedCharacter.expression || ''}
            options={dictData.expressions}
            onChange={(value) => handleUpdate({ expression: value })}
            placeholder="未選択（出力しない）"
            isDarkMode={isDarkMode}
            icon="👀"
          />
        </div>
        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', marginBottom: '4px', display: 'block' }}>🤸 ポーズ・動作</label>
          <SearchableSelect
            label="ポーズ・動作"
            value={selectedCharacter.action || ''}
            options={dictData.poses}
            onChange={(value) => handleUpdate({ action: value })}
            placeholder="未選択（出力しない）"
            isDarkMode={isDarkMode}
            icon="🤸"
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', marginBottom: '4px', display: 'block' }}>👁️ 視線・向き</label>
          <SearchableSelect
            label="視線・向き"
            value={selectedCharacter.facing || ''}
            options={dictData.gazes}
            onChange={(value) => handleUpdate({ facing: value })}
            placeholder="未選択（出力しない）"
            isDarkMode={isDarkMode}
            icon="👁️"
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', marginBottom: '4px', display: 'block' }}>👀 目の状態</label>
          <SearchableSelect
            label="目の状態"
            value={(selectedCharacter as any).eyeState || ''}
            options={dictData.eyeStates}
            onChange={(value) => handleUpdate({ eyeState: value } as any)}
            placeholder="未選択（出力しない）"
            isDarkMode={isDarkMode}
            icon="👀"
          />
        </div>
      </div>

      {/* 🆕 新規4項目詳細設定 */}
      <div style={sectionStyle}>
        <label style={labelStyle}>🆕 拡張詳細設定</label>
        
        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', marginBottom: '4px', display: 'block' }}>👄 口の状態</label>
          <SearchableSelect
            label="口の状態"
            value={(selectedCharacter as any).mouthState || ''}
            options={dictData.mouthStates}
            onChange={(value) => handleUpdate({ mouthState: value } as any)}
            placeholder="未選択（出力しない）"
            isDarkMode={isDarkMode}
            icon="👄"
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', marginBottom: '4px', display: 'block' }}>✋ 手の動作</label>
          <SearchableSelect
            label="手の動作"
            value={(selectedCharacter as any).handGesture || ''}
            options={dictData.handGestures}
            onChange={(value) => handleUpdate({ handGesture: value } as any)}
            placeholder="未選択（出力しない）"
            isDarkMode={isDarkMode}
            icon="✋"
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', marginBottom: '4px', display: 'block' }}>💗 基本感情</label>
          <SearchableSelect
            label="基本感情"
            value={(selectedCharacter as any).emotion_primary || ''}
            options={dictData.emotionsPrimary}
            onChange={(value) => handleUpdate({ emotion_primary: value } as any)}
            placeholder="未選択（出力しない）"
            isDarkMode={isDarkMode}
            icon="💗"
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', marginBottom: '4px', display: 'block' }}>🏃 体調・状態</label>
          <SearchableSelect
            label="体調・状態"
            value={(selectedCharacter as any).physical_state || ''}
            options={dictData.physicalStates}
            onChange={(value) => handleUpdate({ physical_state: value } as any)}
            placeholder="未選択（出力しない）"
            isDarkMode={isDarkMode}
            icon="🏃"
          />
        </div>
      </div>

      {/* 📏 サイズ設定 */}
      <div style={sectionStyle}>
        <label style={labelStyle}>📏 サイズ: {selectedCharacter.scale.toFixed(1)}倍</label>
        <input
          type="range"
          min="0.5"
          max="3.0"
          step="0.1"
          value={selectedCharacter.scale}
          onChange={(e) => handleUpdate({ scale: parseFloat(e.target.value) })}
          style={{
            width: "100%",
            height: "4px",
            background: isDarkMode ? "#3d3d3d" : "#e9ecef",
            borderRadius: "2px",
            outline: "none",
            cursor: "pointer",
          }}
        />
        <div style={{ 
          fontSize: "10px", 
          color: isDarkMode ? "#888" : "#666", 
          textAlign: "center",
          marginTop: "4px",
          display: "flex",
          justifyContent: "space-between",
        }}>
          <span>0.5倍</span>
          <span>標準</span>
          <span>3.0倍</span>
        </div>
      </div>

      {/* 📋 設定中の情報 */}
      <div style={{
        ...sectionStyle,
        background: isDarkMode ? "#0d1117" : "#f0f8ff",
        border: `1px solid ${isDarkMode ? "#30363d" : "#b6e3ff"}`,
      }}>
        <label style={labelStyle}>📋 設定中の情報</label>
        
        {/* キャラクター基本情報 */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ 
            fontSize: "11px", 
            fontWeight: "600", 
            color: isDarkMode ? "#f0f6fc" : "#24292f",
            marginBottom: "6px"
          }}>
            👤 キャラクター基本情報
          </div>
          <div style={{ fontSize: "10px", color: isDarkMode ? "#8b949e" : "#666" }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              <div>名前: {selectedCharacter.name}</div>
              <div>役割: {selectedCharacter.characterId === 'protagonist' ? '主人公' : 
                           selectedCharacter.characterId === 'heroine' ? 'ヒロイン' :
                           selectedCharacter.characterId === 'friend' ? '友人' : 'その他'}</div>
              <div>性別: {selectedCharacter.characterId === 'protagonist' ? '男性' : 
                         selectedCharacter.characterId === 'heroine' ? '女性' : '未設定'}</div>
              <div>外見: {getDisplayValue((selectedCharacter as any).hairColor) || '未設定'}</div>
            </div>
          </div>
        </div>

        {/* 8カテゴリ設定状況 */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ 
            fontSize: "11px", 
            fontWeight: "600", 
            color: isDarkMode ? "#f0f6fc" : "#24292f",
            marginBottom: "6px"
          }}>
            🎭 8カテゴリ設定状況
          </div>
          <div style={{ fontSize: "10px", color: isDarkMode ? "#8b949e" : "#666" }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                表情: {getDisplayValue(selectedCharacter.expression)} 
                {selectedCharacter.expression ? <span style={{ color: '#22c55e' }}>✓</span> : <span style={{ color: '#ef4444' }}>❌</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                動作: {getDisplayValue(selectedCharacter.action)}
                {selectedCharacter.action ? <span style={{ color: '#22c55e' }}>✓</span> : <span style={{ color: '#ef4444' }}>❌</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                向き: {getDisplayValue(selectedCharacter.facing)}
                {selectedCharacter.facing ? <span style={{ color: '#22c55e' }}>✓</span> : <span style={{ color: '#ef4444' }}>❌</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                目の状態: {getDisplayValue((selectedCharacter as any).eyeState)}
                {(selectedCharacter as any).eyeState ? <span style={{ color: '#22c55e' }}>✓</span> : <span style={{ color: '#ef4444' }}>❌</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                口の状態: {getDisplayValue((selectedCharacter as any).mouthState)}
                {(selectedCharacter as any).mouthState ? <span style={{ color: '#22c55e' }}>✓</span> : <span style={{ color: '#ef4444' }}>❌</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                手の動作: {getDisplayValue((selectedCharacter as any).handGesture)}
                {(selectedCharacter as any).handGesture ? <span style={{ color: '#22c55e' }}>✓</span> : <span style={{ color: '#ef4444' }}>❌</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                感情: {getDisplayValue((selectedCharacter as any).emotion_primary)}
                {(selectedCharacter as any).emotion_primary ? <span style={{ color: '#22c55e' }}>✓</span> : <span style={{ color: '#ef4444' }}>❌</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                体調: {getDisplayValue((selectedCharacter as any).physical_state)}
                {(selectedCharacter as any).physical_state ? <span style={{ color: '#22c55e' }}>✓</span> : <span style={{ color: '#ef4444' }}>❌</span>}
              </div>
            </div>
          </div>
        </div>

        {/* 表示設定 */}
        <div>
          <div style={{ 
            fontSize: "11px", 
            fontWeight: "600", 
            color: isDarkMode ? "#f0f6fc" : "#24292f",
            marginBottom: "6px"
          }}>
            📐 表示設定
          </div>
          <div style={{ fontSize: "10px", color: isDarkMode ? "#8b949e" : "#666" }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              <div>表示タイプ: {selectedCharacter.viewType === "face" ? "顔のみ" : 
                               selectedCharacter.viewType === "close_up_face" ? "クローズアップ" :
                               selectedCharacter.viewType === "upper_body" ? "上半身" :
                               selectedCharacter.viewType === "chest_up" ? "胸から上" :
                               selectedCharacter.viewType === "three_quarters" ? "膝上程度" :
                               selectedCharacter.viewType === "full_body" ? "全身" : "未設定"}</div>
              <div>位置: ({Math.round(selectedCharacter.x || 0)}, {Math.round(selectedCharacter.y || 0)})</div>
              <div>サイズ: {Math.round(selectedCharacter.width || 0)}×{Math.round(selectedCharacter.height || 0)}px</div>
              <div>回転: {selectedCharacter.rotation ? `${Math.round(selectedCharacter.rotation)}°` : '0°'}</div>
            </div>
          </div>
        </div>
      </div>


      {/* 🆕 カテゴリ別設定状況 */}
      <div style={sectionStyle}>
        <label style={labelStyle}>📊 カテゴリ別設定状況</label>
        <div style={{ fontSize: "10px", color: isDarkMode ? "#8b949e" : "#666" }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'center' }}>
            <div>😊 表情・感情</div>
            <div style={{ color: (selectedCharacter.expression || (selectedCharacter as any).emotion_primary) ? "#22c55e" : "#ef4444" }}>
              {(selectedCharacter.expression || (selectedCharacter as any).emotion_primary) ? "✅" : "❌"}
            </div>
            
            <div>🤸 ポーズ・動作</div>
            <div style={{ color: (selectedCharacter.action || (selectedCharacter as any).handGesture) ? "#22c55e" : "#ef4444" }}>
              {(selectedCharacter.action || (selectedCharacter as any).handGesture) ? "✅" : "❌"}
            </div>
            
            <div>👀 視線・顔の詳細</div>
            <div style={{ color: (selectedCharacter.facing || (selectedCharacter as any).eyeState || (selectedCharacter as any).mouthState) ? "#22c55e" : "#ef4444" }}>
              {(selectedCharacter.facing || (selectedCharacter as any).eyeState || (selectedCharacter as any).mouthState) ? "✅" : "❌"}
            </div>
            
            <div>🏃 体調・状態</div>
            <div style={{ color: (selectedCharacter as any).physical_state ? "#22c55e" : "#ef4444" }}>
              {(selectedCharacter as any).physical_state ? "✅" : "❌"}
            </div>
          </div>
        </div>
      </div>


      {/* 🗑️ 削除ボタン */}
      {onCharacterDelete && (
        <div style={{ 
          borderTop: `1px solid ${isDarkMode ? "#555" : "#eee"}`, 
          paddingTop: "12px",
        }}>
          <button
            onClick={handleDelete}
            style={{
              width: "100%",
              padding: "8px",
              background: "#ff4444",
              color: "white",
              border: "2px solid #ff2222",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            🗑️ キャラクターを削除
          </button>
        </div>
      )}
    </div>
  );
};

export default CharacterDetailPanel;