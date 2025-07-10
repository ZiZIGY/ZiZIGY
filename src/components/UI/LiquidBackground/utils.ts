/**
 * Преобразование шестнадцатеричного цвета в RGB значения от 0 до 1
 */
export const hexToRgb = (hex: string) => {
  // Удаляем # если есть
  hex = hex.replace(/^#/, '');

  // Преобразуем короткий формат в полный
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  // Парсим значения RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  return { r, g, b };
};
