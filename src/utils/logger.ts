const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m',
};

function timestamp(): string {
  return new Date().toLocaleTimeString('ru-RU', { hour12: false });
}

export const log = {
  step(current: number, total: number, message: string) {
    const t = total === Infinity ? '' : `/${total}`;
    console.log(`${COLORS.cyan}[Step ${current}${t}]${COLORS.reset} ${COLORS.gray}${timestamp()}${COLORS.reset} ${message}`);
  },

  thinking(message: string) {
    console.log(`${COLORS.yellow}  🧠 ${message}${COLORS.reset}`);
  },

  action(message: string) {
    console.log(`${COLORS.green}  → ${message}${COLORS.reset}`);
  },

  result(message: string) {
    console.log(`${COLORS.gray}    ${message}${COLORS.reset}`);
  },

  success(message: string) {
    console.log(`\n${COLORS.green}✓ ${message}${COLORS.reset}\n`);
  },

  error(message: string) {
    console.log(`\n${COLORS.red}✗ ${message}${COLORS.reset}\n`);
  },

  info(message: string) {
    console.log(`${COLORS.blue}  ℹ ${message}${COLORS.reset}`);
  },
};
