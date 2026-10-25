/**
 * Nombre de la cookie con el estado del menú (abierto o recogido). Vive aparte de sidebar.tsx
 * ("use client") para que el layout del servidor reciba el texto real y no una referencia.
 */
export const SIDEBAR_COOKIE_NAME = "sidebar_state";
