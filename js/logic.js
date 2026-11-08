/* Conjunta — reglas de negocio puras (sin DOM), reutilizables y comprobables con Node.
   Prototipo funcional — Actividad 8, Modalidad de Grado (Emprendimiento). Datos ficticios. */
(function (root) {
  'use strict';

  // ---------- Roles y permisos (RBAC, Ferraiolo y Kuhn, 1992) ----------
  const ROLES = {
    superadmin:   { nombre: 'Superadministrador', permisos: ['conjuntos', 'dashboard', 'auditoria'] },
    admin:        { nombre: 'Administración', permisos: ['dashboard', 'residentes', 'reservas', 'cartera', 'certificados', 'parqueaderos', 'arriendos', 'visitantes', 'pqr', 'comunicados', 'auditoria'] },
    propietario:  { nombre: 'Propietario', permisos: ['inicio', 'reservar', 'pagos', 'certificados', 'mis-visitas', 'mis-pqr', 'arriendos', 'comunicados'] },
    arrendatario: { nombre: 'Arrendatario', permisos: ['inicio', 'reservar', 'pagos', 'mis-visitas', 'mis-pqr', 'comunicados'] },
    seguridad:    { nombre: 'Seguridad', permisos: ['porteria', 'minuta', 'comunicados'] }
  };

  function puede(rol, modulo) {
    return !!(ROLES[rol] && ROLES[rol].permisos.indexOf(modulo) !== -1);
  }

  // ---------- Utilidades de fecha ----------
  function aMinutos(hhmm) {
    const p = String(hhmm).split(':');
    return parseInt(p[0], 10) * 60 + parseInt(p[1] || '0', 10);
  }

  /** Convierte a fecha local; 'AAAA-MM-DD' se interpreta como fecha local (no UTC). */
  function fechaLocal(v) {
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const p = v.split('-');
      return new Date(+p[0], +p[1] - 1, +p[2]);
    }
    return new Date(v);
  }

  function isoLocal(f) {
    return f.getFullYear() + '-' + String(f.getMonth() + 1).padStart(2, '0') + '-' + String(f.getDate()).padStart(2, '0');
  }

  function esFestivoOFinDeSemana(fecha, festivos) {
    const d = fecha.getDay();
    if (d === 0 || d === 6) return true;
    return (festivos || []).indexOf(isoLocal(fecha)) !== -1;
  }

  /** Días hábiles transcurridos entre dos fechas (excluye sábados, domingos y festivos). */
  function diasHabilesEntre(desde, hasta, festivos) {
    const a = fechaLocal(desde); a.setHours(0, 0, 0, 0);
    const b = fechaLocal(hasta); b.setHours(0, 0, 0, 0);
    if (b <= a) return 0;
    let n = 0;
    const cur = new Date(a);
    while (cur < b) {
      cur.setDate(cur.getDate() + 1);
      if (!esFestivoOFinDeSemana(cur, festivos)) n++;
    }
    return n;
  }

  // Festivos de Colombia 2026 (Ley 51 de 1983) usados para el cálculo de plazos de PQR.
  const FESTIVOS_2026 = ['2026-01-01', '2026-01-12', '2026-03-23', '2026-04-02', '2026-04-03', '2026-05-01',
    '2026-05-18', '2026-06-08', '2026-06-15', '2026-06-29', '2026-07-20', '2026-08-07', '2026-08-17',
    '2026-10-12', '2026-11-02', '2026-11-16', '2026-12-08', '2026-12-25'];

  // ---------- Reservas de zonas comunes ----------
  /** Valida una solicitud de reserva y devuelve {ok, motivo}. */
  function validarReserva(sol, zona, reservas) {
    if (!zona) return { ok: false, motivo: 'La zona común no existe.' };
    if (!sol.fecha || !sol.horaIni || !sol.horaFin) return { ok: false, motivo: 'Complete fecha y horario.' };
    const ini = aMinutos(sol.horaIni), fin = aMinutos(sol.horaFin);
    if (fin <= ini) return { ok: false, motivo: 'La hora final debe ser posterior a la inicial.' };
    if (ini < aMinutos(zona.abre) || fin > aMinutos(zona.cierra)) {
      return { ok: false, motivo: 'Fuera del horario de la zona (' + zona.abre + ' a ' + zona.cierra + ').' };
    }
    if ((fin - ini) / 60 > zona.maxHoras) {
      return { ok: false, motivo: 'Supera el máximo de ' + zona.maxHoras + ' horas por reserva.' };
    }
    const choque = reservas.some(function (r) {
      return r.zonaId === zona.id && r.fecha === sol.fecha && r.estado !== 'Cancelada' &&
        aMinutos(r.horaIni) < fin && ini < aMinutos(r.horaFin);
    });
    if (choque) return { ok: false, motivo: 'Ya existe una reserva en ese horario.' };
    return { ok: true, motivo: '' };
  }

  // ---------- Cartera y certificados ----------
  function saldoInmueble(inmuebleId, cargos) {
    return cargos.filter(function (c) { return c.inmuebleId === inmuebleId && !c.pagado; })
      .reduce(function (s, c) { return s + c.valor; }, 0);
  }

  /** El paz y salvo solo se expide si el inmueble no tiene saldos pendientes. */
  function puedeExpedirPazYSalvo(inmuebleId, cargos) {
    return saldoInmueble(inmuebleId, cargos) === 0;
  }

  // ---------- Visitantes ----------
  function generarCodigoVisita(semilla) {
    const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let x = Math.abs(semilla | 0) || 7, s = '';
    for (let i = 0; i < 6; i++) {
      x = (Math.imul(x, 1103515245) + 12345) & 0x7fffffff;
      s += alfabeto[(x >>> 16) % alfabeto.length]; // bits altos: los bajos de un LCG tienen periodo corto
    }
    return s;
  }

  /** La portería solo puede dar ingreso a visitas autorizadas para la fecha del día. */
  function verificarIngreso(codigo, visitas, hoyIso) {
    const v = visitas.find(function (x) { return x.codigo === String(codigo).trim().toUpperCase(); });
    if (!v) return { ok: false, motivo: 'Código no encontrado: la visita no está autorizada.' };
    if (v.fecha !== hoyIso) return { ok: false, motivo: 'La autorización corresponde a otra fecha (' + v.fecha + ').' };
    if (v.estado !== 'Autorizada') return { ok: false, motivo: 'La visita ya registra estado: ' + v.estado + '.' };
    return { ok: true, visita: v };
  }

  // ---------- PQR ----------
  const PLAZO_PQR_DIAS_HABILES = 15; // Art. 14, Ley 1437 de 2011 (sustituido por la Ley 1755 de 2015)

  function estadoPlazoPQR(pqr, ahora) {
    const fin = pqr.fechaRespuesta ? fechaLocal(pqr.fechaRespuesta) : new Date(ahora);
    const usados = diasHabilesEntre(pqr.fechaRadicado, fin, FESTIVOS_2026);
    let semaforo = 'verde';
    if (usados > PLAZO_PQR_DIAS_HABILES) semaforo = 'rojo';
    else if (usados >= 10) semaforo = 'amarillo';
    return { diasHabiles: usados, restantes: Math.max(0, PLAZO_PQR_DIAS_HABILES - usados), semaforo: semaforo };
  }

  function promedioRespuestaPQR(pqrs) {
    const resp = pqrs.filter(function (p) { return p.fechaRespuesta; });
    if (!resp.length) return 0;
    const total = resp.reduce(function (s, p) {
      return s + diasHabilesEntre(p.fechaRadicado, p.fechaRespuesta, FESTIVOS_2026);
    }, 0);
    return Math.round((total / resp.length) * 10) / 10;
  }

  function siguienteRadicado(pqrs, anio) {
    const n = pqrs.filter(function (p) { return p.radicado.indexOf('PQR-' + anio) === 0; }).length + 1;
    return 'PQR-' + anio + '-' + String(n).padStart(4, '0');
  }

  // ---------- Formato ----------
  function cop(v) {
    return '$' + Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  const api = {
    ROLES: ROLES, puede: puede, aMinutos: aMinutos, diasHabilesEntre: diasHabilesEntre, FESTIVOS_2026: FESTIVOS_2026,
    validarReserva: validarReserva, saldoInmueble: saldoInmueble, puedeExpedirPazYSalvo: puedeExpedirPazYSalvo,
    generarCodigoVisita: generarCodigoVisita, verificarIngreso: verificarIngreso,
    PLAZO_PQR_DIAS_HABILES: PLAZO_PQR_DIAS_HABILES, estadoPlazoPQR: estadoPlazoPQR,
    promedioRespuestaPQR: promedioRespuestaPQR, siguienteRadicado: siguienteRadicado, cop: cop
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Logic = api;
})(this);
