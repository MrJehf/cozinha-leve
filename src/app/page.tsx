import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Cozinha Leve</h1>
        <p>Receitas deliciosas e saudáveis para você.</p>
        <div style={{ marginTop: '20px' }}>
             <button style={{ padding: '10px 20px', fontSize: '1.2rem', cursor: 'pointer' }}>
                Ver Receitas
             </button>
        </div>
      </main>
    </div>
  );
}
