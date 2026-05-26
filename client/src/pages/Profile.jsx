function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.avatar}>
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>

        <h1 style={styles.title}>My Profile</h1>

        <div style={styles.row}>
          <span style={styles.label}>Name</span>
          <span style={styles.value}>{user?.name || "-"}</span>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Email</span>
          <span style={styles.value}>{user?.email || "-"}</span>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Role</span>
          <span style={styles.value}>{user?.role || "user"}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#050508",
    color: "white",
    padding: "120px 24px 40px",
    display: "flex",
    justifyContent: "center",
  },

  card: {
    width: "100%",
    maxWidth: "480px",
    background: "#1c1c1e",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "34px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
  },

  avatar: {
    width: "78px",
    height: "78px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #facc15, #f59e0b)",
    color: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    fontWeight: "900",
    marginBottom: "20px",
  },

  title: {
    marginBottom: "24px",
    fontSize: "28px",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    padding: "16px 0",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },

  label: {
    color: "rgba(255,255,255,0.5)",
    fontWeight: "700",
  },

  value: {
    color: "white",
    fontWeight: "700",
    textAlign: "right",
  },
};

export default Profile;