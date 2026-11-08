/* Casos de prueba automatizados de las reglas de negocio del prototipo Conjunta.
   Ejecutar con:  node --test prototipo/pruebas/   (Node.js 18 o superior) */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../js/logic.js');

const salon = { id: 'z1', nombre: 'Salón comunal', abre: '08:00', cierra: '22:00', maxHoras: 5 };
const reservas = [{ id: 'r1', zonaId: 'z1', fecha: '2026-11-14', horaIni: '14:00', horaFin: '18:00', estado: 'Aprobada' }];

test('CP-ROL-01 · Un residente no puede acceder al registro de residentes ni a la cartera', () => {
  assert.equal(L.puede('propietario', 'residentes'), false);
  assert.equal(L.puede('arrendatario', 'cartera'), false);
  assert.equal(L.puede('seguridad', 'pqr'), false);
});

test('CP-ROL-02 · Cada rol accede a sus módulos propios', () => {
  assert.equal(L.puede('admin', 'residentes'), true);
  assert.equal(L.puede('seguridad', 'porteria'), true);
  assert.equal(L.puede('propietario', 'certificados'), true);
  assert.equal(L.puede('arrendatario', 'certificados'), false, 'el paz y salvo lo solicita el propietario');
  assert.equal(L.puede('superadmin', 'conjuntos'), true);
});

test('CP-RES-01 · Se acepta una reserva válida sin cruces', () => {
  const r = L.validarReserva({ fecha: '2026-11-14', horaIni: '09:00', horaFin: '12:00' }, salon, reservas);
  assert.equal(r.ok, true);
});

test('CP-RES-02 · Se rechaza una reserva que se cruza con otra aprobada', () => {
  const r = L.validarReserva({ fecha: '2026-11-14', horaIni: '17:00', horaFin: '20:00' }, salon, reservas);
  assert.equal(r.ok, false);
  assert.match(r.motivo, /Ya existe una reserva/);
});

test('CP-RES-03 · Se rechaza una reserva fuera de horario o que excede la duración máxima', () => {
  assert.equal(L.validarReserva({ fecha: '2026-11-15', horaIni: '21:00', horaFin: '23:00' }, salon, reservas).ok, false);
  assert.equal(L.validarReserva({ fecha: '2026-11-15', horaIni: '08:00', horaFin: '14:00' }, salon, reservas).ok, false);
});

test('CP-RES-04 · Una reserva cancelada libera el horario', () => {
  const canceladas = [{ ...reservas[0], estado: 'Cancelada' }];
  assert.equal(L.validarReserva({ fecha: '2026-11-14', horaIni: '15:00', horaFin: '17:00' }, salon, canceladas).ok, true);
});

test('CP-CER-01 · El paz y salvo solo se expide con saldo en cero', () => {
  const cargos = [
    { inmuebleId: 'i1', valor: 285000, pagado: true },
    { inmuebleId: 'i2', valor: 285000, pagado: false },
    { inmuebleId: 'i2', valor: 285000, pagado: true }
  ];
  assert.equal(L.puedeExpedirPazYSalvo('i1', cargos), true);
  assert.equal(L.puedeExpedirPazYSalvo('i2', cargos), false);
  assert.equal(L.saldoInmueble('i2', cargos), 285000);
});

test('CP-VIS-01 · Portería admite solo códigos autorizados para la fecha del día', () => {
  const visitas = [
    { codigo: 'ABC234', fecha: '2026-11-07', estado: 'Autorizada' },
    { codigo: 'XYZ789', fecha: '2026-11-08', estado: 'Autorizada' },
    { codigo: 'QWE456', fecha: '2026-11-07', estado: 'Salió' }
  ];
  assert.equal(L.verificarIngreso('abc234', visitas, '2026-11-07').ok, true, 'no distingue mayúsculas');
  assert.equal(L.verificarIngreso('XYZ789', visitas, '2026-11-07').ok, false, 'fecha distinta');
  assert.equal(L.verificarIngreso('QWE456', visitas, '2026-11-07').ok, false, 'código ya utilizado');
  assert.equal(L.verificarIngreso('NOEXISTE', visitas, '2026-11-07').ok, false);
});

test('CP-VIS-02 · Los códigos de visita tienen 6 caracteres sin ambigüedades (0/O, 1/I)', () => {
  for (let s = 1; s < 500; s++) {
    const c = L.generarCodigoVisita(s);
    assert.match(c, /^[A-HJ-NP-Z2-9]{6}$/);
  }
});

test('CP-PQR-01 · El plazo de PQR se cuenta en días hábiles, sin fines de semana ni festivos', () => {
  // 30 oct. 2026 (viernes) → 6 nov. 2026 (viernes): 2 nov. es festivo → 4 días hábiles
  assert.equal(L.diasHabilesEntre('2026-10-30T12:00:00', '2026-11-06T12:00:00', L.FESTIVOS_2026), 4);
});

test('CP-PQR-01b · Las fechas AAAA-MM-DD se cuentan como fecha local (sin desfase por zona horaria)', () => {
  // Radicada el martes 3 nov. 2026; al sábado 7 nov. han transcurrido 3 días hábiles (4, 5 y 6 nov.)
  assert.equal(L.diasHabilesEntre('2026-11-03', '2026-11-07', L.FESTIVOS_2026), 3);
  assert.equal(L.diasHabilesEntre('2026-10-20', '2026-11-07', L.FESTIVOS_2026), 12);
});

test('CP-PQR-02 · El semáforo de PQR cambia a amarillo y rojo según el plazo', () => {
  const verde = L.estadoPlazoPQR({ fechaRadicado: '2026-11-03T12:00:00' }, new Date('2026-11-06T12:00:00'));
  const amarillo = L.estadoPlazoPQR({ fechaRadicado: '2026-10-20T12:00:00' }, new Date('2026-11-07T12:00:00'));
  const rojo = L.estadoPlazoPQR({ fechaRadicado: '2026-10-09T12:00:00' }, new Date('2026-11-07T12:00:00'));
  assert.equal(verde.semaforo, 'verde');
  assert.equal(amarillo.semaforo, 'amarillo');
  assert.equal(rojo.semaforo, 'rojo');
});

test('CP-PQR-03 · Los radicados son consecutivos por año', () => {
  const pqrs = [{ radicado: 'PQR-2026-0001' }, { radicado: 'PQR-2026-0002' }];
  assert.equal(L.siguienteRadicado(pqrs, '2026'), 'PQR-2026-0003');
});
