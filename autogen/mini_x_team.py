from __future__ import annotations
import os, json, sys, pathlib, shutil, subprocess, textwrap

# Optional: point to repo root
ROOT = pathlib.Path(__file__).resolve().parents[1]

def ensure_repo_root():
    if not (ROOT / 'package.json').exists():
        print('Run this script from the repo (contains package.json).', file=sys.stderr)
        sys.exit(1)

def load_llm_config():
    cfgp = pathlib.Path(__file__).parent / 'config.json'
    with open(cfgp, 'r', encoding='utf-8') as f:
        return json.load(f)

def main():
    ensure_repo_root()
    cfg = load_llm_config()
    try:
        import autogen
    except Exception as e:
        print('Please install AutoGen: pip install -r autogen/requirements.txt')
        raise

    llm = autogen.OpenAIWrapper(**cfg['openai'])

    # System prompts
    SYSTEM_ARCH = (
        'You are the Architect. Produce minimal, production-ready Next.js 14 plans and file diffs. '
        'Respect repo structure, keep diffs small, run eslint/prettier mentally before output.'
    )
    SYSTEM_CODER = (
        'You are the Coder. You write TypeScript and React code for Next.js App Router, with Prisma and NextAuth. '
        'You ONLY output unified diffs starting with paths from repo root. No explanations. '
        'Keep UI simple, tailwind classes minimal.'
    )

    architect = autogen.AssistantAgent('Architect', system_message=SYSTEM_ARCH, llm_config={'config_list':[cfg['openai']]})
    coder = autogen.AssistantAgent('Coder', system_message=SYSTEM_CODER, llm_config={'config_list':[cfg['openai']]})
    user_proxy = autogen.UserProxyAgent('You', human_input_mode='ALWAYS')

    autogen.register_function(
        function_map={
            'apply_patch': apply_patch,
            'run_cmd': run_cmd,
            'read_file': read_file,
        }
    )

    # High-level task
    task = textwrap.dedent('''    We have a working mini X app. Goal: add one improvement with tight scope.
    Examples: (1) Add user @handles to User model and display next to names. 
    (2) Add /api/health endpoint and a status card on Home.
    (3) Add optimistic like/repost UI counters with rollback on error.
    Choose ONE, propose a short plan, then produce diffs touching <= 3 files.
    After patch, call run_cmd("pnpm lint") and report success or fix lint issues.
    ''')

    user_proxy.initiate_chat(architect, message=task, recipient=coder)

def apply_patch(patch: str):
    """Apply a unified diff (git-style) to the repo."""
    import subprocess, tempfile
    tmp = tempfile.NamedTemporaryFile(delete=False, mode='w', encoding='utf-8')
    tmp.write(patch)
    tmp.close()
    try:
        subprocess.check_call(['git', 'apply', '--reject', '--whitespace=fix', tmp.name], cwd=str(ROOT))
        return 'Patch applied'
    except subprocess.CalledProcessError as e:
        return f'Patch failed: {e}'

def run_cmd(cmd: str):
    return subprocess.getoutput(cmd)

def read_file(path: str):
    p = ROOT / path
    if not p.exists(): return 'NOT_FOUND'
    return p.read_text(encoding='utf-8')

if __name__ == '__main__':
    main()
