/* Conjunta — prototipo funcional (SPA sin dependencias).
   Persistencia local (localStorage) con datos FICTICIOS de demostración. */
(function () {
  'use strict';
  const L = window.Logic;
  const KEY = 'conjunta-demo-v1';
  const SKEY = 'conjunta-sesion';
  const root = document.getElementById('root');

  // ---------------- Utilidades ----------------
  const MESES = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'];
  const MESES_L = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const HOY = new Date();
  function iso(d) { const x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); }
  function masDias(n) { const d = new Date(HOY); d.setDate(d.getDate() + n); return iso(d); }
  const hoyIso = iso(HOY);
  function fFecha(s) { if (!s) return '—'; const p = s.slice(0, 10).split('-'); return parseInt(p[2], 10) + ' ' + MESES[parseInt(p[1], 10) - 1] + ' ' + p[0]; }
  function fPeriodo(p) { const x = p.split('-'); return MESES_L[parseInt(x[1], 10) - 1] + ' ' + x[0]; }
  function hora() { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function uid(p) { return p + Math.random().toString(36).slice(2, 8); }
  function enmascarar(doc) { return 'CC •••• ' + String(doc).slice(-4); }

  // ---------------- Datos semilla (ficticios) ----------------
  function semilla() {
    const torresAptos = [['1', '101'], ['1', '102'], ['1', '201'], ['1', '202'], ['2', '101'], ['2', '102'], ['2', '201'], ['2', '202'], ['3', '101'], ['3', '102'], ['4', '101'], ['4', '102']];
    const inmuebles = torresAptos.map(function (t, i) {
      return { id: 'i' + (i + 1), torre: t[0], apto: t[1], coef: 1.04, parq: 'P-' + String(101 + i) };
    });
    const nombres = [
      ['María Fernanda López', 'propietario'], ['Camilo Torres', 'arrendatario'], ['Andrés Rojas', 'propietario'], ['Diana Suárez', 'propietario'],
      ['Julián Pardo', 'propietario'], ['Paola Gutiérrez', 'arrendatario'], ['Sandra Moreno', 'propietario'], ['Ricardo Peña', 'arrendatario'],
      ['Luisa Vargas', 'propietario'], ['Felipe Castro', 'propietario'], ['Natalia Ruiz', 'arrendatario'], ['Óscar Medina', 'propietario']
    ];
    const usuarios = [
      { id: 'u-super', nombre: 'Equipo Conjunta', email: 'superadmin@demo.co', rol: 'superadmin', habeas: '2026-09-01' },
      { id: 'u-admin', nombre: 'Laura Méndez', email: 'admin@demo.co', rol: 'admin', cargo: 'Administradora', habeas: '2026-09-01' },
      { id: 'u-seg', nombre: 'Jhon Cárdenas', email: 'porteria@demo.co', rol: 'seguridad', cargo: 'Portería principal', habeas: '2026-09-01' }
    ];
    nombres.forEach(function (n, i) {
      usuarios.push({
        id: 'r' + (i + 1), nombre: n[0], rol: n[1], inmuebleId: 'i' + (i + 1),
        email: n[0].split(' ')[0].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') + '@demo.co',
        doc: String(52384521 + i * 731517), tel: '300 ' + String(1000000 + i * 457311).slice(0, 3) + ' ' + String(2000 + i * 377).slice(0, 4),
        habeas: i === 10 ? '' : '2026-0' + (8 + (i % 2)) + '-' + String(10 + i).padStart(2, '0')
      });
    });
    const zonas = [
      { id: 'z1', nombre: 'Salón comunal', capacidad: 60, abre: '08:00', cierra: '22:00', maxHoras: 5, costo: 80000 },
      { id: 'z2', nombre: 'Zona BBQ', capacidad: 15, abre: '10:00', cierra: '20:00', maxHoras: 4, costo: 30000 },
      { id: 'z3', nombre: 'Cancha múltiple', capacidad: 20, abre: '06:00', cierra: '21:00', maxHoras: 2, costo: 0 },
      { id: 'z4', nombre: 'Salón de juegos infantil', capacidad: 12, abre: '09:00', cierra: '19:00', maxHoras: 2, costo: 0 }
    ];
    const reservas = [
      { id: 'rv1', zonaId: 'z3', inmuebleId: 'i7', fecha: hoyIso, horaIni: '18:00', horaFin: '20:00', estado: 'Aprobada' },
      { id: 'rv2', zonaId: 'z1', inmuebleId: 'i9', fecha: masDias(1), horaIni: '14:00', horaFin: '18:00', estado: 'Aprobada' },
      { id: 'rv3', zonaId: 'z2', inmuebleId: 'i3', fecha: masDias(2), horaIni: '12:00', horaFin: '16:00', estado: 'Aprobada' },
      { id: 'rv4', zonaId: 'z1', inmuebleId: 'i12', fecha: masDias(5), horaIni: '10:00', horaFin: '13:00', estado: 'Pendiente' },
      { id: 'rv5', zonaId: 'z4', inmuebleId: 'i6', fecha: masDias(3), horaIni: '15:00', horaFin: '17:00', estado: 'Pendiente' }
    ];
    const periodos = ['2026-09', '2026-10', '2026-11'];
    const deben = { i8: ['2026-09', '2026-10', '2026-11'], i10: ['2026-10', '2026-11'], i11: ['2026-11'], i6: ['2026-11'], i5: ['2026-11'] };
    const cargos = [];
    inmuebles.forEach(function (im) {
      periodos.forEach(function (p) {
        const debe = (deben[im.id] || []).indexOf(p) !== -1;
        cargos.push({ id: uid('c'), inmuebleId: im.id, periodo: p, concepto: 'Cuota de administración ' + fPeriodo(p), valor: 285000, pagado: !debe, ref: debe ? '' : 'PSE-' + p.replace('-', '') + im.id.toUpperCase(), fechaPago: debe ? '' : p + '-0' + (3 + (parseInt(im.id.slice(1), 10) % 6)) });
      });
    });
    const visitas = [
      { id: 'v1', inmuebleId: 'i3', nombre: 'Carolina Rojas', doc: '1019234567', placa: '', fecha: hoyIso, codigo: L.generarCodigoVisita(31), estado: 'Autorizada', autorizadoPor: 'Andrés Rojas' },
      { id: 'v2', inmuebleId: 'i6', nombre: 'Técnico de mantenimiento — Gas', doc: '80123456', placa: 'KLM 482', fecha: hoyIso, codigo: L.generarCodigoVisita(62), estado: 'Ingresó', ingreso: '09:12', autorizadoPor: 'Paola Gutiérrez' },
      { id: 'v3', inmuebleId: 'i9', nombre: 'Pedro Salazar', doc: '79456123', placa: '', fecha: hoyIso, codigo: L.generarCodigoVisita(93), estado: 'Salió', ingreso: '07:40', salida: '08:30', autorizadoPor: 'Luisa Vargas' },
      { id: 'v4', inmuebleId: 'i1', nombre: 'Familia Ortega (4 personas)', doc: '52987654', placa: 'GHT 129', fecha: hoyIso, codigo: L.generarCodigoVisita(14), estado: 'Autorizada', autorizadoPor: 'María Fernanda López' },
      { id: 'v5', inmuebleId: 'i12', nombre: 'Domicilio — Mercado', doc: '1032456789', placa: '', fecha: masDias(-1), codigo: L.generarCodigoVisita(55), estado: 'Salió', ingreso: '18:05', salida: '18:12', autorizadoPor: 'Óscar Medina' }
    ];
    function h(fecha, evento) { return { fecha: fecha, evento: evento }; }
    const pqrs = [
      { id: 'q1', radicado: 'PQR-2026-0001', inmuebleId: 'i8', tipo: 'Queja', asunto: 'Ruido excesivo en horario nocturno', descripcion: 'Desde hace dos semanas se presenta ruido después de las 11 p. m. en el piso superior.', estado: 'Respondida', fechaRadicado: '2026-10-06', fechaRespuesta: '2026-10-15', respuesta: 'Se envió llamado de atención escrito al inmueble involucrado conforme al manual de convivencia.', historial: [h('2026-10-06', 'Radicada por el residente'), h('2026-10-07', 'Asignada a Administración'), h('2026-10-15', 'Respondida')] },
      { id: 'q2', radicado: 'PQR-2026-0002', inmuebleId: 'i1', tipo: 'Petición', asunto: 'Copia del reglamento de propiedad horizontal', descripcion: 'Solicito copia digital del reglamento vigente.', estado: 'Respondida', fechaRadicado: '2026-10-14', fechaRespuesta: '2026-10-16', respuesta: 'Se adjunta el reglamento en la sección de documentos.', historial: [h('2026-10-14', 'Radicada por el residente'), h('2026-10-16', 'Respondida')] },
      { id: 'q3', radicado: 'PQR-2026-0003', inmuebleId: 'i10', tipo: 'Reclamo', asunto: 'Cobro duplicado de la cuota de octubre', descripcion: 'En el estado de cuenta aparece dos veces la cuota de octubre.', estado: 'En trámite', fechaRadicado: '2026-10-20', fechaRespuesta: '', respuesta: '', historial: [h('2026-10-20', 'Radicada por el residente'), h('2026-10-21', 'Asignada a Contabilidad')] },
      { id: 'q4', radicado: 'PQR-2026-0004', inmuebleId: 'i6', tipo: 'Petición', asunto: 'Revisión de filtración en parqueadero P-106', descripcion: 'Hay una filtración de agua sobre el parqueadero asignado.', estado: 'Radicada', fechaRadicado: '2026-11-03', fechaRespuesta: '', respuesta: '', historial: [h('2026-11-03', 'Radicada por el residente')] },
      { id: 'q5', radicado: 'PQR-2026-0005', inmuebleId: 'i3', tipo: 'Petición', asunto: 'Instalación de bicicletero en la torre 1', descripcion: 'Propongo instalar un bicicletero cerca de la entrada de la torre 1.', estado: 'Respondida', fechaRadicado: '2026-10-28', fechaRespuesta: '2026-11-05', respuesta: 'El consejo aprobó la propuesta; se instalará en diciembre.', historial: [h('2026-10-28', 'Radicada por el residente'), h('2026-10-29', 'Remitida al Consejo de Administración'), h('2026-11-05', 'Respondida')] },
      { id: 'q6', radicado: 'PQR-2026-0006', inmuebleId: 'i11', tipo: 'Queja', asunto: 'Mascotas sin correa en zonas comunes', descripcion: 'Se observan perros sin correa en el parque infantil.', estado: 'En trámite', fechaRadicado: '2026-10-09', fechaRespuesta: '', respuesta: '', historial: [h('2026-10-09', 'Radicada por el residente'), h('2026-10-14', 'Asignada a Administración')] }
    ];
    const comunicados = [
      { id: 'm1', titulo: 'Corte de agua programado — Torre 2', cuerpo: 'El martes de 8:00 a. m. a 12:00 m. se realizará mantenimiento del tanque de la torre 2.', fecha: '2026-11-05', audiencia: 'Torre 2' },
      { id: 'm2', titulo: 'Asamblea extraordinaria de copropietarios', cuerpo: 'Se convoca a asamblea extraordinaria el 22 de noviembre a las 9:00 a. m. en el salón comunal.', fecha: '2026-11-01', audiencia: 'Todos' },
      { id: 'm3', titulo: 'Jornada de vacunación de mascotas', cuerpo: 'Jornada gratuita en la zona verde norte, sábado de 9:00 a. m. a 1:00 p. m.', fecha: '2026-10-28', audiencia: 'Todos' }
    ];
    const arriendos = [
      { id: 'a1', tipo: 'Parqueadero', inmuebleId: 'i9', titulo: 'Parqueadero cubierto P-109', canon: 180000, detalle: 'Sótano 1, cerca del ascensor de la torre 3.', estado: 'Disponible' },
      { id: 'a2', tipo: 'Apartamento', inmuebleId: 'i12', titulo: 'Apartamento T4-102 · 3 habitaciones', canon: 2300000, detalle: '72 m², 2 baños, balcón y parqueadero.', estado: 'Disponible' }
    ];
    const parqueaderos = inmuebles.map(function (im, i) {
      return { codigo: im.parq, tipo: 'Residente', inmuebleId: im.id, placa: ['BXR 512', 'JHK 220', 'FTP 903', 'MNO 447', '', 'QWE 815', 'ZXC 341', 'RTY 662', 'UIO 128', '', 'LKJ 774', 'HGF 309'][i] };
    }).concat([
      { codigo: 'V-01', tipo: 'Visitantes', inmuebleId: 'i6', placa: 'KLM 482' },
      { codigo: 'V-02', tipo: 'Visitantes', inmuebleId: '', placa: '' },
      { codigo: 'V-03', tipo: 'Visitantes', inmuebleId: '', placa: '' },
      { codigo: 'V-04', tipo: 'Visitantes', inmuebleId: '', placa: '' }
    ]);
    const conjuntos = [
      { id: 'cj1', nombre: 'Conjunto Residencial Mirador de la Sabana', localidad: 'Suba', unidades: 96, estado: 'Activo', modulos: { reservas: true, cartera: true, certificados: true, parqueaderos: true, arriendos: true, visitantes: true, pqr: true, comunicados: true } },
      { id: 'cj2', nombre: 'Agrupación Reservas del Parque', localidad: 'Engativá', unidades: 140, estado: 'Piloto', modulos: { reservas: true, cartera: true, certificados: true, parqueaderos: false, arriendos: false, visitantes: true, pqr: true, comunicados: true } },
      { id: 'cj3', nombre: 'Torres de Castilla', localidad: 'Kennedy', unidades: 210, estado: 'En configuración', modulos: { reservas: true, cartera: false, certificados: false, parqueaderos: false, arriendos: false, visitantes: true, pqr: true, comunicados: true } }
    ];
    const minuta = [
      { hora: '06:00', texto: 'Inicio de turno. Recibo de portería sin novedad.', por: 'Jhon Cárdenas' },
      { hora: '07:40', texto: 'Ingreso de visitante Pedro Salazar a T3-101 (código verificado).', por: 'Jhon Cárdenas' },
      { hora: '08:30', texto: 'Salida de visitante Pedro Salazar.', por: 'Jhon Cárdenas' },
      { hora: '09:12', texto: 'Ingreso de técnico de mantenimiento a T2-102, vehículo KLM 482 en V-01.', por: 'Jhon Cárdenas' }
    ];
    const auditoria = [
      { fecha: masDias(-1) + ' 19:42', usuario: 'Camilo Torres', rol: 'Arrendatario', accion: 'Acceso a módulo "cartera"', resultado: 'Denegado' },
      { fecha: masDias(-1) + ' 08:03', usuario: 'Laura Méndez', rol: 'Administración', accion: 'Inicio de sesión', resultado: 'Permitido' }
    ];
    return { version: 1, conjuntoId: 'cj1', inmuebles: inmuebles, usuarios: usuarios, zonas: zonas, reservas: reservas, cargos: cargos, visitas: visitas, pqrs: pqrs, comunicados: comunicados, arriendos: arriendos, parqueaderos: parqueaderos, conjuntos: conjuntos, minuta: minuta, auditoria: auditoria };
  }

  // ---------------- Persistencia ----------------
  function cargar() {
    try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch (e) { /* almacenamiento no disponible */ }
    const d = semilla(); guardar(d); return d;
  }
  function guardar(d) { try { localStorage.setItem(KEY, JSON.stringify(d || db)); } catch (e) { /* sin persistencia */ } }
  let db = cargar();
  let sesion = null;
  try { sesion = JSON.parse(sessionStorage.getItem(SKEY) || 'null'); } catch (e) { sesion = null; }
  function guardarSesion() { try { sessionStorage.setItem(SKEY, JSON.stringify(sesion)); } catch (e) { /* noop */ } }
  let flash = null;
  let ultimoDenegado = '';

  // ---------------- Consultas ----------------
  function usuario() { return sesion ? db.usuarios.find(function (u) { return u.id === sesion.userId; }) : null; }
  function inmueble(id) { return db.inmuebles.find(function (i) { return i.id === id; }); }
  function nomInm(id) { const i = inmueble(id); return i ? 'T' + i.torre + '-' + i.apto : '—'; }
  function residenteDe(id) { return db.usuarios.find(function (u) { return u.inmuebleId === id; }); }
  function zona(id) { return db.zonas.find(function (z) { return z.id === id; }); }
  function conjunto() { return db.conjuntos.find(function (c) { return c.id === db.conjuntoId; }); }
  function audit(u, accion, resultado) {
    db.auditoria.unshift({ fecha: hoyIso + ' ' + hora(), usuario: u ? u.nombre : 'Anónimo', rol: u ? L.ROLES[u.rol].nombre : '—', accion: accion, resultado: resultado });
    guardar();
  }

  // ---------------- Logo ----------------
  function logo(size, oscuro) {
    const c = oscuro ? '#ffffff' : '#12355b';
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 40 40" aria-hidden="true">' +
      '<polyline points="5,18 20,6 35,18" fill="none" stroke="#f4a259" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<rect x="8.5" y="21" width="6.4" height="14" rx="2" fill="#1b998b"/>' +
      '<rect x="16.8" y="16" width="6.4" height="19" rx="2" fill="' + c + '"/>' +
      '<rect x="25.1" y="23" width="6.4" height="12" rx="2" fill="#1b998b"/></svg>';
  }

  // ---------------- Navegación ----------------
  const ETIQUETAS = {
    conjuntos: 'Conjuntos y módulos', dashboard: 'Panel de control', residentes: 'Residentes e inmuebles', reservas: 'Reservas',
    cartera: 'Cartera y pagos', certificados: 'Certificados', parqueaderos: 'Parqueaderos', arriendos: 'Inmuebles en arriendo',
    visitantes: 'Visitantes', pqr: 'PQR', comunicados: 'Comunicados', auditoria: 'Auditoría de accesos', inicio: 'Inicio',
    reservar: 'Reservar zona común', pagos: 'Mis pagos', 'mis-visitas': 'Mis visitas', 'mis-pqr': 'Mis PQR',
    porteria: 'Control de acceso', minuta: 'Minuta digital'
  };
  function rutaInicial(rol) { return L.ROLES[rol].permisos[0]; }
  function leerHash() {
    const h = location.hash.replace(/^#\/?/, '');
    const partes = h.split('?');
    const params = {};
    (partes[1] || '').split('&').forEach(function (kv) { if (kv) { const p = kv.split('='); params[p[0]] = decodeURIComponent(p[1] || ''); } });
    return { ruta: partes[0].split('/').filter(Boolean), params: params };
  }
  function ir(r) { location.hash = '#/' + r; }

  // ---------------- Shell ----------------
  function shell(u, mod, contenido) {
    const nav = L.ROLES[u.rol].permisos.map(function (p) {
      return '<a href="#/' + p + '" class="' + (p === mod ? 'act' : '') + '"><span class="dot"></span>' + ETIQUETAS[p] + '</a>';
    }).join('');
    const cj = conjunto();
    const sub = u.inmuebleId ? 'Inmueble ' + nomInm(u.inmuebleId) : (u.cargo || L.ROLES[u.rol].nombre);
    const fl = flash ? '<div class="msg ' + flash.tipo + '" style="margin:0 0 16px">' + esc(flash.texto) + '</div>' : '';
    flash = null;
    return '<div class="app"><aside class="side"><div class="brand">' + logo(30, true) + 'Conjunta</div><nav class="nav">' + nav + '</nav>' +
      '<div class="foot">Prototipo funcional v0.8 · Datos ficticios de demostración</div></aside>' +
      '<div class="main"><header class="top"><div class="cj">' + esc(cj.nombre) + '<small>Bogotá D. C. · ' + esc(cj.localidad) + '</small></div>' +
      '<div class="who"><span class="badge">' + L.ROLES[u.rol].nombre + '</span><div style="text-align:right"><div style="font-weight:600">' + esc(u.nombre) + '</div><div class="muted" style="font-size:12px">' + esc(sub) + '</div></div>' +
      '<div class="avatar">' + esc(u.nombre.charAt(0)) + '</div><button class="btn sec sm" data-act="salir">Salir</button></div></header>' +
      '<main class="content">' + fl + contenido + '</main></div></div>';
  }

  // ---------------- Login ----------------
  let rolSel = 'admin';
  const DEMO = { superadmin: 'u-super', admin: 'u-admin', propietario: 'r3', arrendatario: 'r6', seguridad: 'u-seg' };
  function vLogin() {
    const opciones = [['admin', 'Administración', 'Gestión del conjunto'], ['propietario', 'Propietario', 'Andrés Rojas · T1-201'], ['arrendatario', 'Arrendatario', 'Paola Gutiérrez · T2-102'], ['seguridad', 'Seguridad', 'Portería principal'], ['superadmin', 'Superadministrador', 'Equipo Conjunta']];
    const u = db.usuarios.find(function (x) { return x.id === DEMO[rolSel]; });
    return '<div class="login-wrap"><section class="login-hero"><div class="brand" style="padding:0">' + logo(42, true) + '<span style="font-size:26px">Conjunta</span></div>' +
      '<div><h1>Tu conjunto, en un solo lugar.</h1><p>Plataforma web para la gestión integral de conjuntos residenciales en Bogotá D. C.</p>' +
      '<ul><li>Residentes, inmuebles y perfiles por rol</li><li>Reservas, pagos, certificados, parqueaderos y arriendos</li><li>Control de acceso de visitantes en tiempo real</li><li>Comunicados y PQR con trazabilidad de tiempos</li></ul></div>' +
      '<div style="font-size:12px;color:#8fa5bf">Proyecto de emprendimiento · Universidad de La Salle · 2026</div></section>' +
      '<section class="login-form"><form class="login-card" data-form="login"><h2 style="font-size:20px">Iniciar sesión</h2><p class="sub">Seleccione un perfil de demostración</p>' +
      '<div class="role-grid">' + opciones.map(function (o) { return '<button type="button" class="role-opt ' + (o[0] === rolSel ? 'sel' : '') + '" data-act="rol" data-id="' + o[0] + '"><b>' + o[1] + '</b><span>' + o[2] + '</span></button>'; }).join('') + '</div>' +
      '<label class="f">Correo electrónico</label><input name="email" value="' + esc(u.email) + '" readonly>' +
      '<label class="f">Contraseña</label><input type="password" value="demo1234" readonly>' +
      '<label class="legal"><input type="checkbox" name="habeas" checked style="width:auto;margin-top:2px"> <span>Autorizo el tratamiento de mis datos personales conforme a la Ley 1581 de 2012 y a la política de privacidad del conjunto.</span></label>' +
      '<button class="btn full" type="submit">Ingresar</button><p class="demo-note">Prototipo con datos ficticios. Las contraseñas no se almacenan.</p></form></section></div>';
  }

  // ---------------- Vistas: Administración ----------------
  function kpi(l, v, h) { return '<div class="kpi"><div class="l">' + l + '</div><div class="v">' + v + '</div><div class="h">' + (h || '') + '</div></div>'; }
  function semaforoPill(p) {
    if (p.estado === 'Respondida') return '<span class="pill p-ok">Respondida</span>';
    const e = L.estadoPlazoPQR(p, HOY);
    const cls = { verde: 'p-ok', amarillo: 'p-warn', rojo: 'p-bad' }[e.semaforo];
    return '<span class="pill ' + cls + '">' + e.diasHabiles + ' de ' + L.PLAZO_PQR_DIAS_HABILES + ' días hábiles</span>';
  }
  function vDashboard() {
    const pend = db.cargos.filter(function (c) { return !c.pagado; }).reduce(function (s, c) { return s + c.valor; }, 0);
    const nov = db.cargos.filter(function (c) { return c.periodo === '2026-11'; });
    const recaudo = Math.round(nov.filter(function (c) { return c.pagado; }).length / nov.length * 100);
    const abiertas = db.pqrs.filter(function (p) { return p.estado !== 'Respondida'; });
    const vencidas = abiertas.filter(function (p) { return L.estadoPlazoPQR(p, HOY).semaforo === 'rojo'; }).length;
    const visHoy = db.visitas.filter(function (v) { return v.fecha === hoyIso; }).length;
    const prox = db.reservas.filter(function (r) { return r.fecha >= hoyIso && r.estado !== 'Cancelada'; }).sort(function (a, b) { return (a.fecha + a.horaIni).localeCompare(b.fecha + b.horaIni); }).slice(0, 4);
    const meses = ['2026-09', '2026-10', '2026-11'].map(function (p) {
      const cs = db.cargos.filter(function (c) { return c.periodo === p; });
      return [p, Math.round(cs.filter(function (c) { return c.pagado; }).length / cs.length * 100)];
    });
    return '<h1>Panel de control</h1><p class="sub">Resumen de la operación del conjunto al ' + fFecha(hoyIso) + '.</p>' +
      '<div class="kpis">' + kpi('Inmuebles registrados', db.inmuebles.length, db.usuarios.filter(function (u) { return u.inmuebleId; }).length + ' residentes con perfil') +
      kpi('Cartera pendiente', L.cop(pend), 'Recaudo de noviembre: ' + recaudo + ' %') +
      kpi('PQR abiertas', abiertas.length, vencidas + ' fuera de plazo · promedio ' + String(L.promedioRespuestaPQR(db.pqrs)).replace('.', ',') + ' días hábiles') +
      kpi('Visitas de hoy', visHoy, db.visitas.filter(function (v) { return v.fecha === hoyIso && v.estado === 'Ingresó'; }).length + ' dentro del conjunto') + '</div>' +
      '<div class="grid2"><div class="card"><h2>PQR por atender</h2><table><tr><th>Radicado</th><th>Inmueble</th><th>Asunto</th><th>Plazo</th><th></th></tr>' +
      abiertas.map(function (p) { return '<tr><td class="nw">' + p.radicado + '</td><td>' + nomInm(p.inmuebleId) + '</td><td>' + esc(p.asunto) + '</td><td>' + semaforoPill(p) + '</td><td><a href="#/pqr/' + p.id + '">Gestionar</a></td></tr>'; }).join('') +
      '</table></div><div><div class="card"><h2>Próximas reservas</h2>' + prox.map(function (r) { return '<div class="list-item"><div><b>' + zona(r.zonaId).nombre + '</b><div class="muted">' + fFecha(r.fecha) + ' · ' + r.horaIni + '–' + r.horaFin + ' · ' + nomInm(r.inmuebleId) + '</div></div><span class="pill ' + (r.estado === 'Aprobada' ? 'p-ok' : 'p-warn') + '">' + r.estado + '</span></div>'; }).join('') + '</div>' +
      '<div class="card"><h2>Recaudo por mes</h2>' + meses.map(function (m) { return '<div style="display:flex;align-items:center;gap:10px;margin:8px 0"><span style="width:110px" class="muted">' + fPeriodo(m[0]) + '</span><div style="flex:1;background:#eef1f5;border-radius:4px;height:12px"><div style="width:' + m[1] + '%;background:#1b998b;height:12px;border-radius:4px"></div></div><b style="width:44px;text-align:right">' + m[1] + ' %</b></div>'; }).join('') + '</div></div></div>';
  }
  function vResidentes() {
    const filas = db.inmuebles.map(function (im) {
      const r = residenteDe(im.id);
      return '<tr><td><b>' + nomInm(im.id) + '</b></td><td>' + (r ? esc(r.nombre) : '<span class="muted">Sin registrar</span>') + '</td><td>' + (r ? L.ROLES[r.rol].nombre : '') + '</td><td class="nw">' + (r ? enmascarar(r.doc) : '') + '</td><td>' + (r ? esc(r.email) : '') + '</td><td class="nw">' + im.parq + '</td><td>' + (r && r.habeas ? '<span class="pill p-ok">Autorizado ' + fFecha(r.habeas) + '</span>' : '<span class="pill p-warn">Pendiente</span>') + '</td></tr>';
    }).join('');
    const opts = db.inmuebles.map(function (im) { return '<option value="' + im.id + '">' + nomInm(im.id) + '</option>'; }).join('');
    return '<h1>Residentes e inmuebles</h1><p class="sub">Modelo de datos unificado: conjunto → torre → inmueble → residente, con perfil de acceso por rol.</p>' +
      '<div class="grid2"><div class="card"><h2>Registro de residentes</h2><table><tr><th>Inmueble</th><th>Residente</th><th>Vínculo</th><th>Documento</th><th>Correo</th><th>Parq.</th><th>Habeas data</th></tr>' + filas + '</table></div>' +
      '<form class="card" data-form="residente"><h2>Registrar o actualizar residente</h2><label class="f">Nombre completo</label><input name="nombre" required>' +
      '<div class="row"><div><label class="f">Documento</label><input name="doc" required></div><div><label class="f">Teléfono</label><input name="tel"></div></div>' +
      '<label class="f">Correo electrónico</label><input name="email" type="email" required>' +
      '<div class="row"><div><label class="f">Inmueble</label><select name="inmuebleId">' + opts + '</select></div><div><label class="f">Vínculo (rol)</label><select name="rol"><option value="propietario">Propietario</option><option value="arrendatario">Arrendatario</option></select></div></div>' +
      '<label class="legal"><input type="checkbox" name="habeas" style="width:auto;margin-top:2px"> <span>El residente autorizó el tratamiento de sus datos (Ley 1581 de 2012).</span></label>' +
      '<button class="btn full">Guardar residente</button><p class="demo-note">Si el inmueble ya tiene residente, el registro se reemplaza (p. ej., cambio de arrendatario).</p></form></div>';
  }
  function vReservasAdmin() {
    const filas = db.reservas.slice().sort(function (a, b) { return (a.fecha + a.horaIni).localeCompare(b.fecha + b.horaIni); }).map(function (r) {
      const acciones = r.estado === 'Pendiente' ? '<button class="btn sm" data-act="aprobar-reserva" data-id="' + r.id + '">Aprobar</button> <button class="btn sec sm" data-act="cancelar-reserva" data-id="' + r.id + '">Rechazar</button>' : (r.estado === 'Aprobada' ? '<button class="btn sec sm" data-act="cancelar-reserva" data-id="' + r.id + '">Cancelar</button>' : '');
      return '<tr><td>' + fFecha(r.fecha) + '</td><td>' + r.horaIni + '–' + r.horaFin + '</td><td>' + zona(r.zonaId).nombre + '</td><td>' + nomInm(r.inmuebleId) + '</td><td><span class="pill ' + ({ Aprobada: 'p-ok', Pendiente: 'p-warn', Cancelada: 'p-bad' }[r.estado]) + '">' + r.estado + '</span></td><td>' + acciones + '</td></tr>';
    }).join('');
    const zonas = db.zonas.map(function (z) { return '<div class="list-item"><div><b>' + z.nombre + '</b><div class="muted">' + z.abre + '–' + z.cierra + ' · máx. ' + z.maxHoras + ' h · aforo ' + z.capacidad + '</div></div><span>' + (z.costo ? L.cop(z.costo) : 'Sin costo') + '</span></div>'; }).join('');
    return '<h1>Reservas de zonas comunes</h1><p class="sub">Las reservas se validan automáticamente contra el horario, la duración máxima y los cruces de horario.</p><div class="grid2"><div class="card"><h2>Solicitudes y reservas</h2><table><tr><th>Fecha</th><th>Horario</th><th>Zona</th><th>Inmueble</th><th>Estado</th><th></th></tr>' + filas + '</table></div><div class="card"><h2>Zonas comunes</h2>' + zonas + '</div></div>';
  }
  function vCartera() {
    const filas = db.inmuebles.map(function (im) {
      const pend = db.cargos.filter(function (c) { return c.inmuebleId === im.id && !c.pagado; });
      const saldo = L.saldoInmueble(im.id, db.cargos);
      const est = pend.length === 0 ? '<span class="pill p-ok">Al día</span>' : (pend.length === 1 ? '<span class="pill p-warn">1 cuota pendiente</span>' : '<span class="pill p-bad">' + pend.length + ' cuotas en mora</span>');
      const r = residenteDe(im.id);
      return '<tr><td><b>' + nomInm(im.id) + '</b></td><td>' + (r ? esc(r.nombre) : '') + '</td><td>' + L.cop(saldo) + '</td><td>' + est + '</td><td>' + (saldo ? '<button class="btn sm" data-act="registrar-pago" data-id="' + im.id + '">Registrar pago</button>' : '') + '</td></tr>';
    }).join('');
    const total = db.cargos.filter(function (c) { return !c.pagado; }).reduce(function (s, c) { return s + c.valor; }, 0);
    const ultimos = db.cargos.filter(function (c) { return c.pagado && c.fechaPago; }).sort(function (a, b) { return b.fechaPago.localeCompare(a.fechaPago); }).slice(0, 6);
    return '<h1>Cartera y pagos</h1><p class="sub">Estado de cuenta por inmueble y registro de pagos de expensas comunes (Ley 675 de 2001).</p>' +
      '<div class="kpis">' + kpi('Cartera total pendiente', L.cop(total)) + kpi('Inmuebles al día', db.inmuebles.filter(function (i) { return L.saldoInmueble(i.id, db.cargos) === 0; }).length + ' de ' + db.inmuebles.length) + kpi('Cuota mensual', L.cop(285000), 'Coeficiente 1,04 %') + kpi('Medios de pago', 'PSE · Tarjeta', 'Pasarela simulada en el prototipo') + '</div>' +
      '<div class="grid2"><div class="card"><h2>Estado por inmueble</h2><table><tr><th>Inmueble</th><th>Residente</th><th>Saldo</th><th>Estado</th><th></th></tr>' + filas + '</table></div>' +
      '<div class="card"><h2>Últimos pagos recibidos</h2>' + ultimos.map(function (c) { return '<div class="list-item"><div><b>' + nomInm(c.inmuebleId) + '</b><div class="muted">' + esc(c.concepto) + ' · ' + c.ref + '</div></div><span>' + L.cop(c.valor) + '</span></div>'; }).join('') + '</div></div>';
  }
  function certificado(inmId) {
    const r = residenteDe(inmId);
    const prop = r && r.rol === 'propietario' ? r.nombre : 'el propietario registrado';
    const cod = 'PYS-' + inmId.toUpperCase() + '-' + hoyIso.replace(/-/g, '');
    return '<div class="cert"><div style="display:flex;align-items:center;gap:10px">' + logo(36) + '<div><b>' + esc(conjunto().nombre) + '</b><div class="muted">Bogotá D. C. · Administración</div></div></div>' +
      '<h3>CERTIFICADO DE PAZ Y SALVO</h3><p>La administración certifica que el inmueble <b>' + nomInm(inmId) + '</b>, a nombre de <b>' + esc(prop) + '</b>, se encuentra a paz y salvo por concepto de expensas comunes ordinarias y extraordinarias a la fecha de expedición.</p>' +
      '<p>Expedido el ' + fFecha(hoyIso) + '. Código de verificación: <b>' + cod + '</b>.</p><p class="muted" style="font-size:12px">Documento generado automáticamente por la plataforma a partir del estado de cuenta del inmueble.</p>' +
      '<div class="no-print" style="margin-top:12px"><button class="btn sm" onclick="window.print()">Imprimir / guardar PDF</button></div></div>';
  }
  function vCertificados(u, ruta) {
    let inmId = u.inmuebleId || ruta[0] || 'i3';
    const opts = u.inmuebleId ? '' : '<div class="card no-print"><label class="f">Inmueble</label><select data-act="sel-cert">' + db.inmuebles.map(function (im) { return '<option value="' + im.id + '"' + (im.id === inmId ? ' selected' : '') + '>' + nomInm(im.id) + '</option>'; }).join('') + '</select></div>';
    const ok = L.puedeExpedirPazYSalvo(inmId, db.cargos);
    const cuerpo = ok ? certificado(inmId) : '<div class="msg err">No es posible expedir el paz y salvo: el inmueble ' + nomInm(inmId) + ' registra un saldo pendiente de ' + L.cop(L.saldoInmueble(inmId, db.cargos)) + '. Realice el pago en el módulo de pagos.</div>';
    return '<h1>Certificados</h1><p class="sub">Expedición inmediata del paz y salvo cuando el inmueble no registra saldos pendientes.</p><div class="grid2"><div>' + cuerpo + '</div><div>' + opts + '<div class="card"><h2>Reglas de expedición</h2><div class="list-item">Saldo del inmueble en $0</div><div class="list-item">Código de verificación único</div><div class="list-item">Registro de la expedición en auditoría</div></div></div></div>';
  }
  function vParqueaderos() {
    const filas = db.parqueaderos.map(function (p) {
      return '<tr><td><b>' + p.codigo + '</b></td><td>' + p.tipo + '</td><td>' + (p.inmuebleId ? nomInm(p.inmuebleId) : '—') + '</td><td>' + (p.placa || '<span class="muted">Sin vehículo</span>') + '</td><td>' + (p.tipo === 'Visitantes' ? (p.placa ? '<span class="pill p-warn">Ocupado</span>' : '<span class="pill p-ok">Libre</span>') : '<span class="pill p-info">Asignado</span>') + '</td></tr>';
    }).join('');
    return '<h1>Parqueaderos</h1><p class="sub">Asignación de parqueaderos privados y control de ocupación de los de visitantes.</p><div class="card"><table><tr><th>Código</th><th>Tipo</th><th>Inmueble</th><th>Placa</th><th>Estado</th></tr>' + filas + '</table></div>';
  }
  function vArriendos(u) {
    const cards = db.arriendos.map(function (a) { return '<div class="card"><span class="pill p-info">' + a.tipo + '</span><h2 style="margin-top:8px">' + esc(a.titulo) + '</h2><p class="muted">' + esc(a.detalle) + '</p><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:18px">' + L.cop(a.canon) + ' / mes</b><span class="pill p-ok">' + a.estado + '</span></div><p class="muted" style="font-size:12px">Publicado por ' + nomInm(a.inmuebleId) + '</p></div>'; }).join('');
    const form = (u.rol === 'propietario') ? '<form class="card" data-form="arriendo"><h2>Publicar mi inmueble o parqueadero</h2><div class="row"><div><label class="f">Tipo</label><select name="tipo"><option>Apartamento</option><option>Parqueadero</option></select></div><div><label class="f">Canon mensual (COP)</label><input name="canon" type="number" min="0" required></div></div><label class="f">Título</label><input name="titulo" required><label class="f">Detalle</label><textarea name="detalle"></textarea><button class="btn full">Publicar</button></form>' : '';
    return '<h1>Inmuebles en arriendo</h1><p class="sub">Oferta interna de apartamentos y parqueaderos disponibles dentro de la copropiedad.</p><div class="grid2e"><div>' + cards + '</div><div>' + form + '</div></div>';
  }
  function filaVisita(v, conAcciones) {
    const pill = { Autorizada: 'p-info', 'Ingresó': 'p-warn', 'Salió': 'p-ok' }[v.estado];
    let acc = '';
    if (conAcciones && v.fecha === hoyIso) {
      if (v.estado === 'Autorizada') acc = '<button class="btn sm" data-act="ingreso" data-id="' + v.id + '">Registrar ingreso</button>';
      if (v.estado === 'Ingresó') acc = '<button class="btn sec sm" data-act="salida" data-id="' + v.id + '">Registrar salida</button>';
    }
    return '<tr><td class="nw">' + fFecha(v.fecha) + '</td><td><b>' + esc(v.nombre) + '</b><div class="muted" style="font-size:12px">' + enmascarar(v.doc) + (v.placa ? ' · ' + esc(v.placa) : '') + '</div></td><td class="nw">' + nomInm(v.inmuebleId) + '</td><td><code>' + v.codigo + '</code></td><td><span class="pill ' + pill + '">' + v.estado + '</span>' + (v.ingreso ? '<div class="muted" style="font-size:12px">' + v.ingreso + (v.salida ? ' – ' + v.salida : '') + '</div>' : '') + '</td>' + (conAcciones ? '<td>' + acc + '</td>' : '') + '</tr>';
  }
  function vVisitantes() {
    const filas = db.visitas.slice().sort(function (a, b) { return b.fecha.localeCompare(a.fecha); }).map(function (v) { return filaVisita(v, false); }).join('');
    return '<h1>Visitantes</h1><p class="sub">Registro histórico de visitas autorizadas por los residentes y verificadas en portería.</p><div class="card"><table><tr><th>Fecha</th><th>Visitante</th><th>Destino</th><th>Código</th><th>Estado</th></tr>' + filas + '</table></div>';
  }
  function vPQRAdmin(u, ruta) {
    if (ruta[0]) return vPQRDetalle(ruta[0], true);
    const filas = db.pqrs.slice().sort(function (a, b) { return b.radicado.localeCompare(a.radicado); }).map(function (p) {
      return '<tr><td class="nw"><b>' + p.radicado + '</b></td><td>' + fFecha(p.fechaRadicado) + '</td><td>' + nomInm(p.inmuebleId) + '</td><td>' + p.tipo + '</td><td>' + esc(p.asunto) + '</td><td>' + p.estado + '</td><td>' + semaforoPill(p) + '</td><td><a href="#/pqr/' + p.id + '">Gestionar</a></td></tr>';
    }).join('');
    return '<h1>Peticiones, quejas y reclamos</h1><p class="sub">Trazabilidad de cada solicitud con semáforo frente al plazo de referencia de ' + L.PLAZO_PQR_DIAS_HABILES + ' días hábiles.</p>' +
      '<div class="kpis">' + kpi('PQR radicadas', db.pqrs.length) + kpi('Abiertas', db.pqrs.filter(function (p) { return p.estado !== 'Respondida'; }).length) + kpi('Tiempo promedio de respuesta', String(L.promedioRespuestaPQR(db.pqrs)).replace('.', ',') + ' días', 'hábiles, sobre PQR respondidas') + kpi('Fuera de plazo', db.pqrs.filter(function (p) { return p.estado !== 'Respondida' && L.estadoPlazoPQR(p, HOY).semaforo === 'rojo'; }).length, 'Requieren atención inmediata') + '</div>' +
      '<div class="card"><table><tr><th>Radicado</th><th>Fecha</th><th>Inmueble</th><th>Tipo</th><th>Asunto</th><th>Estado</th><th>Plazo</th><th></th></tr>' + filas + '</table></div>';
  }
  function vPQRDetalle(id, admin) {
    const p = db.pqrs.find(function (x) { return x.id === id; });
    if (!p) return '<p>No encontrada.</p>';
    const tl = '<div class="timeline">' + p.historial.map(function (h) { return '<div><b>' + fFecha(h.fecha) + '</b> — ' + esc(h.evento) + '</div>'; }).join('') + '</div>';
    const resp = p.respuesta ? '<div class="msg ok"><b>Respuesta:</b> ' + esc(p.respuesta) + '</div>' : '';
    const form = admin && p.estado !== 'Respondida' ? '<form class="card" data-form="responder-pqr" data-id="' + p.id + '"><h2>Gestionar</h2><label class="f">Respuesta al residente</label><textarea name="respuesta" required></textarea><div class="row" style="margin-top:10px"><button class="btn sec" type="button" data-act="tramite-pqr" data-id="' + p.id + '">Marcar en trámite</button><button class="btn">Enviar respuesta</button></div></form>' : '';
    return '<p><a href="#/' + (admin ? 'pqr' : 'mis-pqr') + '">← Volver</a></p><h1>' + p.radicado + ' · ' + esc(p.asunto) + '</h1><p class="sub">' + p.tipo + ' radicada el ' + fFecha(p.fechaRadicado) + ' por ' + nomInm(p.inmuebleId) + '</p>' +
      '<div class="grid2"><div class="card"><h2>Descripción</h2><p>' + esc(p.descripcion) + '</p>' + resp + '<h2 style="margin-top:18px">Trazabilidad</h2>' + tl + '</div><div><div class="card"><h2>Plazo</h2>' + semaforoPill(p) + '<p class="muted">Estado: ' + p.estado + '</p></div>' + form + '</div></div>';
  }
  function vComunicados(u) {
    const lista = db.comunicados.map(function (m) { return '<div class="card"><div style="display:flex;justify-content:space-between"><h2>' + esc(m.titulo) + '</h2><span class="pill p-info">' + esc(m.audiencia) + '</span></div><p>' + esc(m.cuerpo) + '</p><div class="muted" style="font-size:12px">Publicado el ' + fFecha(m.fecha) + '</div></div>'; }).join('');
    const form = u.rol === 'admin' ? '<form class="card" data-form="comunicado"><h2>Nuevo comunicado</h2><label class="f">Título</label><input name="titulo" required><label class="f">Mensaje</label><textarea name="cuerpo" required></textarea><label class="f">Audiencia</label><select name="audiencia"><option>Todos</option><option>Propietarios</option><option>Arrendatarios</option><option>Torre 1</option><option>Torre 2</option><option>Torre 3</option><option>Torre 4</option></select><button class="btn full" style="margin-top:12px">Publicar y notificar</button></form>' : '';
    return '<h1>Comunicados</h1><p class="sub">Canal oficial de comunicación entre la administración y la comunidad.</p><div class="' + (form ? 'grid2' : '') + '"><div>' + lista + '</div>' + (form ? '<div>' + form + '</div>' : '') + '</div>';
  }
  function vAuditoria() {
    return '<h1>Auditoría de accesos</h1><p class="sub">Registro de accesos y de intentos denegados por el control de acceso basado en roles.</p><div class="card"><table><tr><th>Fecha y hora</th><th>Usuario</th><th>Rol</th><th>Acción</th><th>Resultado</th></tr>' +
      db.auditoria.slice(0, 20).map(function (a) { return '<tr><td>' + a.fecha + '</td><td>' + esc(a.usuario) + '</td><td>' + a.rol + '</td><td>' + esc(a.accion) + '</td><td><span class="pill ' + (a.resultado === 'Denegado' ? 'p-bad' : 'p-ok') + '">' + a.resultado + '</span></td></tr>'; }).join('') + '</table></div>';
  }
  function vConjuntos() {
    const cj = conjunto();
    const filas = db.conjuntos.map(function (c) { return '<tr><td><b>' + esc(c.nombre) + '</b></td><td>' + esc(c.localidad) + '</td><td>' + c.unidades + '</td><td><span class="pill ' + (c.estado === 'Activo' ? 'p-ok' : (c.estado === 'Piloto' ? 'p-info' : 'p-warn')) + '">' + c.estado + '</span></td><td>' + Object.keys(c.modulos).filter(function (k) { return c.modulos[k]; }).length + ' de 8</td><td>' + (c.id === cj.id ? '<span class="muted">Seleccionado</span>' : '<button class="btn sec sm" data-act="sel-conjunto" data-id="' + c.id + '">Seleccionar</button>') + '</td></tr>'; }).join('');
    const mods = Object.keys(cj.modulos).map(function (k) { return '<div class="switch"><span>' + ETIQUETAS[k] + '</span><button class="btn sm ' + (cj.modulos[k] ? '' : 'sec') + '" data-act="toggle-mod" data-id="' + k + '">' + (cj.modulos[k] ? 'Activo' : 'Inactivo') + '</button></div>'; }).join('');
    return '<h1>Conjuntos y módulos</h1><p class="sub">Gestión multi-conjunto (modelo SaaS): alta de copropiedades y activación de módulos por plan.</p><div class="grid2"><div class="card"><h2>Copropiedades</h2><table><tr><th>Conjunto</th><th>Localidad</th><th>Unidades</th><th>Estado</th><th>Módulos</th><th></th></tr>' + filas + '</table></div>' +
      '<div><div class="card"><h2>Módulos de ' + esc(cj.nombre) + '</h2>' + mods + '</div><form class="card" data-form="conjunto"><h2>Nuevo conjunto</h2><label class="f">Nombre</label><input name="nombre" required><div class="row"><div><label class="f">Localidad</label><input name="localidad" required></div><div><label class="f">Unidades</label><input name="unidades" type="number" min="1" required></div></div><button class="btn full" style="margin-top:12px">Crear conjunto</button></form></div></div>';
  }

  // ---------------- Vistas: Residente ----------------
  function vInicio(u) {
    const saldo = L.saldoInmueble(u.inmuebleId, db.cargos);
    const misRes = db.reservas.filter(function (r) { return r.inmuebleId === u.inmuebleId && r.fecha >= hoyIso && r.estado !== 'Cancelada'; });
    const misPqr = db.pqrs.filter(function (p) { return p.inmuebleId === u.inmuebleId && p.estado !== 'Respondida'; });
    const misVis = db.visitas.filter(function (v) { return v.inmuebleId === u.inmuebleId && v.fecha === hoyIso; });
    return '<h1>Hola, ' + esc(u.nombre.split(' ')[0]) + '</h1><p class="sub">Todo lo de tu conjunto en un solo lugar.</p><div class="kpis">' +
      kpi('Saldo pendiente', L.cop(saldo), saldo ? '<a href="#/pagos">Pagar ahora</a>' : 'Estás al día') + kpi('Próxima reserva', misRes[0] ? fFecha(misRes[0].fecha) : '—', misRes[0] ? zona(misRes[0].zonaId).nombre : '<a href="#/reservar">Reservar</a>') +
      kpi('Mis PQR abiertas', misPqr.length, '<a href="#/mis-pqr">Ver seguimiento</a>') + kpi('Visitas de hoy', misVis.length, '<a href="#/mis-visitas">Autorizar visita</a>') + '</div>' +
      '<div class="card"><h2>Comunicados recientes</h2>' + db.comunicados.slice(0, 3).map(function (m) { return '<div class="list-item"><div><b>' + esc(m.titulo) + '</b><div class="muted">' + esc(m.cuerpo) + '</div></div><span class="muted">' + fFecha(m.fecha) + '</span></div>'; }).join('') + '</div>';
  }
  let fechaReserva = null;
  function vReservar(u) {
    const f = fechaReserva || masDias(2);
    const zs = db.zonas.map(function (z) { return '<option value="' + z.id + '">' + z.nombre + ' (' + z.abre + '–' + z.cierra + ', máx. ' + z.maxHoras + ' h)</option>'; }).join('');
    const ocup = db.zonas.map(function (z) {
      const rs = db.reservas.filter(function (r) { return r.zonaId === z.id && r.fecha === f && r.estado !== 'Cancelada'; });
      return '<div class="list-item"><b>' + z.nombre + '</b><span>' + (rs.length ? rs.map(function (r) { return '<span class="pill p-warn">' + r.horaIni + '–' + r.horaFin + '</span>'; }).join(' ') : '<span class="pill p-ok">Disponible todo el día</span>') + '</span></div>';
    }).join('');
    const mis = db.reservas.filter(function (r) { return r.inmuebleId === u.inmuebleId; }).map(function (r) { return '<div class="list-item"><div><b>' + zona(r.zonaId).nombre + '</b><div class="muted">' + fFecha(r.fecha) + ' · ' + r.horaIni + '–' + r.horaFin + '</div></div><span class="pill ' + ({ Aprobada: 'p-ok', Pendiente: 'p-warn', Cancelada: 'p-bad' }[r.estado]) + '">' + r.estado + '</span></div>'; }).join('') || '<p class="muted">Aún no tienes reservas.</p>';
    return '<h1>Reservar zona común</h1><p class="sub">Consulta la disponibilidad y reserva sin trámites ante la administración.</p><div class="grid2"><div><form class="card" data-form="reservar"><h2>Nueva reserva</h2><label class="f">Zona común</label><select name="zonaId">' + zs + '</select>' +
      '<div class="row3"><div><label class="f">Fecha</label><input type="date" name="fecha" value="' + f + '" min="' + hoyIso + '" data-act="fecha-reserva"></div><div><label class="f">Hora inicial</label><input type="time" name="horaIni" value="15:00"></div><div><label class="f">Hora final</label><input type="time" name="horaFin" value="18:00"></div></div>' +
      '<button class="btn full" style="margin-top:14px">Solicitar reserva</button></form><div class="card"><h2>Mis reservas</h2>' + mis + '</div></div><div class="card"><h2>Ocupación del ' + fFecha(f) + '</h2>' + ocup + '</div></div>';
  }
  let pagoAbierto = false;
  function vPagos(u) {
    const cs = db.cargos.filter(function (c) { return c.inmuebleId === u.inmuebleId; }).sort(function (a, b) { return b.periodo.localeCompare(a.periodo); });
    const saldo = L.saldoInmueble(u.inmuebleId, db.cargos);
    const filas = cs.map(function (c) { return '<tr><td>' + esc(c.concepto) + '</td><td>' + L.cop(c.valor) + '</td><td>' + (c.pagado ? '<span class="pill p-ok">Pagado</span>' : '<span class="pill p-warn">Pendiente</span>') + '</td><td class="muted">' + (c.ref || '') + '</td></tr>'; }).join('');
    const pasarela = pagoAbierto && saldo ? '<form class="card" data-form="pagar" style="border:2px solid #1b998b"><h2>Pasarela de pagos (simulada)</h2><p>Total a pagar: <b>' + L.cop(saldo) + '</b></p><label class="f">Medio de pago</label><select name="medio"><option value="PSE">PSE — débito a cuenta</option><option value="TC">Tarjeta de crédito</option></select><label class="f">Banco o franquicia</label><select><option>Banco de prueba</option></select><div class="row" style="margin-top:12px"><button class="btn sec" type="button" data-act="cerrar-pago">Cancelar</button><button class="btn">Confirmar pago</button></div><p class="demo-note">En producción se integrará una pasarela certificada; el prototipo no procesa dinero real.</p></form>' : '';
    return '<h1>Mis pagos</h1><p class="sub">Estado de cuenta del inmueble ' + nomInm(u.inmuebleId) + '.</p><div class="grid2"><div class="card"><h2>Estado de cuenta</h2><table><tr><th>Concepto</th><th>Valor</th><th>Estado</th><th>Referencia</th></tr>' + filas + '</table></div><div><div class="card"><h2>Saldo pendiente</h2><div style="font-size:30px;font-weight:700">' + L.cop(saldo) + '</div>' + (saldo ? '<button class="btn full" style="margin-top:12px" data-act="abrir-pago">Pagar en línea</button>' : '<p class="muted">Estás al día. Puedes descargar tu paz y salvo.</p>') + '</div>' + pasarela + '</div></div>';
  }
  let ultimoCodigo = null;
  function vMisVisitas(u) {
    const mis = db.visitas.filter(function (v) { return v.inmuebleId === u.inmuebleId; }).sort(function (a, b) { return b.fecha.localeCompare(a.fecha); });
    const cod = ultimoCodigo ? '<div class="card" style="border:2px solid #1b998b"><h2>Visita autorizada</h2><p>Comparte este código con tu visitante. La portería lo verificará al ingreso:</p><div class="code">' + ultimoCodigo + '</div></div>' : '';
    ultimoCodigo = null;
    return '<h1>Mis visitas</h1><p class="sub">Autoriza a tus visitantes con anticipación y recibe la confirmación de su ingreso en tiempo real.</p><div class="grid2"><div class="card"><h2>Historial</h2><table><tr><th>Fecha</th><th>Visitante</th><th>Destino</th><th>Código</th><th>Estado</th></tr>' + mis.map(function (v) { return filaVisita(v, false); }).join('') + '</table></div><div>' + cod +
      '<form class="card" data-form="visita"><h2>Autorizar visita</h2><label class="f">Nombre del visitante</label><input name="nombre" required><div class="row"><div><label class="f">Documento</label><input name="doc" required></div><div><label class="f">Placa (opcional)</label><input name="placa"></div></div><label class="f">Fecha de la visita</label><input type="date" name="fecha" value="' + hoyIso + '" min="' + hoyIso + '"><button class="btn full" style="margin-top:12px">Generar autorización</button></form></div></div>';
  }
  function vMisPQR(u, ruta) {
    if (ruta[0]) return vPQRDetalle(ruta[0], false);
    const mis = db.pqrs.filter(function (p) { return p.inmuebleId === u.inmuebleId; });
    return '<h1>Mis PQR</h1><p class="sub">Radica peticiones, quejas y reclamos y consulta su estado en cualquier momento.</p><div class="grid2"><div class="card"><h2>Seguimiento</h2>' +
      (mis.map(function (p) { return '<div class="list-item"><div><b>' + p.radicado + ' · ' + esc(p.asunto) + '</b><div class="muted">' + p.tipo + ' · radicada el ' + fFecha(p.fechaRadicado) + ' · ' + p.estado + '</div></div><div style="text-align:right">' + semaforoPill(p) + '<div><a href="#/mis-pqr/' + p.id + '">Ver detalle</a></div></div></div>'; }).join('') || '<p class="muted">No tienes PQR radicadas.</p>') +
      '</div><form class="card" data-form="pqr"><h2>Radicar PQR</h2><label class="f">Tipo</label><select name="tipo"><option>Petición</option><option>Queja</option><option>Reclamo</option></select><label class="f">Asunto</label><input name="asunto" required><label class="f">Descripción</label><textarea name="descripcion" required></textarea><button class="btn full" style="margin-top:12px">Radicar</button><p class="demo-note">Recibirás un número de radicado y la administración tendrá un plazo de referencia de ' + L.PLAZO_PQR_DIAS_HABILES + ' días hábiles.</p></form></div>';
  }

  // ---------------- Vistas: Seguridad ----------------
  let verificacion = null;
  function vPorteria() {
    const hoy = db.visitas.filter(function (v) { return v.fecha === hoyIso; });
    let res = '';
    if (verificacion) {
      res = verificacion.ok ? '<div class="msg ok"><b>Autorización válida.</b> ' + esc(verificacion.visita.nombre) + ' → ' + nomInm(verificacion.visita.inmuebleId) + ' (autorizó ' + esc(verificacion.visita.autorizadoPor) + '). <button class="btn sm" data-act="ingreso" data-id="' + verificacion.visita.id + '">Registrar ingreso</button></div>' : '<div class="msg err"><b>Ingreso no autorizado.</b> ' + esc(verificacion.motivo) + '</div>';
      verificacion = null;
    }
    const opts = db.inmuebles.map(function (im) { return '<option value="' + im.id + '">' + nomInm(im.id) + '</option>'; }).join('');
    return '<h1>Control de acceso</h1><p class="sub">Verificación de visitantes contra las autorizaciones registradas por los residentes.</p><div class="grid2"><div><form class="card" data-form="verificar"><h2>Verificar código de autorización</h2><div style="display:flex;gap:10px"><input name="codigo" placeholder="Ej.: ' + (hoy[0] ? hoy[0].codigo : 'ABC123') + '" style="font-size:18px;letter-spacing:2px;text-transform:uppercase"><button class="btn">Verificar</button></div>' + res + '</form>' +
      '<div class="card"><h2>Visitas de hoy</h2><table><tr><th>Fecha</th><th>Visitante</th><th>Destino</th><th>Código</th><th>Estado</th><th></th></tr>' + hoy.map(function (v) { return filaVisita(v, true); }).join('') + '</table></div></div>' +
      '<div class="card"><h2>Consulta de inmueble</h2><select data-act="consulta-inm">' + opts + '</select><div id="consulta" style="margin-top:12px">' + consultaInm('i1') + '</div><p class="demo-note">Por protección de datos, la portería solo ve nombre, vínculo, parqueadero y placa; no ve documentos ni contactos.</p></div></div>';
  }
  function consultaInm(id) {
    const r = residenteDe(id); const im = inmueble(id);
    const pq = db.parqueaderos.find(function (p) { return p.codigo === im.parq; });
    return '<div class="list-item"><span class="muted">Residente</span><b>' + (r ? esc(r.nombre) : '—') + '</b></div><div class="list-item"><span class="muted">Vínculo</span><span>' + (r ? L.ROLES[r.rol].nombre : '—') + '</span></div><div class="list-item"><span class="muted">Parqueadero</span><span>' + im.parq + '</span></div><div class="list-item"><span class="muted">Vehículo registrado</span><span>' + (pq && pq.placa ? pq.placa : 'Ninguno') + '</span></div>';
  }
  function vMinuta(u) {
    return '<h1>Minuta digital</h1><p class="sub">Reemplaza el cuaderno de minuta de portería con registros consultables.</p><div class="grid2"><div class="card"><h2>Registros del turno · ' + fFecha(hoyIso) + '</h2>' + db.minuta.map(function (m) { return '<div class="list-item"><div><b>' + m.hora + '</b> — ' + esc(m.texto) + '</div><span class="muted">' + esc(m.por) + '</span></div>'; }).join('') + '</div>' +
      '<form class="card" data-form="minuta"><h2>Registrar novedad</h2><label class="f">Descripción</label><textarea name="texto" required></textarea><button class="btn full" style="margin-top:12px">Agregar a la minuta</button></form></div>';
  }

  const VISTAS = {
    dashboard: vDashboard, residentes: vResidentes, reservas: vReservasAdmin, cartera: vCartera, certificados: vCertificados,
    parqueaderos: vParqueaderos, arriendos: vArriendos, visitantes: vVisitantes, pqr: vPQRAdmin, comunicados: vComunicados,
    auditoria: vAuditoria, conjuntos: vConjuntos, inicio: vInicio, reservar: vReservar, pagos: vPagos,
    'mis-visitas': vMisVisitas, 'mis-pqr': vMisPQR, porteria: vPorteria, minuta: vMinuta
  };

  function vDenegado(mod) {
    return '<div class="card denied"><div class="big">403</div><h1>Acceso denegado</h1><p class="sub">Su perfil no tiene permiso para el módulo «' + esc(ETIQUETAS[mod] || mod) + '». El intento quedó registrado en la auditoría de accesos.</p><a class="btn" href="#/">Volver al inicio</a></div>';
  }

  // ---------------- Render ----------------
  function render() {
    const h = leerHash();
    if (h.params.as && DEMO[h.params.as]) { sesion = { userId: DEMO[h.params.as] }; guardarSesion(); }
    const u = usuario();
    if (!u) { root.innerHTML = vLogin(); return; }
    const mod = h.ruta[0] || rutaInicial(u.rol);
    // Enlaces de demostración (solo con ?as=): permiten abrir estados concretos para presentaciones.
    if (h.params.as) {
      if (h.params.codigo && mod === 'porteria') verificacion = L.verificarIngreso(h.params.codigo === 'demo' ? db.visitas[0].codigo : h.params.codigo, db.visitas, hoyIso);
      if (h.params.pagar && mod === 'pagos') pagoAbierto = true;
      if (h.params.reserva === 'choque' && mod === 'reservar') {
        const r0 = db.reservas.find(function (r) { return r.id === 'rv2'; });
        fechaReserva = r0.fecha;
        const v = L.validarReserva({ fecha: r0.fecha, horaIni: '15:00', horaFin: '18:00' }, zona(r0.zonaId), db.reservas);
        if (!v.ok) err('No se pudo reservar Salón comunal (' + fFecha(r0.fecha) + ', 15:00–18:00): ' + v.motivo);
      }
    }
    let contenido;
    if (!VISTAS[mod] || !L.puede(u.rol, mod)) {
      const clave = u.id + mod;
      if (ultimoDenegado !== clave) { audit(u, 'Acceso a módulo "' + mod + '"', 'Denegado'); ultimoDenegado = clave; }
      contenido = vDenegado(mod);
    } else {
      ultimoDenegado = '';
      contenido = VISTAS[mod](u, h.ruta.slice(1));
    }
    root.innerHTML = shell(u, mod, contenido);
  }

  // ---------------- Acciones ----------------
  function datos(form) { const o = {}; new FormData(form).forEach(function (v, k) { o[k] = v; }); o._habeas = form.habeas ? form.habeas.checked : true; return o; }
  function ok(t) { flash = { tipo: 'ok', texto: t }; }
  function err(t) { flash = { tipo: 'err', texto: t }; }

  document.addEventListener('click', function (e) {
    const t = e.target.closest('[data-act]');
    if (!t || t.tagName === 'SELECT' || t.tagName === 'INPUT') return;
    const act = t.getAttribute('data-act'), id = t.getAttribute('data-id');
    const u = usuario();
    if (act === 'rol') { rolSel = id; render(); return; }
    if (act === 'salir') { audit(u, 'Cierre de sesión', 'Permitido'); sesion = null; guardarSesion(); location.hash = '#/'; render(); return; }
    if (act === 'aprobar-reserva' || act === 'cancelar-reserva') { const r = db.reservas.find(function (x) { return x.id === id; }); r.estado = act === 'aprobar-reserva' ? 'Aprobada' : 'Cancelada'; ok('Reserva ' + r.estado.toLowerCase() + '.'); }
    if (act === 'registrar-pago') { const c = db.cargos.filter(function (x) { return x.inmuebleId === id && !x.pagado; }).sort(function (a, b) { return a.periodo.localeCompare(b.periodo); })[0]; c.pagado = true; c.fechaPago = hoyIso; c.ref = 'CAJA-' + Date.now().toString().slice(-6); ok('Pago registrado para ' + nomInm(id) + ': ' + c.concepto + '.'); }
    if (act === 'abrir-pago') pagoAbierto = true;
    if (act === 'cerrar-pago') pagoAbierto = false;
    if (act === 'ingreso' || act === 'salida') {
      const v = db.visitas.find(function (x) { return x.id === id; });
      if (act === 'ingreso') { v.estado = 'Ingresó'; v.ingreso = hora(); db.minuta.push({ hora: hora(), texto: 'Ingreso de ' + v.nombre + ' a ' + nomInm(v.inmuebleId) + ' (código ' + v.codigo + ').', por: u.nombre }); ok('Ingreso registrado. El residente fue notificado.'); }
      else { v.estado = 'Salió'; v.salida = hora(); db.minuta.push({ hora: hora(), texto: 'Salida de ' + v.nombre + '.', por: u.nombre }); ok('Salida registrada.'); }
    }
    if (act === 'tramite-pqr') { const p = db.pqrs.find(function (x) { return x.id === id; }); p.estado = 'En trámite'; p.historial.push({ fecha: hoyIso, evento: 'En trámite por ' + u.nombre }); ok('PQR marcada en trámite.'); }
    if (act === 'toggle-mod') { const c = conjunto(); c.modulos[id] = !c.modulos[id]; ok('Módulo ' + ETIQUETAS[id] + (c.modulos[id] ? ' activado.' : ' desactivado.')); }
    if (act === 'sel-conjunto') { db.conjuntoId = id; ok('Conjunto seleccionado.'); }
    guardar(); render();
  });

  document.addEventListener('change', function (e) {
    const act = e.target.getAttribute('data-act');
    if (act === 'sel-cert') ir('certificados/' + e.target.value);
    if (act === 'fecha-reserva') { fechaReserva = e.target.value; render(); }
    if (act === 'consulta-inm') document.getElementById('consulta').innerHTML = consultaInm(e.target.value);
  });

  document.addEventListener('submit', function (e) {
    const f = e.target.closest('[data-form]');
    if (!f) return;
    e.preventDefault();
    const tipo = f.getAttribute('data-form'), d = datos(f), u = usuario();
    if (tipo === 'login') {
      if (!d._habeas) { alert('Debe autorizar el tratamiento de datos personales para continuar.'); return; }
      sesion = { userId: DEMO[rolSel] }; guardarSesion(); audit(usuario(), 'Inicio de sesión', 'Permitido');
      location.hash = '#/' + rutaInicial(usuario().rol); render(); return;
    }
    if (tipo === 'residente') {
      if (!d._habeas) { err('Debe registrarse la autorización de tratamiento de datos (Ley 1581 de 2012).'); render(); return; }
      db.usuarios = db.usuarios.filter(function (x) { return x.inmuebleId !== d.inmuebleId; });
      db.usuarios.push({ id: uid('r'), nombre: d.nombre, doc: d.doc, tel: d.tel, email: d.email, rol: d.rol, inmuebleId: d.inmuebleId, habeas: hoyIso });
      ok('Residente registrado en ' + nomInm(d.inmuebleId) + '.');
    }
    if (tipo === 'reservar') {
      const z = zona(d.zonaId);
      const v = L.validarReserva(d, z, db.reservas);
      if (!v.ok) err('No se pudo reservar: ' + v.motivo);
      else { db.reservas.push({ id: uid('rv'), zonaId: z.id, inmuebleId: u.inmuebleId, fecha: d.fecha, horaIni: d.horaIni, horaFin: d.horaFin, estado: z.costo ? 'Pendiente' : 'Aprobada' }); fechaReserva = d.fecha; ok('Reserva registrada: ' + z.nombre + ', ' + fFecha(d.fecha) + ' de ' + d.horaIni + ' a ' + d.horaFin + (z.costo ? '. Pendiente de aprobación (costo ' + L.cop(z.costo) + ').' : '. Aprobada automáticamente.')); }
    }
    if (tipo === 'pagar') {
      db.cargos.filter(function (c) { return c.inmuebleId === u.inmuebleId && !c.pagado; }).forEach(function (c) { c.pagado = true; c.fechaPago = hoyIso; c.ref = d.medio + '-' + Date.now().toString().slice(-6); });
      pagoAbierto = false; ok('Pago aprobado (simulado). Ya puedes descargar tu paz y salvo.');
    }
    if (tipo === 'visita') {
      const cod = L.generarCodigoVisita(Date.now() % 100000);
      db.visitas.push({ id: uid('v'), inmuebleId: u.inmuebleId, nombre: d.nombre, doc: d.doc, placa: d.placa, fecha: d.fecha, codigo: cod, estado: 'Autorizada', autorizadoPor: u.nombre });
      ultimoCodigo = cod; ok('Visita autorizada para ' + fFecha(d.fecha) + '.');
    }
    if (tipo === 'pqr') {
      const rad = L.siguienteRadicado(db.pqrs, '2026');
      db.pqrs.push({ id: uid('q'), radicado: rad, inmuebleId: u.inmuebleId, tipo: d.tipo, asunto: d.asunto, descripcion: d.descripcion, estado: 'Radicada', fechaRadicado: hoyIso, fechaRespuesta: '', respuesta: '', historial: [{ fecha: hoyIso, evento: 'Radicada por el residente' }] });
      ok('PQR radicada con el número ' + rad + '.');
    }
    if (tipo === 'responder-pqr') {
      const p = db.pqrs.find(function (x) { return x.id === f.getAttribute('data-id'); });
      p.estado = 'Respondida'; p.respuesta = d.respuesta; p.fechaRespuesta = hoyIso; p.historial.push({ fecha: hoyIso, evento: 'Respondida por ' + u.nombre });
      ok('Respuesta enviada al residente. Tiempo de atención: ' + L.estadoPlazoPQR(p, HOY).diasHabiles + ' días hábiles.');
    }
    if (tipo === 'verificar') { verificacion = L.verificarIngreso(d.codigo, db.visitas, hoyIso); }
    if (tipo === 'comunicado') { db.comunicados.unshift({ id: uid('m'), titulo: d.titulo, cuerpo: d.cuerpo, audiencia: d.audiencia, fecha: hoyIso }); ok('Comunicado publicado y notificado a: ' + d.audiencia + '.'); }
    if (tipo === 'arriendo') { db.arriendos.push({ id: uid('a'), tipo: d.tipo, inmuebleId: u.inmuebleId, titulo: d.titulo, canon: parseInt(d.canon, 10), detalle: d.detalle, estado: 'Disponible' }); ok('Publicación creada.'); }
    if (tipo === 'minuta') { db.minuta.push({ hora: hora(), texto: d.texto, por: u.nombre }); ok('Novedad registrada.'); }
    if (tipo === 'conjunto') { db.conjuntos.push({ id: uid('cj'), nombre: d.nombre, localidad: d.localidad, unidades: parseInt(d.unidades, 10), estado: 'En configuración', modulos: { reservas: true, cartera: false, certificados: false, parqueaderos: false, arriendos: false, visitantes: true, pqr: true, comunicados: true } }); ok('Conjunto creado.'); }
    guardar(); render();
  });

  window.addEventListener('hashchange', render);
  window.ConjuntaDemo = { reiniciar: function () { db = semilla(); guardar(); render(); } };
  render();
})();
