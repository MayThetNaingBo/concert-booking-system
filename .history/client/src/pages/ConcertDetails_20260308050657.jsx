import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSeats } from "../services/seatService";

/*
  LAYOUT:
  - Square stage at top-centre
  - Seats in curved rows (arc of a circle) below the stage
  - Each successive zone sits at a larger radius → curves progressively
  - Centre aisle splits every row into LEFT block and RIGHT block
  - Aisle width = 40px
  - Arc is centred at 270° (top), sweeping from ~200° to ~340° (140° total)
    so rows curve gently around the stage

  Arc geometry:
    Centre point (CX, CY) is above the SVG, so arcs appear as gentle curves.
    CY_ARC = stage bottom + offset so the curvature looks natural.
    Each zone row sits at a different radius from CY_ARC.
*/

const SVG_W       = 1000;
const STAGE_W     = 220;
const STAGE_H     = 70;
const STAGE_X     = SVG_W / 2 - STAGE_W / 2;
const STAGE_Y     = 30;

// Arc focus point — seats curve around this point
const ARC_CX      = SVG_W / 2;
const ARC_CY      = STAGE_Y + STAGE_H - 10;

// Arc sweep — 160° total centred at 90° (pointing down)
const ARC_HALF    = 80;
const ARC_START   = 90 - ARC_HALF;  // 10°
const ARC_END     = 90 + ARC_HALF;  // 170°

const AISLE_W      = 44;  // px gap for centre aisle
const TILE_W       = 26;
const TILE_H       = 20;
const SEAT_PIX_GAP = 4;   // px gap between seat tiles (consistent across all radii)

