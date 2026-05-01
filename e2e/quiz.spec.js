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
    await expect(page.getByTestId('quiz-question-1')).toBeVisible();
    await page.getByTestId('quiz-option-1').click(); // Just click second option as it's dynamic now
    await expect(page.locator('text=Explanation:')).toBeVisible();
    await page.click('button:has-text("Next Question")');

    // Question 2
    await expect(page.getByTestId('quiz-question-2')).toBeVisible();
    await page.getByTestId('quiz-option-1').click();
    await expect(page.locator('text=Explanation:')).toBeVisible();
    await page.click('button:has-text("See Results")');

    // Results
    await expect(page.locator('h2:has-text("Quiz Results")')).toBeVisible();
  });
});
