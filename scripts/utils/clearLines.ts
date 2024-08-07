export function clearLines(nl: number) {
  for (let i = 0; i < nl; i++) {
    process.stdout.moveCursor(0, -1);
    process.stdout.clearLine(1);
  }
}
