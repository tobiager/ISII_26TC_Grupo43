export function formatArgentinePhone(phone: string | null | undefined): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');

  let areaCodeLength = 4;
  let localNumberStr = digits;
  let prefix = '';

  if (digits.length === 10) {
    localNumberStr = digits;
  } else if (digits.length === 12 && digits.startsWith('54')) {
    prefix = '+54 ';
    localNumberStr = digits.slice(2);
  } else if (digits.length === 13 && digits.startsWith('549')) {
    prefix = '+54 9 ';
    localNumberStr = digits.slice(3);
  } else {
    // No coincide con longitudes estándar, se retorna el original
    return phone;
  }

  // Identificar longitud del código de área
  if (localNumberStr.startsWith('11')) {
    areaCodeLength = 2;
  } else {
    const threeDigitCodes = [
      '221', '223', '249', '261', '264', '280', '291', '299', 
      '341', '342', '343', '351', '362', '376', '379', '381', 
      '387', '388', '336'
    ];
    if (threeDigitCodes.includes(localNumberStr.substring(0, 3))) {
      areaCodeLength = 3;
    }
  }

  const areaCode = localNumberStr.substring(0, areaCodeLength);
  const localNum = localNumberStr.substring(areaCodeLength);

  let formattedLocal = localNum;
  if (localNum.length === 8) {
    formattedLocal = `${localNum.substring(0, 4)}-${localNum.substring(4)}`;
  } else if (localNum.length === 7) {
    formattedLocal = `${localNum.substring(0, 3)}-${localNum.substring(3)}`;
  } else if (localNum.length === 6) {
    formattedLocal = `${localNum.substring(0, 2)}-${localNum.substring(2)}`;
  }

  return `${prefix}${areaCode} ${formattedLocal}`;
}
