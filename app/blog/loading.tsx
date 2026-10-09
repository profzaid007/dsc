import styles from "./blog.module.css"

export default function Loading() {
  return (
    <div
      className={styles.page}
      aria-busy="true"
      aria-label="Loading articles / جارٍ تحميل المقالات"
    >
      <div className={styles.hero} />
      <div className={styles.layout}>
        <div className={styles.latest}>
          <div className={styles.empty}>
            <p>Loading articles… / جارٍ تحميل المقالات…</p>
          </div>
        </div>
        <aside className={styles.sidebar}>
          <div className={styles.panel}>
            <div className={styles.empty} />
          </div>
        </aside>
      </div>
    </div>
  )
}
