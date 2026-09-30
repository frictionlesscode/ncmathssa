import { describe, it, expect } from 'vitest';
import ci from '../.github/workflows/ci.yml?raw';
import deploy from '../.github/workflows/deploy.yml?raw';

describe('deploy gate (logic-flows Process)', () => {
  it('CI is named CI, so deploy can depend on it', () => {
    expect(ci).toMatch(/^name: CI$/m);
  });

  it('deploy runs only after CI completes on master, never directly on push', () => {
    expect(deploy).toMatch(/workflow_run:/);
    expect(deploy).toMatch(/workflows: \["CI"\]/);
    expect(deploy).toMatch(/types: \[completed\]/);
    expect(deploy).toMatch(/branches: \[master\]/);
    expect(deploy).not.toMatch(/^\s{2}push:/m);
    expect(deploy).not.toMatch(/workflow_dispatch/);
  });

  it('only a successful CI run builds, and it builds the tested commit', () => {
    expect(deploy).toMatch(/github\.event\.workflow_run\.conclusion == 'success'/);
    expect(deploy).toMatch(/ref: \$\{\{ github\.event\.workflow_run\.head_sha \}\}/);
  });

  it('logic-flows Process: deploys only for CI runs triggered by a push, never a pull request', () => {
    expect(deploy).toMatch(
      /github\.event\.workflow_run\.conclusion == 'success' && github\.event\.workflow_run\.event == 'push'/,
    );
  });

  it('a skipped build also skips deploy', () => {
    expect(deploy).toMatch(/deploy:\r?\n\s+needs: build/);
  });
});
