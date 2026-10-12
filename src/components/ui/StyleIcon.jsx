const paths = {
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  food: 'M4 8h16l-2 12H6z M9 8V6a3 3 0 0 1 6 0v2',
  requests: 'M8 3H5v18h14V3h-3 M9 2h6v4H9z M8 11h8 M8 15h6',
  people: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  shield: 'M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z M8 12l3 3 5-6',
  exit: 'M9 21H3V3h6 M14 8l5 4-5 4 M8 12h11',
  arrow: 'M4 12h16 M14 6l6 6-6 6',
  search: 'M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14 M15 15l6 6',
  plus: 'M12 5v14 M5 12h14',
  leaf: 'M20 3C9 2 3 7 5 14c2 7 13 6 15-11z M4 21L15 10',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
};
export default function Icon({ name, size = 20, ...props }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name] || paths.food} /></svg>;
}
