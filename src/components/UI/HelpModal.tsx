import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, isDarkMode = false }) => {
  if (!isOpen) return null;

  const bgColor = isDarkMode ? '#1a1a1a' : 'white';
  const textColor = isDarkMode ? '#e0e0e0' : '#333';
  const headerBg = isDarkMode ? '#2d2d2d' : '#f8f9fa';
  const sectionBorder = isDarkMode ? '#444' : '#e0e0e0';
  const infoBg = isDarkMode ? '#2a4a5a' : '#e8f4f8';
  const tipBg = isDarkMode ? '#4a3a2a' : '#fff3cd';
  const cardBg = isDarkMode ? '#2d2d2d' : '#ecf0f1';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: bgColor,
          borderRadius: '12px',
          width: '90%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `2px solid ${sectionBorder}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: headerBg,
          }}
        >
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: textColor }}>
            📖 使い方ガイド
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              padding: '0 8px',
              color: isDarkMode ? '#aaa' : '#666',
            }}
          >
            ×
          </button>
        </div>

        {/* コンテンツ */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            
            {/* AI漫画制作の全体フロー */}
            <section style={{ marginBottom: '32px', padding: '20px', backgroundColor: isDarkMode ? '#1e3a4a' : '#e8f4f8', borderRadius: '12px', border: `2px solid ${isDarkMode ? '#4fc3f7' : '#3498db'}` }}>
              <h3 style={{ fontSize: '22px', marginBottom: '16px', color: isDarkMode ? '#4fc3f7' : '#2c3e50', textAlign: 'center' }}>
                🎨 AI漫画制作の全体フロー
              </h3>
              <div style={{ fontSize: '16px', lineHeight: '2', color: textColor, textAlign: 'center' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>① このツールでネーム作成</strong> 📝<br/>
                  <span style={{ fontSize: '14px', color: isDarkMode ? '#aaa' : '#666' }}>コマ割り・セリフ・動作プロンプト生成</span>
                </div>
                <div style={{ fontSize: '24px', margin: '8px 0' }}>↓</div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>② エクスポート（画像 + プロンプト）</strong> 📥<br/>
                  <span style={{ fontSize: '14px', color: isDarkMode ? '#aaa' : '#666' }}>prompts.txt に各コマの画像生成用プロンプトが出力</span>
                </div>
                <div style={{ fontSize: '24px', margin: '8px 0' }}>↓</div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>③ AI画像生成ツールで各コマを生成</strong> 🤖<br/>
                  <span style={{ fontSize: '14px', color: isDarkMode ? '#aaa' : '#666' }}>Stable Diffusion / Midjourney / DALL-E 3 など</span>
                </div>
                <div style={{ fontSize: '24px', margin: '8px 0' }}>↓</div>
                <div>
                  <strong>④ 画像合成して完成！</strong> ✨<br/>
                  <span style={{ fontSize: '14px', color: isDarkMode ? '#aaa' : '#666' }}>生成画像にセリフを重ねて漫画化</span>
                </div>
              </div>
            </section>

            {/* ネーム制作の流れ */}
            <section style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '22px', marginBottom: '20px', color: isDarkMode ? '#4fc3f7' : '#2c3e50', borderBottom: `3px solid ${isDarkMode ? '#4fc3f7' : '#3498db'}`, paddingBottom: '8px' }}>
                🚀 このツールでの作業フロー
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { step: '1', icon: '👤', title: 'キャラクター登録', desc: '左パネルの「👤 キャラクター」→「キャラクター名設定」で主要キャラを登録' },
                  { step: '2', icon: '📋', title: 'テンプレート選択', desc: '「📄 新規作成」でコマ数を選択（1コマ、2コマ横並び、4コマなど）' },
                  { step: '3', icon: '📝', title: 'ページメモ入力', desc: '右サイドバー「📄 AIでページ作成」でストーリーを入力' },
                  { step: '4', icon: '🤖', title: 'AIで生成', desc: '「🤖 1ページ分を生成」ボタンでモーダルを開き、プレビュー→適用' },
                  { step: '5', icon: '🎨', title: '微調整', desc: '吹き出しサイズ、コマ重要度、背景などを調整' },
                  { step: '6', icon: '💾', title: '保存・エクスポート', desc: 'プロジェクト保存 & PNG/JPEGで画像出力' }
                ].map((item, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '16px',
                    padding: '16px',
                    backgroundColor: cardBg,
                    borderRadius: '8px',
                    border: `2px solid ${idx === 0 ? (isDarkMode ? '#4fc3f7' : '#3498db') : 'transparent'}`
                  }}>
                    <div style={{ 
                      minWidth: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: isDarkMode ? '#3a3a3a' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      border: `2px solid ${sectionBorder}`
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: textColor, marginBottom: '8px' }}>
                        Step {item.step}: {item.title}
                      </div>
                      <div style={{ fontSize: '14px', color: isDarkMode ? '#aaa' : '#666', lineHeight: '1.6' }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* AI生成機能 */}
            <section style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '16px', color: isDarkMode ? '#ff6b9d' : '#e74c3c', borderBottom: `2px solid ${isDarkMode ? '#ff6b9d' : '#e74c3c'}`, paddingBottom: '8px' }}>
                🤖 AI生成機能の使い方
              </h3>
              
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '16px', marginBottom: '12px', color: isDarkMode ? '#ff6b9d' : '#e74c3c' }}>📄 1ページ分を生成</h4>
                <ol style={{ lineHeight: '1.8', color: textColor, marginLeft: '20px' }}>
                  <li>右サイドバーの「📄 AIでページ作成」を開く</li>
                  <li>「ページメモ（構成・展開・意図）」にストーリーを入力
                    <div style={{ backgroundColor: infoBg, padding: '12px', borderRadius: '6px', marginTop: '8px', fontSize: '14px' }}>
                      例: 「主人公が朝起きて驚く。窓の外に巨大なロボット。主人公は急いで着替えて外に飛び出す。」
                    </div>
                  </li>
                  <li>「🤖 1ページ分を生成」ボタンをクリック</li>
                  <li>「🎨 プレビュー生成」→ 内容確認 → 「✅ 適用」</li>
                </ol>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '16px', marginBottom: '12px', color: isDarkMode ? '#ff6b9d' : '#e74c3c' }}>🎯 1コマのみ生成</h4>
                <ol style={{ lineHeight: '1.8', color: textColor, marginLeft: '20px' }}>
                  <li>コマを選択</li>
                  <li>右サイドバーの「📝 コマ設定」を開く</li>
                  <li>「🤖 AIでコマ内容を生成」ボタンをクリック</li>
                  <li>そのコマの内容を入力 → 「🎨 プレビュー生成」→ 「✅ 適用」</li>
                </ol>
              </div>

              <div style={{ backgroundColor: tipBg, padding: '12px', borderRadius: '8px', borderLeft: `4px solid ${isDarkMode ? '#ffa726' : '#f39c12'}` }}>
                <strong>💡 Tip:</strong> 詳細なストーリーほど質の高い内容が生成されます。キャラクター名を統一して記述してください。
              </div>
            </section>

            {/* 基本操作 */}
            <section style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '16px', color: isDarkMode ? '#81c784' : '#27ae60', borderBottom: `2px solid ${isDarkMode ? '#81c784' : '#27ae60'}`, paddingBottom: '8px' }}>
                🎨 基本操作
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { title: '新規作成', desc: '📄ボタンでテンプレート選択' },
                  { title: '保存', desc: '💾 新規保存 or 上書き保存' },
                  { title: '元に戻す', desc: 'Ctrl + Z（やり直し: Ctrl + Y）' },
                  { title: '吹き出し', desc: 'ダブルクリックでテキスト入力' }
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '12px', backgroundColor: cardBg, borderRadius: '6px' }}>
                    <strong style={{ color: textColor }}>{item.title}:</strong>
                    <div style={{ fontSize: '14px', color: isDarkMode ? '#aaa' : '#666', marginTop: '4px' }}>{item.desc}</div>
                  </div>
                ))}
              </div>
              
              {/* コマ編集詳細 */}
              <div style={{ marginTop: '16px', backgroundColor: infoBg, padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '16px', marginBottom: '12px', color: textColor }}>🔧 コマ編集操作</h4>
                <div style={{ fontSize: '14px', lineHeight: '1.8', color: textColor }}>
                  <p style={{ marginBottom: '8px' }}>コマを選択 → 右サイドバーの「<strong>✏️ コマ編集</strong>」をクリック</p>
                  <ul style={{ marginLeft: '20px' }}>
                    <li><strong>🔵 移動:</strong> 中央ハンドルをドラッグ</li>
                    <li><strong>🟧 リサイズ:</strong> 四隅のハンドルをドラッグ</li>
                    <li><strong>✂️ 分割:</strong> 分割アイコンをクリック</li>
                    <li><strong>🗑️ 削除:</strong> 削除アイコンをクリック</li>
                    <li><strong>🧹 全クリア:</strong> 右サイドバーの「🧹 全クリア」ボタン</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* エクスポート */}
            <section style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '16px', color: isDarkMode ? '#ba68c8' : '#8e44ad', borderBottom: `2px solid ${isDarkMode ? '#ba68c8' : '#8e44ad'}`, paddingBottom: '8px' }}>
                📥 エクスポート（画像 + プロンプト）
              </h3>
              <div style={{ backgroundColor: infoBg, padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '16px', marginBottom: '12px', color: textColor }}>出力される3つのファイル</h4>
                <ol style={{ lineHeight: '1.8', color: textColor, marginLeft: '20px', fontSize: '14px' }}>
                  <li><strong>layout.png/jpg</strong>: ネーム画像（コマ割り・吹き出し配置）</li>
                  <li><strong>prompts.txt</strong>: 各コマの画像生成用プロンプト（英語）</li>
                  <li><strong>project.json</strong>: プロジェクトデータ（バックアップ用）</li>
                </ol>
              </div>

              <div style={{ backgroundColor: isDarkMode ? '#2a4a2a' : '#e8f5e9', padding: '16px', borderRadius: '8px', border: `2px solid ${isDarkMode ? '#66bb6a' : '#4caf50'}` }}>
                <h4 style={{ fontSize: '16px', marginBottom: '12px', color: isDarkMode ? '#66bb6a' : '#2e7d32' }}>🎨 prompts.txt の活用方法</h4>
                <div style={{ fontSize: '14px', lineHeight: '1.8', color: textColor }}>
                  <p style={{ marginBottom: '12px' }}>各コマの<strong>Action Prompt</strong>を以下のAI画像生成ツールにコピペ：</p>
                  <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>
                    <li><strong>Stable Diffusion WebUI</strong>: そのままコピーして使用</li>
                    <li><strong>Midjourney</strong>: /imagine の後に貼り付け</li>
                    <li><strong>DALL-E 3</strong>: ChatGPT Plus で送信</li>
                  </ul>
                  <div style={{ backgroundColor: tipBg, padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
                    <strong>💡 Tip:</strong> プロンプトは英語で出力されるため、そのままコピペで高品質な画像が生成できます！
                  </div>
                </div>
              </div>
            </section>

            {/* キャラクター登録 */}
            <section style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '16px', color: isDarkMode ? '#ffb74d' : '#f39c12', borderBottom: `2px solid ${isDarkMode ? '#ffb74d' : '#f39c12'}`, paddingBottom: '8px' }}>
                👤 キャラクター登録
              </h3>
              <div style={{ backgroundColor: infoBg, padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '16px', marginBottom: '12px', color: textColor }}>事前登録の流れ</h4>
                <ol style={{ lineHeight: '1.8', color: textColor, marginLeft: '20px', fontSize: '14px' }}>
                  <li>左パネル「👤 キャラクター」を開く</li>
                  <li>「キャラクター名設定」で主要キャラ（主人公、ヒロインなど）の名前を登録</li>
                  <li>AI生成時にこの名前を使うと、キャラクターが識別されます</li>
                </ol>
                <div style={{ marginTop: '12px', padding: '12px', backgroundColor: tipBg, borderRadius: '6px', fontSize: '14px' }}>
                  <strong>💡 Note:</strong> 基本的にはAI生成でコマ内容と吹き出しが自動配置されるため、手動でのキャラクター配置は不要です
                </div>
              </div>
            </section>

            {/* 吹き出し */}
            <section style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '16px', color: isDarkMode ? '#4dd0e1' : '#16a085', borderBottom: `2px solid ${isDarkMode ? '#4dd0e1' : '#16a085'}`, paddingBottom: '8px' }}>
                💬 吹き出し編集
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '14px', marginBottom: '8px', color: isDarkMode ? '#4dd0e1' : '#16a085' }}>基本操作</h4>
                  <ul style={{ fontSize: '14px', lineHeight: '1.6', color: textColor }}>
                    <li>追加: コマをダブルクリック</li>
                    <li>編集: 吹き出しをダブルクリック</li>
                    <li>確定: Ctrl + Enter</li>
                    <li>キャンセル: Esc</li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', marginBottom: '8px', color: isDarkMode ? '#4dd0e1' : '#16a085' }}>種類</h4>
                  <ul style={{ fontSize: '14px', lineHeight: '1.6', color: textColor }}>
                    <li>💬 普通: 通常の吹き出し</li>
                    <li>💭 思考: 雲形の吹き出し</li>
                    <li>❗ 叫び: ギザギザ</li>
                    <li>🤫 小声: 点線</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ショートカット */}
            <section style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '16px', color: isDarkMode ? '#e57373' : '#c0392b', borderBottom: `2px solid ${isDarkMode ? '#e57373' : '#c0392b'}`, paddingBottom: '8px' }}>
                ⌨️ ショートカットキー
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { key: 'Ctrl + Z', desc: '元に戻す' },
                  { key: 'Ctrl + Y', desc: 'やり直し' },
                  { key: 'Delete', desc: '削除' },
                  { key: 'Ctrl + Enter', desc: '編集確定' },
                  { key: 'Esc', desc: 'キャンセル' },
                  { key: 'ダブルクリック', desc: '吹き出し編集' }
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '10px', backgroundColor: cardBg, borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '13px', color: textColor, marginBottom: '4px' }}>{item.key}</div>
                    <div style={{ fontSize: '12px', color: isDarkMode ? '#aaa' : '#666' }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips */}
            <section style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '16px', color: isDarkMode ? '#9575cd' : '#8e44ad', borderBottom: `2px solid ${isDarkMode ? '#9575cd' : '#8e44ad'}`, paddingBottom: '8px' }}>
                💡 よくある質問
              </h3>
              {[
                { q: 'AI生成がうまくいかない', a: 'より詳細なストーリーを入力してください。各コマの内容を明確に区切って記述し、事前に登録したキャラクター名を使用します。' },
                { q: '吹き出しのサイズや位置を変えたい', a: '吹き出しを選択すると四隅にハンドルが表示されます。ドラッグで移動・リサイズできます。' },
                { q: 'プロジェクトが消えた', a: 'ブラウザのローカルストレージに保存されています。同じブラウザで「📁 プロジェクト管理」から確認できます。' },
                { q: 'コマの内容を変更したい', a: '1コマ生成モードで選択したコマのみ再生成できます。または吹き出しをダブルクリックでテキスト編集できます。' }
              ].map((item, idx) => (
                <div key={idx} style={{ marginBottom: '16px' }}>
                  <strong style={{ color: isDarkMode ? '#9575cd' : '#8e44ad', fontSize: '14px' }}>Q: {item.q}</strong>
                  <p style={{ marginTop: '6px', marginBottom: '0', color: textColor, marginLeft: '16px', fontSize: '14px', lineHeight: '1.6' }}>
                    A: {item.a}
                  </p>
                </div>
              ))}
            </section>

          </div>
        </div>

        {/* フッター */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: `2px solid ${sectionBorder}`,
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: headerBg,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
