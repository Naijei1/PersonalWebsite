try {
  var stored = localStorage.getItem('theme')
  if (stored !== 'light') document.documentElement.classList.add('dark')
} catch (error) {
  document.documentElement.classList.add('dark')
}
