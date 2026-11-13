"""Contrato estatico de deploy Oracle via SSH (sem acessar a VM)."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[2]
WORKFLOW = (ROOT / ".github/workflows/deploy.yml").read_text(encoding="utf-8")
REMOTE = (ROOT / "deploy/oracle/atualizar-frontend.sh").read_text(encoding="utf-8")

class DirectSshDeployment(unittest.TestCase):
    def test_push_main_deploy_without_flag_gate(self):
        for item in ("branches: [main]", "github.ref == 'refs/heads/main'",
                     "github.event_name == 'workflow_dispatch' && inputs.deploy == true",
                     "github.event_name == 'push'"):
            self.assertIn(item, WORKFLOW)
        self.assertNotIn("vars.OCI_DEPLOY_ENABLED", WORKFLOW)
        self.assertNotIn("vars.OCI_AUTO_DEPLOY_ENABLED", WORKFLOW)
        self.assertIn("FRONTEND_NGINX_LOCAL_HTTP=200", WORKFLOW)
        self.assertIn("FRONTEND_EXTERNAL_HTTP=", WORKFLOW)
        self.assertIn("http://127.0.0.1/", WORKFLOW)

    def test_ci_before_archive_and_deploy(self):
        for item in ("npm ci", "npm run test:session", "npm run lint",
                     "npm run build", "tar -czf frontend.tar.gz -C dist ."):
            self.assertIn(item, WORKFLOW)
        self.assertLess(WORKFLOW.index("npm run lint"), WORKFLOW.index("tar -czf"))

    def test_only_pinned_ssh_secrets(self):
        for item in ("secrets.OCI_SSH_PRIVATE_KEY", "secrets.OCI_SSH_KNOWN_HOSTS",
                     "vars.OCI_SSH_HOST", "vars.OCI_SSH_USER",
                     "StrictHostKeyChecking=yes", "BatchMode=yes",
                     "IdentityAgent=none", "3zV6jlZeYgt19xz4h0KrumznEr3SNlyAEiolj+XrmO8"):
            self.assertIn(item, WORKFLOW)
        self.assertNotIn("ssh-keyscan", WORKFLOW)
        self.assertNotIn("StrictHostKeyChecking=no", WORKFLOW)
        self.assertNotIn("secrets.VM_SSH_KEY", WORKFLOW)

    def test_remote_script_transmitted_and_backup_restored(self):
        self.assertIn("< deploy/oracle/atualizar-frontend.sh", WORKFLOW)
        self.assertNotIn("ssh -n -o", WORKFLOW)
        for item in ("sha256sum -c --status", "nginx -t", "restorecon",
                     "tarfile.open", "member.isfile()", "member.isdir()",
                     "BACKUP=", "TARGET_MOVED=1", "mv -- \"$BACKUP\" \"$TARGET\""):
            self.assertIn(item, REMOTE)
        self.assertIn('find "$STAGE" -type d -exec chmod 0755 {} +', REMOTE)
        self.assertIn('find "$STAGE" -type f -exec chmod 0644 {} +', REMOTE)
        self.assertIn('find "$TARGET" -type d -exec chmod 0755 {} +', REMOTE)
        self.assertIn("HTTP_LOCAL=", REMOTE)
        self.assertIn("acionando rollback", REMOTE)
        self.assertNotIn("git reset --hard", REMOTE)
        self.assertNotIn("pg_restore", REMOTE)

    def test_frontend_readonly_preflight_exists(self):
        preflight = (ROOT / ".github/workflows/oracle-frontend-preflight.yml").read_text(encoding="utf-8")
        for item in ("workflow_dispatch:", "environment: oracle-production",
                     "SSH_RSA_OK", "SSH_EXIT=0",
                     "FRONTEND ORACLE PREFLIGHT: PASS",
                     "StrictHostKeyChecking=yes", "sudo -n nginx -t"):
            self.assertIn(item, preflight)
        for forbidden in ("systemctl restart", "pg_restore", "sudo tee", "scp "):
            self.assertNotIn(forbidden, preflight)

if __name__ == "__main__":
    unittest.main()
