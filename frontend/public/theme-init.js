(() => {
  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle(
    'dark',
    storedTheme === 'dark' || (storedTheme === null && prefersDark),
  );
})();
