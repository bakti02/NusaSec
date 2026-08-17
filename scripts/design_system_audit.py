from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
TOKENS = ROOT / 'shared' / 'design-system' / 'tokens.css'

def main():
    text = TOKENS.read_text(encoding='utf-8')
    tokens = re.findall(r'--([\w-]+)\s*:', text)
    print(f'Found {len(tokens)} design tokens')
    for name in tokens:
        print(f'--{name}')

if __name__ == '__main__':
    main()
