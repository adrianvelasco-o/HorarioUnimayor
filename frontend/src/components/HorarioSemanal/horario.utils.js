const ORDEN_DIAS = {
  "LUNES": 1,
  "MARTES": 2,
  "MIERCOLES": 3,
  "JUEVES": 4,
  "VIERNES": 5,
  "SABADO": 6,
  "DOMINGO": 7
};

export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

export const getDuracion = (horaInicio, horaFin) => {
  if (!horaInicio || !horaFin) return "";
  const minInicio = parseTimeToMinutes(horaInicio);
  const minFin = parseTimeToMinutes(horaFin);
  const diff = minFin - minInicio;
  
  if (diff <= 0) return "0 min";
  
  const hrs = Math.floor(diff / 60);
  const mins = diff % 60;
  
  if (hrs > 0 && mins > 0) {
    return `${hrs} ${hrs === 1 ? "hora" : "horas"} y ${mins} min`;
  } else if (hrs > 0) {
    return `${hrs} ${hrs === 1 ? "hora" : "horas"}`;
  } else {
    return `${mins} min`;
  }
};

export const ordenarHorarios = (horarios = []) => {
  return [...horarios].sort((a, b) => {
    const diaA = ORDEN_DIAS[a.dia_semana] || 99;
    const diaB = ORDEN_DIAS[b.dia_semana] || 99;
    
    if (diaA !== diaB) {
      return diaA - diaB;
    }
    
    return parseTimeToMinutes(a.hora_inicio) - parseTimeToMinutes(b.hora_inicio);
  });
};

export const getFranjasHorarias = (horarios = []) => {
  if (horarios.length === 0) {
    return ["07:00", "09:00", "11:00", "13:00", "15:00", "17:00", "19:00", "21:00"];
  }
  
  // Extraer todas las horas de inicio únicas
  const horasUnicas = Array.from(new Set(horarios.map(h => h.hora_inicio)));
  
  // Ordenar de menor a mayor
  return horasUnicas.sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));
};
