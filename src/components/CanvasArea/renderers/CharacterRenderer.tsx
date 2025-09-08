// src/components/CanvasArea/renderers/CharacterRenderer.tsx
import { Character, Panel } from "../../../types";

export class CharacterRenderer {
  // キャラクター群描画
  static drawCharacters(
    ctx: CanvasRenderingContext2D,
    characters: Character[],
    panels: Panel[],
    selectedCharacter: Character | null
  ) {
    characters.forEach((character) => {
      const panel = panels.find((p) => p.id === character.panelId);
      if (!panel) return;
      CharacterRenderer.drawCharacter(ctx, character, panel, selectedCharacter);
    });
  }

  // 個別キャラクター描画
  static drawCharacter(
    ctx: CanvasRenderingContext2D,
    character: Character,
    panel: Panel,
    selectedCharacter: Character | null
  ) {
    const charX = panel.x + panel.width * character.x - 30;
    const charY = panel.y + panel.height * character.y - 20;
    const charWidth = 60 * character.scale;
    const charHeight = 40 * character.scale;

    // 選択状態の背景
    if (character === selectedCharacter) {
      ctx.fillStyle = "rgba(255, 102, 0, 0.2)";
      ctx.fillRect(charX - 5, charY - 5, charWidth + 10, charHeight + 10);
      // 選択枠
      ctx.strokeStyle = "#ff6600";
      ctx.lineWidth = 2;
      ctx.strokeRect(charX - 5, charY - 5, charWidth + 10, charHeight + 10);
      // リサイズハンドル
      CharacterRenderer.drawResizeHandles(
        ctx,
        charX - 5,
        charY - 5,
        charWidth + 10,
        charHeight + 10
      );
    }

    // キャラクター本体
    ctx.fillStyle = "rgba(0, 102, 255, 0.1)";
    ctx.fillRect(charX, charY, charWidth, charHeight);
    ctx.strokeStyle = "#0066ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(charX, charY, charWidth, charHeight);

    // 頭部
    const headSize = 20 * character.scale;
    const headX = charX + charWidth / 2 - headSize / 2;
    const headY = charY + 5;
    ctx.fillStyle = "#ffcc99";
    ctx.beginPath();
    ctx.arc(
      headX + headSize / 2,
      headY + headSize / 2,
      headSize / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.stroke();

    // 目
    const eyeSize = 3 * character.scale;
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.arc(
      headX + headSize / 3,
      headY + headSize / 3,
      eyeSize / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      headX + (headSize * 2) / 3,
      headY + headSize / 3,
      eyeSize / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // 体
    const bodyWidth = 15 * character.scale;
    const bodyHeight = 15 * character.scale;
    const bodyX = charX + charWidth / 2 - bodyWidth / 2;
    const bodyY = headY + headSize;
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(bodyX, bodyY, bodyWidth, bodyHeight);
    ctx.strokeRect(bodyX, bodyY, bodyWidth, bodyHeight);

    // 名前表示
    ctx.fillStyle = "#333";
    ctx.font = `${8 * character.scale}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(
      character.name,
      charX + charWidth / 2,
      charY + charHeight + 15
    );
  }

  // リサイズハンドル描画
  static drawResizeHandles(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const handleSize = 16; // 8から16に変更
    const positions = [
      [x, y], // 左上
      [x + width - handleSize, y], // 右上
      [x, y + height - handleSize], // 左下
      [x + width - handleSize, y + height - handleSize], // 右下
    ];

    ctx.fillStyle = "#ff6600";
    positions.forEach(([hx, hy]) => {
      ctx.fillRect(hx, hy, handleSize, handleSize);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.strokeRect(hx, hy, handleSize, handleSize);
    });
  }

  // キャラクター検索
  static findCharacterAt(
    mouseX: number,
    mouseY: number,
    characters: Character[],
    panels: Panel[]
  ): Character | null {
    for (let i = characters.length - 1; i >= 0; i--) {
      const character = characters[i];
      const panel = panels.find((p) => p.id === character.panelId);
      if (!panel) continue;

      const charX = panel.x + panel.width * character.x - 30;
      const charY = panel.y + panel.height * character.y - 20;
      const charWidth = 60 * character.scale;
      const charHeight = 40 * character.scale;

      if (
        mouseX >= charX &&
        mouseX <= charX + charWidth &&
        mouseY >= charY &&
        mouseY <= charY + charHeight
      ) {
        return character;
      }
    }
    return null;
  }

  // リサイズハンドルクリック判定
  static isResizeHandleClicked(
    mouseX: number,
    mouseY: number,
    character: Character,
    panel: Panel
  ): boolean {
    const charX = panel.x + panel.width * character.x - 30 - 5;
    const charY = panel.y + panel.height * character.y - 20 - 5;
    const charWidth = 60 * character.scale + 10;
    const charHeight = 40 * character.scale + 10;
    const handleSize = 16; // 8から16に変更
    const tolerance = 10;  // 新規追加

    const positions = [
      [charX, charY],
      [charX + charWidth - handleSize, charY],
      [charX, charY + charHeight - handleSize],
      [charX + charWidth - handleSize, charY + charHeight - handleSize],
    ];

    return positions.some(
      ([hx, hy]) =>
        mouseX >= hx &&
        mouseX <= hx + handleSize &&
        mouseY >= hy &&
        mouseY <= hy + handleSize
    );
  }
}