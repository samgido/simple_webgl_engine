// UI 
export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement | null): boolean {
  if (canvas == null) {
    return false;
  }

  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;

  if (needResize) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  return needResize;
}