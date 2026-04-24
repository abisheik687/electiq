import { test, expect } from '@playwright/test';

test.describe('Quiz Flow', () => {
  test('Completes the quiz successfully', async ({ page }) => {
    // Start at main page
    await page.goto('http://localhost:5173');
    
    // Switch to quiz tab
    await page.click('button:has-text("Knowledge Quiz")');
    
    // Verify quiz loaded
    await expect(page.locator('h2:has-text("Civic Knowledge Quiz")')).toBeVisible();

    // Question 1
    await expect(page.locator('h3:has-text("How does the Electoral College work?")')).toBeVisible();
    await page.click('button:has-text("Electors representing states vote for the president")');
    await expect(page.locator('text=Explanation:')).toBeVisible();
    await page.click('button:has-text("Next Question")');

    // Question 2
    await expect(page.locator('h3:has-text("What is a primary election?")')).toBeVisible();
    await page.click('button:has-text("An election to choose party candidates")');
    await expect(page.locator('text=Explanation:')).toBeVisible();
    await page.click('button:has-text("See Results")');

    // Results
    await expect(page.locator('h2:has-text("Quiz Results")')).toBeVisible();
    await expect(page.locator('text=You scored 2 out of 2')).toBeVisible();
  });
});
