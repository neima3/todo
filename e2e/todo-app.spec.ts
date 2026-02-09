import { test, expect } from '@playwright/test';

// Clear localStorage before each test for clean state
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('h1');
});

test.describe('Inbox Page', () => {
  test('shows empty inbox state', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Inbox' })).toBeVisible();
    await expect(page.getByText('All clear!')).toBeVisible();
    await expect(page.getByText('Add your first task')).toBeVisible();
  });

  test('shows filter bar', async ({ page }) => {
    await expect(page.getByPlaceholder('Filter tasks...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Filter' })).toBeVisible();
  });
});

test.describe('Quick Add (Q key)', () => {
  test('opens quick add dialog with Q key', async ({ page }) => {
    await page.keyboard.press('q');
    await expect(page.getByPlaceholder('What needs to be done?')).toBeVisible();
  });

  test('adds a basic task', async ({ page }) => {
    await page.keyboard.press('q');
    await page.getByPlaceholder('What needs to be done?').fill('Test task');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Test task')).toBeVisible();
  });

  test('parses NLP - date and priority', async ({ page }) => {
    await page.keyboard.press('q');
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Buy milk tomorrow p1');

    // Check NLP detection preview
    await expect(page.getByText('Detected:')).toBeVisible();
    await expect(page.getByText(/P1/)).toBeVisible();

    await page.keyboard.press('Enter');
    await expect(page.getByText('Buy milk')).toBeVisible();
  });

  test('parses NLP - labels with @', async ({ page }) => {
    await page.keyboard.press('q');
    await page.getByPlaceholder('What needs to be done?').fill('Fix bug @urgent');
    await expect(page.getByText('urgent', { exact: false })).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Fix bug')).toBeVisible();
    await expect(page.getByText('urgent')).toBeVisible();
  });

  test('parses NLP - recurring tasks', async ({ page }) => {
    await page.keyboard.press('q');
    await page.getByPlaceholder('What needs to be done?').fill('Stand-up every day');
    await expect(page.getByText('daily')).toBeVisible();
  });

  test('closes with Escape', async ({ page }) => {
    await page.keyboard.press('q');
    await expect(page.getByPlaceholder('What needs to be done?')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByPlaceholder('What needs to be done?')).not.toBeVisible();
  });
});

test.describe('Keyboard Shortcuts', () => {
  test('? opens keyboard shortcuts overlay', async ({ page }) => {
    await page.keyboard.press('Shift+?');
    await expect(page.getByRole('heading', { name: 'Keyboard Shortcuts' })).toBeVisible();
    await expect(page.getByText('Quick add task')).toBeVisible();
    await expect(page.getByText('Open command palette')).toBeVisible();
  });

  test('shortcuts overlay closes with Escape', async ({ page }) => {
    await page.keyboard.press('Shift+?');
    await expect(page.getByRole('heading', { name: 'Keyboard Shortcuts' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'Keyboard Shortcuts' })).not.toBeVisible();
  });

  test('Cmd+K opens command palette', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await expect(page.getByPlaceholder('Search tasks, navigate, or take action...')).toBeVisible();
  });

  test('G then I navigates to inbox', async ({ page }) => {
    await page.goto('/today');
    await page.waitForSelector('h1');
    await page.keyboard.press('g');
    await page.keyboard.press('i');
    await expect(page).toHaveURL('/');
  });

  test('G then T navigates to today', async ({ page }) => {
    await page.keyboard.press('g');
    await page.keyboard.press('t');
    await expect(page).toHaveURL('/today');
  });

  test('G then U navigates to upcoming', async ({ page }) => {
    await page.keyboard.press('g');
    await page.keyboard.press('u');
    await expect(page).toHaveURL('/upcoming');
  });
});

test.describe('Task Actions', () => {
  test.beforeEach(async ({ page }) => {
    // Add a test task
    await page.keyboard.press('q');
    await page.getByPlaceholder('What needs to be done?').fill('Task to test');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Task to test')).toBeVisible();
  });

  test('completes a task with checkbox', async ({ page }) => {
    const checkbox = page.getByRole('checkbox').first();
    await checkbox.click();
    // Wait for completion animation
    await page.waitForTimeout(500);
    await expect(page.getByText('Completed (1)')).toBeVisible();
  });

  test('shows undo toast on completion', async ({ page }) => {
    const checkbox = page.getByRole('checkbox').first();
    await checkbox.click();
    await expect(page.getByText('"Task to test" completed')).toBeVisible();
    await expect(page.getByText('Undo')).toBeVisible();
  });

  test('shows task actions on hover', async ({ page }) => {
    const task = page.getByText('Task to test');
    await task.hover();
    // Should see edit and more actions buttons
    await expect(page.getByRole('button', { name: 'Add subtask' }).or(page.locator('[title="Add subtask"]'))).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('sidebar shows all navigation items', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Inbox/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Today' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Upcoming' })).toBeVisible();
  });

  test('navigates to Today page', async ({ page }) => {
    await page.getByRole('link', { name: 'Today' }).click();
    await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible();
  });

  test('navigates to Upcoming page', async ({ page }) => {
    await page.locator('a[href="/upcoming"]').click();
    await expect(page).toHaveURL('/upcoming');
    await expect(page.getByRole('heading', { name: 'Upcoming', exact: true })).toBeVisible();
  });
});

test.describe('Projects', () => {
  test('creates a new project', async ({ page }) => {
    await page.getByRole('button', { name: 'Add project' }).first().click();
    await expect(page.getByPlaceholder('Project name')).toBeVisible();
    await page.getByPlaceholder('Project name').fill('My Project');
    await page.getByRole('button', { name: 'Add project' }).last().click();
    await expect(page.getByText('My Project')).toBeVisible();
  });
});

test.describe('Labels', () => {
  test('creates a new label', async ({ page }) => {
    await page.getByRole('button', { name: 'Add label' }).first().click();
    await expect(page.getByPlaceholder('Label name')).toBeVisible();
    await page.getByPlaceholder('Label name').fill('important');
    await page.getByRole('button', { name: 'Add label' }).last().click();
    await expect(page.getByText('important')).toBeVisible();
  });
});

test.describe('Task Filter', () => {
  test.beforeEach(async ({ page }) => {
    // Add multiple tasks
    await page.keyboard.press('q');
    await page.getByPlaceholder('What needs to be done?').fill('High priority task p1');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    await page.keyboard.press('q');
    await page.getByPlaceholder('What needs to be done?').fill('Low priority task');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
  });

  test('filters tasks by text search', async ({ page }) => {
    await page.getByPlaceholder('Filter tasks...').fill('High');
    await expect(page.getByText('High priority task')).toBeVisible();
    await expect(page.getByText('Low priority task')).not.toBeVisible();
  });

  test('shows filter count', async ({ page }) => {
    await page.getByPlaceholder('Filter tasks...').fill('High');
    await expect(page.getByText('1 task found')).toBeVisible();
  });

  test('clears filter', async ({ page }) => {
    await page.getByPlaceholder('Filter tasks...').fill('High');
    await page.getByText('Clear').click();
    await expect(page.getByText('High priority task')).toBeVisible();
    await expect(page.getByText('Low priority task')).toBeVisible();
  });
});

test.describe('Theme', () => {
  test('can switch between dark and light themes', async ({ page }) => {
    // Emulate dark color scheme preference and force dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
    });
    await page.reload();
    await page.waitForSelector('h1');
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Toggle theme using the button (need force due to dev overlay at bottom)
    const btn = page.getByRole('button', { name: 'Toggle theme' });
    await btn.click({ force: true });
    await expect(page.locator('html')).toHaveClass(/light/);
  });
});
