function Footer() {
  return (
    <footer style={{ 
      borderTop: '1px solid var(--color-border)', 
      padding: '24px 0', 
      marginTop: 'auto', 
      textAlign: 'center', 
      color: 'var(--color-text-secondary)', 
      fontSize: '14px' 
    }}>
      <div className="container">
        © {new Date().getFullYear()} Юг Белора Металл. Все права защищены.
      </div>
    </footer>
  )
}

export default Footer