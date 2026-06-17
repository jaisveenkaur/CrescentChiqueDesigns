# Crescent Chique Designs — Seeded Login Credentials

The following credentials have been initialized in the development database via `scripts/seed_db.py` for testing portal interfaces and system roles:

| Name | Role | Email Address | Default Password |
| :--- | :--- | :--- | :--- |
| **Chief Administrator** | `admin` | `admin@crescentchique.com` | `CCAdmin2026!` |
| **John Doe** | `customer` | `john.doe@gmail.com` | `JohnDoe2026!` |

---

### Verification Summary
* **Active Database Engine**: MySQL (`crescent_chique_db` on local port `3306`)
* **admin@crescentchique.com** existence: **Verified** (role: `admin`)
* **john.doe@gmail.com** existence: **Verified** (role: `customer`)
* **jaisveen@gmail.com** existence: **No** (the seeded customer account is `john.doe@gmail.com`)
