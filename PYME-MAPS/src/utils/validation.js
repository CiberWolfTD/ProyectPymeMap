export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validateRUT = (rut) => {
  rut = rut.replace(/\./g, '').replace(/-/g, '');
  if (rut.length < 2) return false;
  
  const body = rut.slice(0, -1);
  const dv = rut.slice(-1).toUpperCase();
  
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const expectedDV = 11 - (sum % 11);
  const calculatedDV = expectedDV === 11 ? '0' : expectedDV === 10 ? 'K' : expectedDV.toString();
  
  return dv === calculatedDV;
};

export const validatePhone = (phone) => {
  const regex = /^(\+?56)?9\d{8}$/;
  const cleanPhone = phone.replace(/\s/g, '');
  return regex.test(cleanPhone);
};

export const validateName = (name) => {
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  return name.length >= 2 && regex.test(name);
};

export const formatRUT = (rut) => {
  rut = rut.replace(/[^0-9kK]/g, '');
  if (rut.length <= 1) return rut;
  
  const body = rut.slice(0, -1);
  const dv = rut.slice(-1);
  
  let formattedBody = '';
  let count = 0;
  
  for (let i = body.length - 1; i >= 0; i--) {
    if (count === 3) {
      formattedBody = '.' + formattedBody;
      count = 0;
    }
    formattedBody = body[i] + formattedBody;
    count++;
  }
  
  return `${formattedBody}-${dv}`;
};