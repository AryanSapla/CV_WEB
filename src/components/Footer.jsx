export default function Footer({ name }) {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <p>
        © {year} {name}. Crafted as a personal professional profile.
      </p>
    </footer>
  );
}
