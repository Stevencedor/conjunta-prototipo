# Conjunta — prototipo funcional (v0.8)

Prototipo de **Conjunta**, una plataforma web para la gestión integral de conjuntos residenciales en Bogotá D. C.: residentes e inmuebles, reservas de zonas comunes, pagos y cartera, certificados de paz y salvo, parqueaderos, inmuebles en arriendo, control de acceso de visitantes y PQR con trazabilidad.

Proyecto de modalidad de grado (emprendimiento) — Ingeniería de Software, Universidad de La Salle, 2026.

> Todos los datos del prototipo son **ficticios**. La pasarela de pagos es simulada y no procesa dinero real.

## Demo en línea

**https://stevencedor.github.io/conjunta-prototipo/**

Perfiles de demostración: Administración, Propietario, Arrendatario, Seguridad y Superadministrador.

Enlaces directos a estados de demostración:

| Vista | Enlace |
|---|---|
| Panel de administración | [`#/dashboard?as=admin`](https://stevencedor.github.io/conjunta-prototipo/#/dashboard?as=admin) |
| Reserva rechazada por cruce de horario | [`#/reservar?as=propietario&reserva=choque`](https://stevencedor.github.io/conjunta-prototipo/#/reservar?as=propietario&reserva=choque) |
| Pasarela de pagos simulada | [`#/pagos?as=arrendatario&pagar=1`](https://stevencedor.github.io/conjunta-prototipo/#/pagos?as=arrendatario&pagar=1) |
| Certificado de paz y salvo | [`#/certificados?as=propietario`](https://stevencedor.github.io/conjunta-prototipo/#/certificados?as=propietario) |
| Verificación de visitas en portería | [`#/porteria?as=seguridad&codigo=demo`](https://stevencedor.github.io/conjunta-prototipo/#/porteria?as=seguridad&codigo=demo) |
| Acceso denegado por rol (RBAC) | [`#/residentes?as=propietario`](https://stevencedor.github.io/conjunta-prototipo/#/residentes?as=propietario) |

Los cambios se guardan en el navegador. Para restablecer los datos, ejecute `ConjuntaDemo.reiniciar()` en la consola.

## Ejecutar localmente

Abra `index.html` en un navegador (Chrome, Edge o Firefox). No requiere instalación ni servidor.

## Pruebas

```bash
node --test pruebas/pruebas.test.js
```

Requiere Node.js 18 o superior. Resultado al 7 de noviembre de 2026: 13 de 13 casos aprobados.

## Estructura

- `js/logic.js`: reglas de negocio puras (roles, reservas, cartera, visitas, PQR y días hábiles).
- `js/app.js`: interfaz por rol y persistencia local.
- `css/styles.css`: estilos.
- `pruebas/pruebas.test.js`: casos de prueba automatizados.
