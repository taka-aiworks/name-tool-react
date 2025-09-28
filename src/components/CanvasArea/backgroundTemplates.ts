// src/components/CanvasArea/backgroundTemplates.ts - 実際背景描画対応版
import { BackgroundTemplate } from '../../types';

// 背景カテゴリ定義
export const backgroundCategories = [
  { id: 'nature', icon: '🌲', name: '自然' },
  { id: 'indoor', icon: '🏠', name: '室内' },
  { id: 'school', icon: '🏫', name: '学校' },
  { id: 'city', icon: '🏙️', name: '街' },
  { id: 'abstract', icon: '🎨', name: '抽象' },
  { id: 'emotion', icon: '💭', name: '感情' },
];

// 🆕 実際背景描画対応版テンプレート定義
// 各テンプレートは複数要素で構成されるが、UIでは1つの背景として表示される
export const backgroundTemplates: BackgroundTemplate[] = [
  // ==========================================
  // 自然系背景（複合描画）
  // ==========================================
  {
    id: 'sky_blue',
    name: '青空',
    category: 'nature',
    elements: [
      // 空のグラデーション
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 1,
        gradientType: 'linear',
        gradientColors: ['#87CEEB', '#E0F6FF'],
        gradientDirection: 180
      },
      // 雲パターン（白い円形パターン）
      {
        type: 'pattern',
        x: 0, y: 0, width: 1, height: 0.4,
        rotation: 0, zIndex: 1, opacity: 0.8,
        patternType: 'dots',
        patternColor: '#FFFFFF',
        patternSize: 12,
        patternSpacing: 40
      },
      // より小さい雲
      {
        type: 'pattern',
        x: 0.2, y: 0.1, width: 0.8, height: 0.3,
        rotation: 0, zIndex: 2, opacity: 0.6,
        patternType: 'dots',
        patternColor: '#F0F8FF',
        patternSize: 8,
        patternSpacing: 60
      }
    ]
  },
  {
    id: 'sunset',
    name: '夕焼け',
    category: 'nature',
    elements: [
      // 夕焼け空のグラデーション
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 1,
        gradientType: 'linear',
        gradientColors: ['#FF6B6B', '#FFE66D', '#FF8E53'],
        gradientDirection: 180
      },
      // 太陽
      {
        type: 'solid',
        x: 0.7, y: 0.15, width: 0.15, height: 0.15,
        rotation: 0, zIndex: 1, opacity: 0.9,
        solidColor: '#FFF700'
      },
      // 雲のシルエット
      {
        type: 'pattern',
        x: 0, y: 0.2, width: 1, height: 0.3,
        rotation: 0, zIndex: 2, opacity: 0.4,
        patternType: 'dots',
        patternColor: '#8B4513',
        patternSize: 20,
        patternSpacing: 80
      }
    ]
  },
  {
    id: 'forest',
    name: '森',
    category: 'nature',
    elements: [
      // 空の背景
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 0.4,
        rotation: 0, zIndex: 0, opacity: 1,
        gradientType: 'linear',
        gradientColors: ['#87CEEB', '#98FB98'],
        gradientDirection: 180
      },
      // 遠景の山
      {
        type: 'solid',
        x: 0, y: 0.25, width: 1, height: 0.35,
        rotation: 0, zIndex: 1, opacity: 0.7,
        solidColor: '#228B22'
      },
      // 森のシルエット（縦線パターン）
      {
        type: 'pattern',
        x: 0, y: 0.4, width: 1, height: 0.6,
        rotation: 0, zIndex: 2, opacity: 0.8,
        patternType: 'lines',
        patternColor: '#2D5016',
        patternSize: 3,
        patternSpacing: 15
      },
      // 地面
      {
        type: 'solid',
        x: 0, y: 0.85, width: 1, height: 0.15,
        rotation: 0, zIndex: 3, opacity: 1,
        solidColor: '#8B4513'
      }
    ]
  },

  // ==========================================
  // 室内系背景（具体的な要素追加）
  // ==========================================
  {
    id: 'living_room',
    name: 'リビング',
    category: 'indoor',
    elements: [
      // 壁
      {
        type: 'solid',
        x: 0, y: 0, width: 1, height: 0.7,
        rotation: 0, zIndex: 0, opacity: 1,
        solidColor: '#F5F5DC'
      },
      // 床
      {
        type: 'solid',
        x: 0, y: 0.7, width: 1, height: 0.3,
        rotation: 0, zIndex: 1, opacity: 1,
        solidColor: '#DEB887'
      },
      // 床の木目パターン
      {
        type: 'pattern',
        x: 0, y: 0.7, width: 1, height: 0.3,
        rotation: 0, zIndex: 2, opacity: 0.3,
        patternType: 'lines',
        patternColor: '#8B7355',
        patternSize: 2,
        patternSpacing: 12
      },
      // 壁の装飾（額縁風）
      {
        type: 'pattern',
        x: 0.2, y: 0.2, width: 0.6, height: 0.3,
        rotation: 0, zIndex: 3, opacity: 0.4,
        patternType: 'grid',
        patternColor: '#D2691E',
        patternSize: 1,
        patternSpacing: 20
      }
    ]
  },
  {
    id: 'bedroom',
    name: '寝室',
    category: 'indoor',
    elements: [
      // 壁（温かみのあるピンク）
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 0.7,
        rotation: 0, zIndex: 0, opacity: 1,
        gradientType: 'linear',
        gradientColors: ['#FFB6C1', '#FFF0F5'],
        gradientDirection: 180
      },
      // 床
      {
        type: 'solid',
        x: 0, y: 0.7, width: 1, height: 0.3,
        rotation: 0, zIndex: 1, opacity: 1,
        solidColor: '#F0E68C'
      },
      // ベッド（簡易表現）
      {
        type: 'solid',
        x: 0.1, y: 0.5, width: 0.8, height: 0.2,
        rotation: 0, zIndex: 2, opacity: 0.8,
        solidColor: '#FFFFFF'
      },
      // カーテンパターン
      {
        type: 'pattern',
        x: 0.7, y: 0.1, width: 0.25, height: 0.5,
        rotation: 0, zIndex: 3, opacity: 0.6,
        patternType: 'lines',
        patternColor: '#FF69B4',
        patternSize: 2,
        patternSpacing: 8
      }
    ]
  },
  {
    id: 'kitchen',
    name: 'キッチン',
    category: 'indoor',
    elements: [
      // 壁
      {
        type: 'solid',
        x: 0, y: 0, width: 1, height: 0.7,
        rotation: 0, zIndex: 0, opacity: 1,
        solidColor: '#FFFAF0'
      },
      // 床（タイル調）
      {
        type: 'solid',
        x: 0, y: 0.7, width: 1, height: 0.3,
        rotation: 0, zIndex: 1, opacity: 1,
        solidColor: '#F0F0F0'
      },
      // タイルのグリッドパターン
      {
        type: 'pattern',
        x: 0, y: 0.7, width: 1, height: 0.3,
        rotation: 0, zIndex: 2, opacity: 0.3,
        patternType: 'grid',
        patternColor: '#C0C0C0',
        patternSize: 1,
        patternSpacing: 20
      },
      // キッチンカウンター
      {
        type: 'solid',
        x: 0, y: 0.5, width: 1, height: 0.15,
        rotation: 0, zIndex: 3, opacity: 0.7,
        solidColor: '#8B4513'
      }
    ]
  },

  // ==========================================
  // 学校系背景（具体的な要素追加）
  // ==========================================
  {
    id: 'classroom',
    name: '教室',
    category: 'school',
    elements: [
      // 壁
      {
        type: 'solid',
        x: 0, y: 0, width: 1, height: 0.7,
        rotation: 0, zIndex: 0, opacity: 1,
        solidColor: '#F0F8FF'
      },
      // 床
      {
        type: 'solid',
        x: 0, y: 0.7, width: 1, height: 0.3,
        rotation: 0, zIndex: 1, opacity: 1,
        solidColor: '#DEB887'
      },
      // 黒板
      {
        type: 'solid',
        x: 0.1, y: 0.15, width: 0.8, height: 0.35,
        rotation: 0, zIndex: 2, opacity: 1,
        solidColor: '#2F4F2F'
      },
      // 机の配置（ドットパターンで表現）
      {
        type: 'pattern',
        x: 0.1, y: 0.55, width: 0.8, height: 0.2,
        rotation: 0, zIndex: 3, opacity: 0.6,
        patternType: 'dots',
        patternColor: '#8B4513',
        patternSize: 6,
        patternSpacing: 25
      }
    ]
  },
  {
    id: 'hallway',
    name: '廊下',
    category: 'school',
    elements: [
      // 基本グラデーション
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 1,
        gradientType: 'linear',
        gradientColors: ['#E6E6FA', '#F8F8FF'],
        gradientDirection: 90
      },
      // 床
      {
        type: 'solid',
        x: 0, y: 0.7, width: 1, height: 0.3,
        rotation: 0, zIndex: 1, opacity: 1,
        solidColor: '#D2B48C'
      },
      // 遠近感を表現する線
      {
        type: 'pattern',
        x: 0, y: 0.4, width: 1, height: 0.3,
        rotation: 0, zIndex: 2, opacity: 0.4,
        patternType: 'lines',
        patternColor: '#CCCCCC',
        patternSize: 1,
        patternSpacing: 30
      }
    ]
  },
  {
    id: 'library',
    name: '図書館',
    category: 'school',
    elements: [
      // 壁
      {
        type: 'solid',
        x: 0, y: 0, width: 1, height: 0.7,
        rotation: 0, zIndex: 0, opacity: 1,
        solidColor: '#FDF5E6'
      },
      // 床
      {
        type: 'solid',
        x: 0, y: 0.7, width: 1, height: 0.3,
        rotation: 0, zIndex: 1, opacity: 1,
        solidColor: '#8B4513'
      },
      // 本棚（縦線で表現）
      {
        type: 'pattern',
        x: 0.05, y: 0.1, width: 0.9, height: 0.6,
        rotation: 0, zIndex: 2, opacity: 0.5,
        patternType: 'lines',
        patternColor: '#654321',
        patternSize: 3,
        patternSpacing: 20
      },
      // 本（横線で表現）
      {
        type: 'pattern',
        x: 0.05, y: 0.1, width: 0.9, height: 0.6,
        rotation: 90, zIndex: 3, opacity: 0.3,
        patternType: 'lines',
        patternColor: '#CD853F',
        patternSize: 1,
        patternSpacing: 8
      }
    ]
  },

  // ==========================================
  // 街系背景（具体的な要素追加）
  // ==========================================
  {
    id: 'street',
    name: '街並み',
    category: 'city',
    elements: [
      // 空
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 0.4,
        rotation: 0, zIndex: 0, opacity: 1,
        gradientType: 'linear',
        gradientColors: ['#87CEEB', '#B0C4DE'],
        gradientDirection: 180
      },
      // ビル群のシルエット
      {
        type: 'solid',
        x: 0, y: 0.25, width: 1, height: 0.5,
        rotation: 0, zIndex: 1, opacity: 0.8,
        solidColor: '#696969'
      },
      // 道路
      {
        type: 'solid',
        x: 0, y: 0.7, width: 1, height: 0.3,
        rotation: 0, zIndex: 2, opacity: 1,
        solidColor: '#2F2F2F'
      },
      // 窓（グリッドパターン）
      {
        type: 'pattern',
        x: 0, y: 0.25, width: 1, height: 0.45,
        rotation: 0, zIndex: 3, opacity: 0.6,
        patternType: 'grid',
        patternColor: '#FFFF99',
        patternSize: 2,
        patternSpacing: 15
      }
    ]
  },
  {
    id: 'park',
    name: '公園',
    category: 'city',
    elements: [
      // 空
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 0.4,
        rotation: 0, zIndex: 0, opacity: 1,
        gradientType: 'linear',
        gradientColors: ['#87CEEB', '#98FB98'],
        gradientDirection: 180
      },
      // 芝生
      {
        type: 'solid',
        x: 0, y: 0.4, width: 1, height: 0.6,
        rotation: 0, zIndex: 1, opacity: 1,
        solidColor: '#90EE90'
      },
      // 木のシルエット（ドットパターン）
      {
        type: 'pattern',
        x: 0.1, y: 0.2, width: 0.8, height: 0.4,
        rotation: 0, zIndex: 2, opacity: 0.7,
        patternType: 'dots',
        patternColor: '#228B22',
        patternSize: 15,
        patternSpacing: 50
      },
      // 草のテクスチャ
      {
        type: 'pattern',
        x: 0, y: 0.7, width: 1, height: 0.3,
        rotation: 0, zIndex: 3, opacity: 0.3,
        patternType: 'lines',
        patternColor: '#32CD32',
        patternSize: 1,
        patternSpacing: 8
      }
    ]
  },

  // ==========================================
  // 抽象系背景（シンプル維持）
  // ==========================================
  {
    id: 'white',
    name: '白背景',
    category: 'abstract',
    elements: [{
      type: 'solid',
      x: 0, y: 0, width: 1, height: 1,
      rotation: 0, zIndex: 0, opacity: 1,
      solidColor: '#FFFFFF'
    }]
  },
  {
    id: 'black',
    name: '黒背景',
    category: 'abstract',
    elements: [{
      type: 'solid',
      x: 0, y: 0, width: 1, height: 1,
      rotation: 0, zIndex: 0, opacity: 1,
      solidColor: '#000000'
    }]
  },

  // ==========================================
  // 感情系背景（効果的な表現）
  // ==========================================
  {
    id: 'happy',
    name: '明るい',
    category: 'emotion',
    elements: [
      // 放射状グラデーション
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 1,
        gradientType: 'radial',
        gradientColors: ['#FFD700', '#FFF8DC'],
        gradientDirection: 0
      },
      // 輝きパターン
      {
        type: 'pattern',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 45, zIndex: 1, opacity: 0.3,
        patternType: 'lines',
        patternColor: '#FFFFFF',
        patternSize: 2,
        patternSpacing: 30
      },
      {
        type: 'pattern',
        x: 0, y: 0, width: 1, height: 1,
        rotation: -45, zIndex: 2, opacity: 0.2,
        patternType: 'lines',
        patternColor: '#FFFFFF',
        patternSize: 1,
        patternSpacing: 40
      }
    ]
  },
  {
    id: 'sad',
    name: '暗い',
    category: 'emotion',
    elements: [
      // 暗いグラデーション
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 1,
        gradientType: 'linear',
        gradientColors: ['#2F4F4F', '#708090'],
        gradientDirection: 180
      },
      // 雨のような線パターン
      {
        type: 'pattern',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 15, zIndex: 1, opacity: 0.4,
        patternType: 'lines',
        patternColor: '#4682B4',
        patternSize: 1,
        patternSpacing: 25
      }
    ]
  },
  
  // ==========================================
  // 🏠 場所・環境系背景（漫画ネーム用）
  // ==========================================
  {
    id: 'home',
    name: '家',
    category: 'indoor',
    elements: [
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.4,
        gradientType: 'linear',
        gradientColors: ['#FFF8DC', '#F5F5DC'],
        gradientDirection: 135
      }
    ]
  },
  {
    id: 'school',
    name: '学校',
    category: 'school',
    elements: [
      {
        type: 'solid',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.3,
        solidColor: '#F0F8FF'
      }
    ]
  },
  {
    id: 'office',
    name: 'オフィス',
    category: 'indoor',
    elements: [
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.4,
        gradientType: 'linear',
        gradientColors: ['#F8F8FF', '#E6E6FA'],
        gradientDirection: 90
      }
    ]
  },
  {
    id: 'hospital',
    name: '病院',
    category: 'indoor',
    elements: [
      {
        type: 'solid',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.5,
        solidColor: '#F0FFFF'
      }
    ]
  },
  {
    id: 'park',
    name: '公園',
    category: 'nature',
    elements: [
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.3,
        gradientType: 'radial',
        gradientColors: ['#90EE90', '#98FB98']
      }
    ]
  },
  {
    id: 'city',
    name: '街',
    category: 'city',
    elements: [
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.4,
        gradientType: 'linear',
        gradientColors: ['#D3D3D3', '#A9A9A9'],
        gradientDirection: 45
      }
    ]
  },
  {
    id: 'beach',
    name: '海',
    category: 'nature',
    elements: [
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.3,
        gradientType: 'linear',
        gradientColors: ['#87CEEB', '#B0E0E6'],
        gradientDirection: 180
      }
    ]
  },
  {
    id: 'mountain',
    name: '山',
    category: 'nature',
    elements: [
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.4,
        gradientType: 'linear',
        gradientColors: ['#D2B48C', '#DEB887'],
        gradientDirection: 90
      }
    ]
  },
  
  // ==========================================
  // ⏰ 時間帯・天候系背景（漫画ネーム用）
  // ==========================================
  {
    id: 'morning',
    name: '朝',
    category: 'emotion',
    elements: [
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.4,
        gradientType: 'linear',
        gradientColors: ['#FFE4B5', '#FFF8DC'],
        gradientDirection: 45
      }
    ]
  },
  {
    id: 'afternoon',
    name: '午後',
    category: 'emotion',
    elements: [
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.3,
        gradientType: 'radial',
        gradientColors: ['#FFD700', '#FFA500']
      }
    ]
  },
  {
    id: 'evening',
    name: '夕方',
    category: 'emotion',
    elements: [
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.4,
        gradientType: 'linear',
        gradientColors: ['#FF6347', '#FF4500'],
        gradientDirection: 180
      }
    ]
  },
  {
    id: 'night',
    name: '夜',
    category: 'emotion',
    elements: [
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.6,
        gradientType: 'linear',
        gradientColors: ['#191970', '#000080'],
        gradientDirection: 90
      }
    ]
  },
  {
    id: 'rainy',
    name: '雨',
    category: 'emotion',
    elements: [
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.5,
        gradientType: 'linear',
        gradientColors: ['#B0C4DE', '#87CEEB'],
        gradientDirection: 135
      }
    ]
  },
  {
    id: 'cloudy',
    name: '曇り',
    category: 'emotion',
    elements: [
      {
        type: 'solid',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.4,
        solidColor: '#D3D3D3'
      }
    ]
  },
  {
    id: 'snowy',
    name: '雪',
    category: 'emotion',
    elements: [
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.5,
        gradientType: 'linear',
        gradientColors: ['#F0F8FF', '#E6E6FA'],
        gradientDirection: 45
      }
    ]
  },
  
  // ==========================================
  // 💫 感情・ムード系背景（漫画ネーム用）
  // ==========================================
  {
    id: 'tension',
    name: '緊張感',
    category: 'emotion',
    elements: [
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.4,
        gradientType: 'linear',
        gradientColors: ['#FFB6C1', '#FF69B4'],
        gradientDirection: 45
      }
    ]
  },
  {
    id: 'anxiety',
    name: '不安',
    category: 'emotion',
    elements: [
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.5,
        gradientType: 'radial',
        gradientColors: ['#DDA0DD', '#DA70D6']
      }
    ]
  },
  {
    id: 'excitement',
    name: '興奮',
    category: 'emotion',
    elements: [
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.4,
        gradientType: 'linear',
        gradientColors: ['#FFD700', '#FFA500'],
        gradientDirection: 90
      }
    ]
  },
  {
    id: 'romantic',
    name: 'ロマンチック',
    category: 'emotion',
    elements: [
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.3,
        gradientType: 'radial',
        gradientColors: ['#FFB6C1', '#FFC0CB']
      }
    ]
  },
  {
    id: 'nostalgic',
    name: 'ノスタルジック',
    category: 'emotion',
    elements: [
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.4,
        gradientType: 'linear',
        gradientColors: ['#F5DEB3', '#DEB887'],
        gradientDirection: 135
      }
    ]
  },
  
  // ==========================================
  // ✨ 特殊効果系背景（漫画ネーム用）
  // ==========================================
  {
    id: 'flash',
    name: 'フラッシュ',
    category: 'abstract',
    elements: [
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.7,
        gradientType: 'radial',
        gradientColors: ['#FFFFFF', '#FFFF00']
      }
    ]
  },
  {
    id: 'explosion',
    name: '爆発',
    category: 'abstract',
    elements: [
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.6,
        gradientType: 'radial',
        gradientColors: ['#FF4500', '#FF6347']
      }
    ]
  },
  {
    id: 'magic',
    name: '魔法',
    category: 'abstract',
    elements: [
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.5,
        gradientType: 'linear',
        gradientColors: ['#9370DB', '#8A2BE2'],
        gradientDirection: 45
      }
    ]
  },
  {
    id: 'memory',
    name: '回想',
    category: 'emotion',
    elements: [
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.6,
        gradientType: 'linear',
        gradientColors: ['#D3D3D3', '#A9A9A9'],
        gradientDirection: 90
      }
    ]
  },
  {
    id: 'dream',
    name: '夢',
    category: 'emotion',
    elements: [
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.5,
        gradientType: 'radial',
        gradientColors: ['#E6E6FA', '#DDA0DD']
      }
    ]
  },
  
  // ==========================================
  // 🚗 交通機関系背景（漫画ネーム用）
  // ==========================================
  {
    id: 'train',
    name: '電車',
    category: 'city',
    elements: [
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.4,
        gradientType: 'linear',
        gradientColors: ['#F5F5F5', '#DCDCDC'],
        gradientDirection: 0
      }
    ]
  },
  {
    id: 'car',
    name: '車',
    category: 'city',
    elements: [
      {
        type: 'gradient',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.3,
        gradientType: 'linear',
        gradientColors: ['#E0E0E0', '#C0C0C0'],
        gradientDirection: 90
      }
    ]
  },
  {
    id: 'bus',
    name: 'バス',
    category: 'city',
    elements: [
      {
        type: 'solid',
        x: 0, y: 0, width: 1, height: 1,
        rotation: 0, zIndex: 0, opacity: 0.4,
        solidColor: '#F8F8FF'
      }
    ]
  }
];

// 既存の関数は維持
export const getBackgroundsByCategory = (category: string): BackgroundTemplate[] => {
  return backgroundTemplates.filter(template => template.category === category);
};

export const getTemplatePreviewColor = (template: BackgroundTemplate): string => {
  const firstElement = template.elements[0];
  if (!firstElement) return '#CCCCCC';
  
  if (firstElement.type === 'solid') {
    return firstElement.solidColor || '#CCCCCC';
  } else if (firstElement.type === 'gradient') {
    return firstElement.gradientColors?.[0] || '#CCCCCC';
  } else if (firstElement.type === 'pattern') {
    return firstElement.patternColor || '#CCCCCC';
  }
  return '#CCCCCC';
};

export const getBackgroundTypeIcon = (type: string): string => {
  switch (type) {
    case 'solid': return '🎨';
    case 'gradient': return '🌈';
    case 'pattern': return '🔳';
    case 'image': return '🖼️';
    default: return '❓';
  }
};

export const getBackgroundTypeName = (type: string): string => {
  switch (type) {
    case 'solid': return '単色';
    case 'gradient': return 'グラデーション';
    case 'pattern': return 'パターン';
    case 'image': return '画像';
    default: return '不明';
  }
};