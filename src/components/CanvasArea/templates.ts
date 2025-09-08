// src/components/CanvasArea/templates.ts
import { Templates } from "../../types";

export const templates: Templates = {
  "4koma": {
    panels: [
      { id: 1, x: 50, y: 50, width: 500, height: 170 },
      { id: 2, x: 50, y: 240, width: 500, height: 170 },
      { id: 3, x: 50, y: 430, width: 500, height: 170 },
      { id: 4, x: 50, y: 620, width: 500, height: 170 },
    ],
  },
  dialogue: {
    panels: [
      { id: 1, x: 50, y: 50, width: 500, height: 200 },
      { id: 2, x: 50, y: 270, width: 240, height: 200 },
      { id: 3, x: 310, y: 270, width: 240, height: 200 },
      { id: 4, x: 50, y: 490, width: 500, height: 260 },
    ],
  },
  action: {
    panels: [
      { id: 1, x: 50, y: 50, width: 200, height: 300 },
      { id: 2, x: 270, y: 50, width: 280, height: 180 },
      { id: 3, x: 270, y: 250, width: 280, height: 120 },
      { id: 4, x: 50, y: 370, width: 500, height: 380 },
    ],
  },
  emotional: {
    panels: [
      { id: 1, x: 50, y: 50, width: 320, height: 300 },
      { id: 2, x: 390, y: 50, width: 160, height: 140 },
      { id: 3, x: 390, y: 210, width: 160, height: 140 },
      { id: 4, x: 50, y: 370, width: 500, height: 380 },
    ],
  },
  gag: {
    panels: [
      { id: 1, x: 50, y: 50, width: 500, height: 150 },
      { id: 2, x: 50, y: 220, width: 160, height: 200 },
      { id: 3, x: 230, y: 220, width: 160, height: 200 },
      { id: 4, x: 410, y: 220, width: 140, height: 200 },
      { id: 5, x: 50, y: 440, width: 500, height: 310 },
    ],
  },
  custom: {
    panels: [
      { id: 1, x: 100, y: 100, width: 400, height: 300 },
      { id: 2, x: 100, y: 450, width: 400, height: 300 },
    ],
  },
};