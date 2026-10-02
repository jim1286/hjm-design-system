import { motion } from "./foundations.js";
// A fixed 4×4 mask bounds layer count on low-end phones; no image pixels are duplicated.
export const gridRevealTiles=Array.from({length:16},(_,index)=>({id:index,row:Math.floor(index/4),column:index%4,delay:(Math.floor(index/4)+index%4)*30}));
export const gridRevealDuration=motion.normal;
