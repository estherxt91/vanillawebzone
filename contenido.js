/* ============================================================
   VANILLA UNICORN · CONTENIDO DE LA WEB
   Edita este archivo para cambiar noticias, eventos, carnets,
   horarios y equipo. Guarda y la web se actualiza en 1 o 2 minutos.
   ============================================================ */

/* Estado del club.
   modo: "auto"  -> sigue el horario de abajo
         "open"  -> abierto, sin mirar el horario
         "closed"-> cerrado, sin mirar el horario
   mensaje: texto opcional que sale en el cartel de la cabecera. */
const ESTADO = { modo: "auto", mensaje: "" };

/* Enlace de webhook de Discord (opcional). Si lo rellenas, cada pedido de
   carnet llega solo al canal que elijas. Cualquiera que lea el codigo de la
   web puede ver este enlace, asi que usa un canal privado solo del staff. */
const DISCORD_WEBHOOK = "";

/* ============ CONTENIDO EDITABLE ============
   Para cambiar la web, edita estas listas. La primera noticia sale grande. */
const SEMANA = "Semana 46 · 9 al 15 de noviembre";

const NOTICIAS = [
  { tag: "Gran noche", fecha: "Sábado 14 nov", titulo: "Noche de neón con DJ invitado", texto: "Este sábado la pista se llena de luz. Concurso de outfit con premio de 500 $ para el mejor look, sesión de DJ hasta las 04:00 y la barra lanza el cóctel «Unicornio Rosa» por tiempo limitado." },
  { tag: "Carnet", fecha: "Desde hoy", titulo: "Nuevo carnet Black", texto: "Acceso a la zona reservada, una copa de bienvenida cada noche y reserva de mesa sin coste." },
  { tag: "Equipo", fecha: "11 nov", titulo: "Buscamos camareros y artistas", texto: "Abrimos casting de artistas el jueves y entrevistas para barra durante toda la semana." },
  { tag: "Aviso", fecha: "10 nov", titulo: "El lunes seguimos cerrados", texto: "Aprovechamos para renovar las luces de la pista. Volvemos el martes con karaoke." }
];

const EVENTOS = [
  { dia: 2, dnombre: "Martes", titulo: "Noche de karaoke", texto: "Micrófono abierto. El público vota el mejor show y se lleva el bote de la noche.", hora: "21:30" },
  { dia: 4, dnombre: "Jueves", titulo: "Concurso de talento", texto: "Baile, canto o humor delante del jurado. Inscripción en barra hasta las 22:00.", hora: "22:00" },
  { dia: 5, dnombre: "Viernes", titulo: "DJ Night", texto: "Sesión con DJ invitado y barra de cócteles de autor.", hora: "23:00" },
  { dia: 6, dnombre: "Sábado", titulo: "Noche temática", texto: "Neón, años 80 o disfraces. Concurso de outfit con premio en metálico.", hora: "22:30" },
  { dia: 0, dnombre: "Domingo", titulo: "Gala VIP mensual", texto: "Evento por invitación para titulares de carnet. Cena, espectáculo y sorteo.", hora: "22:00" },
  { dia: 3, dnombre: "Miércoles", titulo: "Casting de artistas", texto: "Pruebas abiertas para actuar en el club. Trae tu número preparado.", hora: "21:30" }
];

const CARNETS = [
  { id: "rosa",  nombre: "Rosa",  precio: 1500, perks: "Entrada sin cola y 10 % en barra", clase: "" },
  { id: "gold",  nombre: "Gold",  precio: 4000, perks: "Todo lo anterior, mesa reservada y copa de bienvenida", clase: "gold" },
  { id: "black", nombre: "Black", precio: 9000, perks: "Zona reservada, copas incluidas y acceso a la gala VIP", clase: "black" }
];

/* Horario en minutos desde las 00:00. Un cierre mayor que 1440 es ya la madrugada del día siguiente. */
const HORARIO = {
  0: { open: 22 * 60, close: 26 * 60, nota: "Solo con evento" },
  1: null,
  2: { open: 21 * 60, close: 24 * 60 + 30 },
  3: { open: 21 * 60, close: 24 * 60 + 30 },
  4: { open: 21 * 60, close: 24 * 60 + 30 },
  5: { open: 21 * 60, close: 27 * 60 },
  6: { open: 20 * 60 + 30, close: 28 * 60 }
};

const EQUIPO = [
  { n: "[Nombre 1]", r: "Dirección", h: "21:00–01:00" },
  { n: "[Nombre 2]", r: "Gerencia", h: "20:30–00:30" },
  { n: "[Nombre 3]", r: "Barra", h: "22:00–01:00" },
  { n: "[Nombre 4]", r: "DJ", h: "Según evento" },
  { n: "[Nombre 5]", r: "Seguridad", h: "21:30–00:30" }
];
/* ============ FIN DEL CONTENIDO EDITABLE ============ */
