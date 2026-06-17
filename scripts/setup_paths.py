import os
import sys

# Resolve project root path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Inject project root into Python search path
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Resolve virtual environment site-packages dynamically and inject them
venv_lib = os.path.join(project_root, ".venv", "lib")
if os.path.exists(venv_lib):
    for d in os.listdir(venv_lib):
        if d.startswith("python"):
            sp = os.path.join(venv_lib, d, "site-packages")
            if os.path.exists(sp) and sp not in sys.path:
                sys.path.insert(0, sp)
