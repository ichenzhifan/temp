import { REDO, UNDO } from '../../contants/actionTypes';

export function redo() {
  return {
    type: REDO
  };
}

export function undo() {
  return {
    type: UNDO
  };
}
