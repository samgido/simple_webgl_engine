export const TWO_PI = 2.0 * Math.PI;

//UI 
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

export function getCanvasElement(id: string) {
  const canvas = document.querySelector(`#${id}`) as HTMLCanvasElement | null;
  if (canvas) {
    return canvas;
  } else
    throw new Error("Could not find canvas element");
}
